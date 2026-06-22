import { AuditRepository } from "../repositories/audit.repository";

export class AuditService {
  constructor(
    private auditRepository = new AuditRepository(),
  ) {}

  async log(data: {
    userId?: string;
    action: string;
    resource?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    return this.auditRepository.create(data);
  }
}