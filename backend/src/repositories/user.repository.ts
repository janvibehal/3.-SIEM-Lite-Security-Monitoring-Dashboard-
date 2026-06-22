import { prisma } from "../config/database.config";

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  // Additional method to find user by tokenId
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  create(data: {
    email: string;
    username: string;
    passwordHash: string;
    organizationId: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  verifyEmail(userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
      },
    });
  }
}
