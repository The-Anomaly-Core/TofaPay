export type SubscriptionType = "netflix" | "chatgpt" | "xai";

export interface User {
  id: string;
  phone: string;
  subscriptions?: Subscription[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  billingCycle: BillingCycle;
  type: ServiceType;
  active?: boolean;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  serviceId: string;
  startDate: string;
  endDate?: string;
  status: "active" | "cancelled" | "expired";
  metadata?: Record<string, any>;
}

export type ServiceType = "subscription" | "utility";
export type BillingCycle = "monthly" | "quarterly" | "yearly" | "one-time";
