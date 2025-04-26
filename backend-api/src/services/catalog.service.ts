import admin from "firebase-admin";
import { logger } from "../utils/logger";
import { Service } from "../types";

class CatalogService {
  async getAllServices(): Promise<Service[]> {
    try {
      const snapshot = await admin.firestore().collection("services").get();
      if (snapshot.empty) {
        console.warn("No services found in Firestore.");
        return [];
      }
      const services: Service[] = [];
      snapshot.docs.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() } as Service);
      });
      return services;
    } catch (error) {
      logger.error("Error fetching services from Firestore", { error });
      throw error;
    }
  }

  async getServiceById(serviceId: string): Promise<Service | null> {
    try {
      const doc = await admin.firestore().collection("services").doc(serviceId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as Service;
    } catch (error) {
      logger.error("Error fetching service from Firestore", { error, serviceId });
      throw error;
    }
  }

  async addService(serviceData: Omit<Service, "id">): Promise<Service> {
    try {
      const docRef = await admin.firestore().collection("services").add(serviceData);
      const service = { id: docRef.id, ...serviceData } as Service;
      logger.info("Service added successfully", { serviceId: service.id });
      return service;
    } catch (error) {
      logger.error("Error adding service to Firestore", { error });
      throw error;
    }
  }

  async updateService(serviceId: string, serviceData: Partial<Service>): Promise<Service | null> {
    try {
      const docRef = admin.firestore().collection("services").doc(serviceId);
      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }

      await docRef.update(serviceData);
      const updatedService = { id: serviceId, ...doc.data(), ...serviceData } as Service;
      logger.info("Service updated successfully", { serviceId });
      return updatedService;
    } catch (error) {
      logger.error("Error updating service in Firestore", { error, serviceId });
      throw error;
    }
  }

  async deleteService(serviceId: string): Promise<void> {
    try {
      const snapshot = await admin
        .firestore()
        .collection("users")
        .where("subscriptions.serviceId", "==", serviceId)
        .get();
      if (!snapshot.empty) {
        throw new Error("Cannot delete service with active subscriptions");
      }
      await admin.firestore().collection("services").doc(serviceId).delete();
      logger.info("Service deleted successfully", { serviceId });
    } catch (error) {
      logger.error("Error deleting service from Firestore", { error, serviceId });
      throw error;
    }
  }
}

const catalogService = new CatalogService();
export default catalogService;
