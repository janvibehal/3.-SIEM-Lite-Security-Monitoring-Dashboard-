import { PrismaClient, Prisma } from "@prisma/client";

export class RuleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.DetectionRuleCreateInput) {
    return this.prisma.detectionRule.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.detectionRule.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return this.prisma.detectionRule.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: Prisma.DetectionRuleUpdateInput) {
    return this.prisma.detectionRule.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.detectionRule.delete({
      where: {
        id,
      },
    });
  }
}