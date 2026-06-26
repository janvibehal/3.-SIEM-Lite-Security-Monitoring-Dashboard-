// src/normalization/linuxNormalizer.ts

import { LinuxPatterns } from "./patterns";

export function normalizeLinuxLog(rawMessage: string): string {
  if (LinuxPatterns.LOGIN_SUCCESS.test(rawMessage)) {
    return "LOGIN_SUCCESS";
  }

  if (LinuxPatterns.LOGIN_FAILED.test(rawMessage)) {
    return "LOGIN_FAILED";
  }

  if (LinuxPatterns.USER_CREATED.test(rawMessage)) {
    return "USER_CREATED";
  }

  if (LinuxPatterns.USER_DELETED.test(rawMessage)) {
    return "USER_DELETED";
  }

  if (LinuxPatterns.PASSWORD_CHANGED.test(rawMessage)) {
    return "PASSWORD_CHANGED";
  }

  if (LinuxPatterns.SERVICE_STARTED.test(rawMessage)) {
    return "SERVICE_STARTED";
  }

  if (LinuxPatterns.SERVICE_STOPPED.test(rawMessage)) {
    return "SERVICE_STOPPED";
  }

  return "UNKNOWN";
}