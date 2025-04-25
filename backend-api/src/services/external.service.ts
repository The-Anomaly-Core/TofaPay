import { Service } from "../types";
import { logger } from "../utils/logger";

class ExternalService {
  async subscribeToService(userId: string, service: Service) {
    try {
      logger.info(`Subscribing to ${service.name} for user`, { userId });
      let metadata: Record<string, any> = {};
      switch (service.type) {
        case "subscription":
          metadata = { subscriptionId: `sub_${service.id}`, userId };
          logger.info(`Subscribed to ${service.name} for user ${userId}`);
          break;
        case "utility":
          metadata = { subscriptionId: `key_${service.id}`, userId };
          logger.info(`Subscribed to ${service.name} for user ${userId}`);
          break;

        default:
          throw new Error("Unsupported service type");
      }
      logger.info(`Mock subscription created for ${service.id}`, { userId, metadata });
      return { metadata };
    } catch (error) {
      logger.error(`Error subscribing to ${service.name}`, { error, userId });
      throw error;
    }
  }

  async cancelSubscription(userId: string, service: Service) {
    try {
      logger.info(`Canceling subscription for ${service.name}`, { userId });
      switch (service.type) {
        case "subscription":
        case "utility":
          logger.info(`Mock cancellation processed for ${service.id}`, { userId });
          break;
        default:
          throw new Error("Invalid service type");
      }
    } catch (error) {
      logger.error(`Error canceling subscription for ${service.name}`, { error, userId });
      throw error;
    }
  }
}

const externalService = new ExternalService();
export default externalService;
