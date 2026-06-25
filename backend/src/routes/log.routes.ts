import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";

import { LogController } from "../controllers/log.controller";
import { LogService } from "../services/log.service";

import { ingestLogSchema } from "../validators/log.validator";

const router = Router();

const logService = new LogService();
const logController = new LogController(logService);

/*
|--------------------------------------------------------------------------
| Log Ingestion
|--------------------------------------------------------------------------
*/

router.post(
  "/ingest",
  authenticate,
  authorize(Role.ADMIN, Role.OPERATOR),
  validate(ingestLogSchema),
  logController.ingestLog,
);

/*
|--------------------------------------------------------------------------
| Search Logs
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.OPERATOR,
    Role.ANALYST,
    Role.VIEWER,
  ),
  logController.getLogs,
);

/*
|--------------------------------------------------------------------------
| Get Log By ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.OPERATOR,
    Role.ANALYST,
    Role.VIEWER,
  ),
  logController.getLogById,
);

export default router;