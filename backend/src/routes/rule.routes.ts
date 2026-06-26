import { Router } from "express";

import { PrismaClient } from "@prisma/client";

import { RuleRepository } from "../repositories/rule.repository";
import { RuleService } from "../services/rule.service";
import { RuleController } from "../controllers/rule.controller";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createRuleSchema,
  updateRuleSchema,
} from "../validators/rule.validator";

const router = Router();

const prisma = new PrismaClient();

const repository = new RuleRepository(prisma);
const service = new RuleService(repository);
const controller = new RuleController(service);

router.post(
  "/",
  authenticate,
  validate(createRuleSchema),
  controller.createRule
);

router.get(
  "/",
  authenticate,
  controller.getAllRules
);

router.get(
  "/:id",
  authenticate,
  controller.getRuleById
);

router.patch(
  "/:id",
  authenticate,
  validate(updateRuleSchema),
  controller.updateRule
);

router.delete(
  "/:id",
  authenticate,
  controller.deleteRule
);

export default router;