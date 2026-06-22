import { prisma } from "../config/database.config";

export class RefreshTokenRepository {
  create(data: any) {
    return prisma.refreshToken.create({
      data,
    });
  }

  findByUserId(userId: string) {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
      },
    });
  }

  revoke(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: {
        isRevoked: true,
      },
    });
  }

  revokeAll(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: {
        isRevoked: true,
      },
    });
  }

  delete(id: string) {
    return prisma.refreshToken.delete({
      where: { id },
    });
  }
}
