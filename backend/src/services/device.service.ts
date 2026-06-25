import { DeviceType } from "@prisma/client";
import { DeviceRepository } from "../repositories/device.repository";
import { AuditRepository } from "../repositories/audit.repository";
import { DeviceStatus, DeviceType } from "@prisma/client";

export class DeviceService {
  constructor(
    private deviceRepository: DeviceRepository,
    private auditRepository: AuditRepository
  ) {}

  async createDevice(data: {
    name: string;
    hostname: string;
    ipAddress: string;
    deviceType: DeviceType;
    organizationId: string;
    createdById: string;
    userIp?: string;
  }) {
    // Check duplicate hostname
    const existingHostname = await this.deviceRepository.findByHostname(
      data.hostname,
      data.organizationId,
    );

    if (existingHostname) {
      throw new Error("Hostname already exists.");
    }

    // Check duplicate IP
    const existingIp = await this.deviceRepository.findByIp(
      data.ipAddress,
      data.organizationId,
    );

    if (existingIp) {
      throw new Error("IP address already exists.");
    }

    // Create device
    const device = await this.deviceRepository.create({
      name: data.name,
      hostname: data.hostname,
      ipAddress: data.ipAddress,
      deviceType: data.deviceType,
      organizationId: data.organizationId,
      createdById: data.createdById,
    });

    // Audit log
    await this.auditRepository.create({
      userId: data.createdById,
      action: "DEVICE_CREATED",
      resource: device.id,
      metadata: {
        hostname: device.hostname,
        ipAddress: device.ipAddress,
        deviceType: device.deviceType,
      },
      ipAddress: data.userIp,
    });

    return device;
  }

  async getDevices(organizationId: string) {
    return this.deviceRepository.findByOrganization(organizationId);
  }

  async getDeviceById(id: string, organizationId: string) {
    const device = await this.deviceRepository.findByIdAndOrganization(
      id,
      organizationId,
    );

    if (!device) {
      throw new Error("Device not found.");
    }

    return device;
  }

  async deleteDevice(id: string, organizationId: string) {
    const device = await this.deviceRepository.findByIdAndOrganization(
      id,
      organizationId,
    );

    if (!device) {
      throw new Error("Device not found.");
    }

    return this.deviceRepository.delete(id);
  }

  //updating device
  async updateDevice(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      hostname?: string;
      ipAddress?: string;
      deviceType?: DeviceType;
      status?: DeviceStatus;
      updatedById: string;
      userIp?: string;
    },
  ) {
    const device = await this.deviceRepository.findByIdAndOrganization(
      id,
      organizationId,
    );

    if (!device) {
      throw new Error("Device not found.");
    }

    if (data.hostname && data.hostname !== device.hostname) {
      const existingHostname = await this.deviceRepository.findByHostname(
        data.hostname,
        organizationId,
      );

      if (existingHostname) {
        throw new Error("Hostname already exists.");
      }
    }

    if (data.ipAddress && data.ipAddress !== device.ipAddress) {
      const existingIp = await this.deviceRepository.findByIp(
        data.ipAddress,
        organizationId,
      );

      if (existingIp) {
        throw new Error("IP address already exists.");
      }
    }

    const updatedDevice = await this.deviceRepository.update(id, {
      name: data.name,
      hostname: data.hostname,
      ipAddress: data.ipAddress,
      deviceType: data.deviceType,
      status: data.status,
    });

    await this.auditRepository.create({
      userId: data.updatedById,
      action: "DEVICE_UPDATED",
      resource: updatedDevice.id,
      metadata: {
        updatedFields: data,
      },
      ipAddress: data.userIp,
    });

    return updatedDevice;
  }
}

export const deviceService = new DeviceService();
