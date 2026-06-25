-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LogSource" AS ENUM ('WINDOWS', 'LINUX', 'FIREWALL', 'APPLICATION', 'CLOUD', 'OTHER');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "severity" "LogSeverity" NOT NULL,
    "source" "LogSource" NOT NULL,
    "rawMessage" TEXT NOT NULL,
    "normalizedEvent" TEXT,
    "sourceIp" TEXT,
    "destinationIp" TEXT,
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
