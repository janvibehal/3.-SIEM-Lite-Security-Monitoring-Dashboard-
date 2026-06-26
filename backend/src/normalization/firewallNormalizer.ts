// src/normalization/firewallNormalizer.ts

import { FirewallPatterns } from "./patterns";

export function normalizeFirewallLog(rawMessage: string): string {
  if (FirewallPatterns.CONNECTION_ALLOWED.test(rawMessage)) {
    return "CONNECTION_ALLOWED";
  }

  if (FirewallPatterns.CONNECTION_BLOCKED.test(rawMessage)) {
    return "CONNECTION_BLOCKED";
  }

  return "UNKNOWN";
}