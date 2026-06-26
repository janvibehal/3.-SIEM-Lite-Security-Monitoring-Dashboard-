// src/normalization/logNormalizer.ts

import { LogSource } from "@prisma/client";

import { normalizeLinuxLog } from "./linuxNormalizer";
import { normalizeWindowsLog } from "./windowsNormalizer";
import { normalizeFirewallLog } from "./firewallNormalizer";
import { normalizeApplicationLog } from "./applicationNormalizer";

export function normalizeLog(
  source: LogSource,
  rawMessage: string
): string {
  switch (source) {
    case LogSource.LINUX:
      return normalizeLinuxLog(rawMessage);

    case LogSource.WINDOWS:
      return normalizeWindowsLog(rawMessage);

    case LogSource.FIREWALL:
      return normalizeFirewallLog(rawMessage);

    case LogSource.APPLICATION:
      return normalizeApplicationLog(rawMessage);

    default:
      return "UNKNOWN";
  }
}