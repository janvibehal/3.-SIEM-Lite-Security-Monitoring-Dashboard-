import { z } from "zod";
import { isIP } from "node:net";
import { DeviceStatus, DeviceType } from "@prisma/client";

/**
 * Create Device
 */
export const createDeviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  hostname: z
    .string()
    .trim()
    .min(2, "Hostname is required.")
    .max(100, "Hostname cannot exceed 100 characters."),

  ipAddress: z
    .string()
    .trim()
    .refine((ip) => isIP(ip) === 4, {
      message: "Invalid IPv4 address.",
    }),

  deviceType: z.nativeEnum(DeviceType),
});

/**
 * Update Device
 */
export const updateDeviceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters.")
      .optional(),

    hostname: z
      .string()
      .trim()
      .min(2, "Hostname must be at least 2 characters.")
      .max(100, "Hostname cannot exceed 100 characters.")
      .optional(),

    ipAddress: z
      .string()
      .trim()
      .refine((ip) => isIP(ip) === 4, {
        message: "Invalid IPv4 address.",
      })
      .optional(),

    deviceType: z
      .nativeEnum(DeviceType)
      .optional(),

    status: z
      .nativeEnum(DeviceStatus)
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one field must be provided for update.",
    }
  );