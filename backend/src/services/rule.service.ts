import { DetectionRule, LogSeverity } from "@prisma/client";
import { RuleRepository } from "../repositories/rule.repository";

export class RuleService {
  constructor(private ruleRepository: RuleRepository) {}

  async createRule(data: {
    name: string;
    description?: string;
    eventType: string;
    threshold: number;
    timeWindow: number;
    severity: LogSeverity;
    enabled?: boolean;
  }): Promise<DetectionRule> {
    return this.ruleRepository.create({
      ...data,
      enabled: data.enabled ?? true,
    });
  }

  async getAllRules(): Promise<DetectionRule[]> {
    return this.ruleRepository.findAll();
  }

  async getRuleById(id: string): Promise<DetectionRule> {
    const rule = await this.ruleRepository.findById(id);

    if (!rule) {
      throw new Error("Detection rule not found.");
    }

    return rule;
  }

  async updateRule(
    id: string,
    data: {
      name?: string;
      description?: string;
      eventType?: string;
      threshold?: number;
      timeWindow?: number;
      severity?: LogSeverity;
      enabled?: boolean;
    }
  ): Promise<DetectionRule> {
    await this.getRuleById(id);

    return this.ruleRepository.update(id, data);
  }

  async deleteRule(id: string): Promise<DetectionRule> {
    await this.getRuleById(id);

    return this.ruleRepository.delete(id);
  }
}