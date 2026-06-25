import { Request, Response, NextFunction } from "express";
import { LogService } from "../services/log.service";
import { LogSeverity, LogSource } from "@prisma/client";

export class LogController {
  constructor(private logService: LogService) {}

  ingestLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await this.logService.ingestLog({
        deviceId: req.body.deviceId,
        severity: req.body.severity as LogSeverity,
        source: req.body.source as LogSource,
        rawMessage: req.body.rawMessage,
        normalizedEvent: req.body.normalizedEvent,
        sourceIp: req.body.sourceIp,
        destinationIp: req.body.destinationIp,
        eventTimestamp: new Date(req.body.eventTimestamp),
        userId: req.user?.id,
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search Logs
   */
  getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.logService.searchLogs(
        {
          deviceId: req.query.deviceId as string | undefined,

          severity: req.query.severity as LogSeverity | undefined,

          source: req.query.source as LogSource | undefined,

          startDate: req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined,

          endDate: req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined,
        },
        {
          page: req.query.page ? Number(req.query.page) : undefined,

          limit: req.query.limit ? Number(req.query.limit) : undefined,

          sortBy:
            req.query.sortBy === "createdAt" ? "createdAt" : "eventTimestamp",

          order: req.query.order === "asc" ? "asc" : "desc",
        },
      );

      return res.status(200).json({
        success: true,
        pagination: result.pagination,
        data: result.logs,
      });
    } catch (error) {
      next(error);
    }
  };

  getLogById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await this.logService.getLogById(req.params.id);

      return res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  };

  getLogsByDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await this.logService.getLogsByDevice(req.params.deviceId);

      return res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  };
}
