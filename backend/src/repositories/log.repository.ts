import {
  Prisma,
  LogSeverity,
  LogSource,
} from "@prisma/client";
import { prisma } from "../config/database.config";

export class LogRepository {
  create(data: {
    deviceId: string;
    severity: LogSeverity;
    source: LogSource;
    rawMessage: string;
    normalizedEvent?: string;
    sourceIp?: string;
    destinationIp?: string;
    eventTimestamp: Date;
  }) {
    return prisma.log.create({
      data,
    });
  }

  findById(id: string) {
    return prisma.log.findUnique({
      where: {
        id,
      },
      include: {
        device: true,
      },
    });
  }

  /**
   * Search logs with optional filters
   */
  async search(
  filters: {
    deviceId?: string;
    severity?: LogSeverity;
    source?: LogSource;
    startDate?: Date;
    endDate?: Date;
  },
  options: {
    page: number;
    limit: number;
    sortBy: "eventTimestamp" | "createdAt";
    order: "asc" | "desc";
  }
) {
  const where: Prisma.LogWhereInput = {
    ...(filters.deviceId && {
      deviceId: filters.deviceId,
    }),

    ...(filters.severity && {
      severity: filters.severity,
    }),

    ...(filters.source && {
      source: filters.source,
    }),

    ...(filters.startDate || filters.endDate
      ? {
          eventTimestamp: {
            ...(filters.startDate && {
              gte: filters.startDate,
            }),

            ...(filters.endDate && {
              lte: filters.endDate,
            }),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,

      include: {
        device: true,
      },

      skip: (options.page - 1) * options.limit,

      take: options.limit,

      orderBy: {
        [options.sortBy]: options.order,
      },
    }),

    prisma.log.count({
      where,
    }),
  ]);

  return {
    logs,
    total,
  };
}

  findByDevice(deviceId: string) {
    return prisma.log.findMany({
      where: {
        deviceId,
      },

      include: {
        device: true,
      },

      orderBy: {
        eventTimestamp: "desc",
      },
    });
  }

  update(
    id: string,
    data: Prisma.LogUpdateInput,
  ) {
    return prisma.log.update({
      where: {
        id,
      },
      data,
    });
  }

  delete(id: string) {
    return prisma.log.delete({
      where: {
        id,
      },
    });
  }
}

export const logRepository = new LogRepository();