import { Request, Response } from "express";
import userService from "../services/user.service";
import catalogService from "../services/catalog.service";
import { Service } from "../types";
import { HttpError } from "../middleware/error.middleware";

export const getAllUsers = async (re: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await catalogService.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  try {
    const service = await catalogService.getServiceById(serviceId);
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
};

export const addService = async (req: Request, res: Response) => {
  try {
    const serviceData: Omit<Service, "id"> = req.body;
    if (
      !serviceData ||
      !serviceData.name ||
      !serviceData.price ||
      !serviceData.type ||
      !serviceData.billingCycle ||
      !serviceData.currency
    ) {
      throw new HttpError("Name, price, type, billingCycle, and currency are required", 400);
    }
    console.log("Service data:", serviceData);
    const service = await catalogService.addService(serviceData);
    res.status(201).json(service);
  } catch (error) {
    throw error;
  }
};

export const updateService = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const serviceData = req.body;
  try {
    const updatedService = await catalogService.updateService(serviceId, serviceData);
    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ error: "Failed to update service" });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  await catalogService.deleteService(req.params.serviceId);
  res.status(204).send();
};
