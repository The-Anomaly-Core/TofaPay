import { Request, Response } from "express";
import userService from "../services/user.service";
import catalogService from "../services/catalog.service";

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
      return res.status(404).json({ error: "User not found" });
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
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
};

export const addService = async (req: Request, res: Response) => {
  const serviceData = req.body;
  try {
    const newService = await catalogService.addService(serviceData);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: "Failed to add service" });
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
