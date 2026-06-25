import { z } from "zod";
import { isIP } from "node:net";
import {
  LogSeverity,
  LogSource,
} from "@prisma/client";

export const ingestLogSchema = z.object({
  deviceId: z
    .string()
    .uuid("Invalid device ID."),

  severity: z.nativeEnum(LogSeverity),

  source: z.nativeEnum(LogSource),

  rawMessage: z
    .string()
    .trim()
    .min(1, "Log message is required."),

  normalizedEvent: z
    .string()
    .trim()
    .optional(),

  sourceIp: z
    .string()
    .trim()
    .refine(
      (ip) => isIP(ip) === 4,
      {
        message: "Invalid IPv4 address.",
      }
    )
    .optional(),

  destinationIp: z
    .string()
    .trim()
    .refine(
      (ip) => isIP(ip) === 4,
      {
        message: "Invalid IPv4 address.",
      }
    )
    .optional(),

  eventTimestamp: z.coerce.date(),
});