// src/normalization/windowsNormalizer.ts

import { WindowsPatterns } from "./patterns";

export function normalizeWindowsLog(rawMessage: string): string {
  if (WindowsPatterns.LOGIN_SUCCESS.test(rawMessage)) {
    return "LOGIN_SUCCESS";
  }

  if (WindowsPatterns.LOGIN_FAILED.test(rawMessage)) {
    return "LOGIN_FAILED";
  }

  if (WindowsPatterns.ACCOUNT_LOCKED.test(rawMessage)) {
    return "ACCOUNT_LOCKED";
  }

  if (WindowsPatterns.PASSWORD_CHANGED.test(rawMessage)) {
    return "PASSWORD_CHANGED";
  }

  if (WindowsPatterns.USER_CREATED.test(rawMessage)) {
    return "USER_CREATED";
  }

  if (WindowsPatterns.USER_DELETED.test(rawMessage)) {
    return "USER_DELETED";
  }

  return "UNKNOWN";
}