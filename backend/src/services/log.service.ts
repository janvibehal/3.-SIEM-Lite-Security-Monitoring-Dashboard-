import { LogSeverity, LogSource } from "@prisma/client";

import { LogRepository } from "../repositories/log.repository";
import { DeviceRepository } from "../repositories/device.repository";
import { AuditRepository } from "../repositories/audit.repository";
import { normalizeLog } from "../normalization/logNormalizer";

export class LogService {
  private logRepository = new LogRepository();
  private deviceRepository = new DeviceRepository();
  private auditRepository = new AuditRepository();

  async ingestLog(data: {
    deviceId: string;
    severity: LogSeverity;
    source: LogSource;
    rawMessage: string;
    sourceIp?: string;
    destinationIp?: string;
    eventTimestamp: Date;
    userId?: string;
    ipAddress?: string;
  }) {
    // Verify device exists
    
    const device = await this.deviceRepository.findById(data.deviceId);

    if (!device) {
      throw new Error("Device not found.");
    }

    const normalizedEvent = normalizeLog(data.source, data.rawMessage);

    // Store log
    const log = await this.logRepository.create({
      deviceId: data.deviceId,
      severity: data.severity,
      source: data.source,
      rawMessage: data.rawMessage,
      normalizedEvent,
      sourceIp: data.sourceIp,
      destinationIp: data.destinationIp,
      eventTimestamp: data.eventTimestamp,
    });

    // Audit log
    await this.auditRepository.create({
      userId: data.userId,
      action: "LOG_INGESTED",
      resource: log.id,
      metadata: {
        deviceId: data.deviceId,
        severity: data.severity,
        source: data.source,
      },
      ipAddress: data.ipAddress,
    });

    return log;
  }

  async searchLogs(
    filters: {
      deviceId?: string;
      severity?: LogSeverity;
      source?: LogSource;
      startDate?: Date;
      endDate?: Date;
    },
    options?: {
      page?: number;
      limit?: number;
      sortBy?: "eventTimestamp" | "createdAt";
      order?: "asc" | "desc";
    },
  ) {
    const page = options?.page ?? 1;

    // Maximum page size = 100
    const limit = Math.min(options?.limit ?? 20, 100);

    const sortBy = options?.sortBy ?? "eventTimestamp";
    const order = options?.order ?? "desc";

    const { logs, total } = await this.logRepository.search(filters, {
      page,
      limit,
      sortBy,
      order,
    });

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLogById(id: string) {
    const log = await this.logRepository.findById(id);

    if (!log) {
      throw new Error("Log not found.");
    }

    return log;
  }

  async getLogsByDevice(deviceId: string) {
    return this.logRepository.findByDevice(deviceId);
  }

  async deleteLog(id: string) {
    const log = await this.logRepository.findById(id);

    if (!log) {
      throw new Error("Log not found.");
    }

    return this.logRepository.delete(id);
  }
}
