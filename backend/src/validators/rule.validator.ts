import { z } from "zod";
import { LogSeverity } from "@prisma/client";

export const createRuleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Rule name must be at least 3 characters.")
      .max(100),

    description: z
      .string()
      .max(500)
      .optional(),

    eventType: z
      .string()
      .min(1, "Event type is required."),

    threshold: z
      .number()
      .int()
      .min(1, "Threshold must be at least 1."),

    timeWindow: z
      .number()
      .int()
      .min(1, "Time window must be at least 1 minute."),

    severity: z.nativeEnum(LogSeverity),

    enabled: z
      .boolean()
      .optional(),
  }),
});

export const updateRuleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3)
      .max(100)
      .optional(),

    description: z
      .string()
      .max(500)
      .optional(),

    eventType: z
      .string()
      .optional(),

    threshold: z
      .number()
      .int()
      .min(1)
      .optional(),

    timeWindow: z
      .number()
      .int()
      .min(1)
      .optional(),

    severity: z
      .nativeEnum(LogSeverity)
      .optional(),

    enabled: z
      .boolean()
      .optional(),
  }),
});