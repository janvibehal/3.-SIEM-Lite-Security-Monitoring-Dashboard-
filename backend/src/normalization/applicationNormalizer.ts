// src/normalization/applicationNormalizer.ts

import { ApplicationPatterns } from "./patterns";

export function normalizeApplicationLog(rawMessage: string): string {
  if (ApplicationPatterns.LOGIN_SUCCESS.test(rawMessage)) {
    return "LOGIN_SUCCESS";
  }

  if (ApplicationPatterns.LOGIN_FAILED.test(rawMessage)) {
    return "LOGIN_FAILED";
  }

  if (ApplicationPatterns.ERROR.test(rawMessage)) {
    return "APPLICATION_ERROR";
  }

  return "UNKNOWN";
}