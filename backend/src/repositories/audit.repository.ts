import { prisma } from "../config/database.config";

export class AuditRepository {
  create(data: {
    userId?: string;
    action: string;
    resource?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    return prisma.auditLog.create({
      data,
    });
  }
}