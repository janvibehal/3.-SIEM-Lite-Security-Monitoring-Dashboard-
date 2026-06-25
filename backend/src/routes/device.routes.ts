import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createDeviceSchema,
  updateDeviceSchema,
} from "../validators/device.validator";

import { DeviceController } from "../controllers/device.controller";
import { DeviceService } from "../services/device.service";

const router = Router();

const deviceService = new DeviceService();
const deviceController = new DeviceController(deviceService);

// Create Device
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.OPERATOR),
  validate(createDeviceSchema),
  deviceController.createDevice,
);

// Get All Devices
router.get(
  "/",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.OPERATOR,
    Role.ANALYST,
    Role.VIEWER,
  ),
  deviceController.getDevices,
);

// Get Device By ID
router.get(
  "/:id",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.OPERATOR,
    Role.ANALYST,
    Role.VIEWER,
  ),
  deviceController.getDeviceById,
);

// Update Device
router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN, Role.OPERATOR),
  validate(updateDeviceSchema),
  deviceController.updateDevice,
);

// Delete Device
router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  deviceController.deleteDevice,
);

export default router;