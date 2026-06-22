import { prisma } from "../config/database.config";

export class EmailVerificationRepository {
  create(data: any) {
    return prisma.emailVerificationToken.create({
      data,
    });
  }

  findByUserId(userId: string) {
    return prisma.emailVerificationToken.findMany({
      where: {
        userId,
        used: false,
      },
    });
  }
  // Additional method to find unused tokens
  //
  findUnusedTokens() {
    return prisma.emailVerificationToken.findMany({
      where: {
        used: false,
      },
    });
  }

  markUsed(id: string) {
    return prisma.emailVerificationToken.update({
      where: { id },
      data: {
        used: true,
      },
    });
  }
}
