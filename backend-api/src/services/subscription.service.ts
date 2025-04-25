import { Service, Subscription, User } from "../types";
import { generateUniqueId } from "../utils/id_generator";
import { logger } from "../utils/logger";
import catalogService from "./catalog.service";
import externalService from "./external.service";
import userService from "./user.service";

class SubscriptionService {
  private userService: typeof userService;
  private catalogService: typeof catalogService;
  private externalService: typeof externalService;

  constructor() {
    this.userService = userService;
    this.catalogService = catalogService;
    this.externalService = externalService;
  }

  private async processPayment(userId: string, service: Service) {
    try {
      logger.info("Processing payment", { userId, service });

      return { success: true, message: "Payment processed successfully" };
    } catch (error) {
      logger.error("Error processing payment", { error, userId, service });
      throw error;
    }
  }

  private calculateEndDate(startDate: Date, billingCycle: string): Date {
    const endDate = new Date(startDate);
    switch (billingCycle) {
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        throw new Error("Invalid billing cycle");
    }
    return endDate;
  }

  async subscribeUser(userId: string, serviceId: string): Promise<User> {
    try {
      const service = await this.catalogService.getServiceById(serviceId);
      if (!service) {
        throw new Error("Service not found");
      }

      let user = await this.userService.getUserById(userId);
      if (!user) {
        user = { id: userId, phone: userId, subscriptions: [] };
        await this.userService.upsertUser(user);
      }

      if (
        user.subscriptions?.some((sub) => sub.serviceId === serviceId && sub.status === "active")
      ) {
        throw new Error(`User already subscribed to ${service.name}`);
      }

      // Make payment request to the payment gateway here
      const paymentResponse = await this.processPayment(userId, service);
      if (!paymentResponse.success) {
        throw new Error("Payment failed");
      }

      // Subscribe user to the service
      const subscriptionResult = await this.externalService.subscribeToService(userId, service);

      const startDate = new Date();
      let endDate: Date | undefined;
      if (service.billingCycle !== "one-time") {
        endDate = this.calculateEndDate(startDate, service.billingCycle);
      }

      const subscription: Subscription = {
        id: generateUniqueId(),
        serviceId,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        status: "active",
        metadata: subscriptionResult.metadata || {},
      };

      user.subscriptions = [...(user.subscriptions || []), subscription];
      await this.userService.upsertUser(user);

      logger.info("User subscribed successfully", { userId, service });
      return user;
    } catch (error) {
      logger.error("Failed to subscribe user", { error, userId, serviceId });
      throw error;
    }
  }

  async cancelSubscription(userId: string, serviceId: string): Promise<User> {
    try {
      const service = await catalogService.getServiceById(serviceId);
      if (!service) {
        throw new Error("Service not found");
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const subscription = user.subscriptions?.find(
        (sub) => sub.serviceId === serviceId && sub.status === "active"
      );
      if (!subscription) {
        throw new Error(`User not subscribed to ${service.name}`);
      }

      // Cancel subscription in the external service
      await this.externalService.cancelSubscription(userId, service);

      // Update subscription status to canceled
      user.subscriptions = user.subscriptions?.map((sub) =>
        sub.id === subscription.id ? { ...sub, status: "cancelled" as const } : sub
      );
      await this.userService.upsertUser(user);

      logger.info("Subscription canceled successfully", { userId, serviceId });
      return user;
    } catch (error) {
      logger.error("Failed to cancel subscription", { error, userId, serviceId });
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string): Promise<Record<string, Subscription | null>> {
    try {
      const user = await this.userService.getUserById(userId);
      const services = await this.catalogService.getAllServices();

      const subscriptions = services.reduce((acc, service) => {
        const subscription = user?.subscriptions?.find(
          (sub) => sub.serviceId === service.id && sub.status === "active"
        );
        if (subscription) {
          acc[service.id] = subscription;
        } else {
          acc[service.id] = null;
        }
        return acc;
      }, {} as Record<string, Subscription | null>);

      return subscriptions;
    } catch (error) {
      logger.error("Failed to get subscription status", { error, userId });
      throw error;
    }
  }
}
const subscriptionService = new SubscriptionService();
export default subscriptionService;
