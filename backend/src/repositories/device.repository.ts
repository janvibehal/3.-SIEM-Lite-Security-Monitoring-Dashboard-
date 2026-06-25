import { Prisma, DeviceType } from "@prisma/client";
import { prisma } from "../config/database.config";

export class DeviceRepository {
  create(data: {
    name: string;
    hostname: string;
    ipAddress: string;
    deviceType: DeviceType;
    organizationId: string;
    createdById: string;
  }) {
    return prisma.device.create({
      data,
    });
  }

  findById(id: string) {
    return prisma.device.findUnique({
      where: {
        id,
      },
    });
  }

  findByOrganization(organizationId: string) {
    return prisma.device.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findByHostname(hostname: string, organizationId: string) {
    return prisma.device.findFirst({
      where: {
        hostname,
        organizationId,
      },
    });
  }

  findByIp(ipAddress: string, organizationId: string) {
    return prisma.device.findFirst({
      where: {
        ipAddress,
        organizationId,
      },
    });
  }

  findByIdAndOrganization(id: string, organizationId: string) {
    return prisma.device.findFirst({
      where: {
        id,
        organizationId,
      },
    });
  }

  update(id: string, data: Prisma.DeviceUpdateInput) {
    return prisma.device.update({
      where: {
        id,
      },
      data,
    });
  }

  delete(id: string) {
    return prisma.device.delete({
      where: {
        id,
      },
    });
  }

  update(id: string, data: Prisma.DeviceUpdateInput) {
    return prisma.device.update({
      where: {
        id,
      },
      data,
    });
  }
}

export const deviceRepository = new DeviceRepository();
