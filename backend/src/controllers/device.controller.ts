import { Request, Response, NextFunction } from "express";
import { DeviceService } from "../services/device.service";
import { DeviceType } from "@prisma/client";

export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  createDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device = await this.deviceService.createDevice({
        name: req.body.name,
        hostname: req.body.hostname,
        ipAddress: req.body.ipAddress,
        deviceType: req.body.deviceType as DeviceType,
        organizationId: req.user.organizationId,
        createdById: req.user.id,
        userIp: req.ip,
      });

      return res.status(201).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  };

  getDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const devices = await this.deviceService.getDevices(
        req.user.organizationId,
      );

      return res.status(200).json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  };

  getDeviceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device = await this.deviceService.getDeviceById(
        req.params.id,
        req.user.organizationId,
      );

      return res.status(200).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deviceService.deleteDevice(
        req.params.id,
        req.user.organizationId,
      );

      return res.status(200).json({
        success: true,
        message: "Device deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  };

  updateDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device = await this.deviceService.updateDevice(
        req.params.id,
        req.user.organizationId,
        {
          ...req.body,
          updatedById: req.user.id,
          userIp: req.ip,
        },
      );

      return res.status(200).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  };
}
