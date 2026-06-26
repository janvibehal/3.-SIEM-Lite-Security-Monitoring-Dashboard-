// src/normalization/patterns.ts

export const LinuxPatterns = {
  LOGIN_SUCCESS: /Accepted password|session opened/i,
  LOGIN_FAILED: /Failed password|authentication failure/i,
  USER_CREATED: /new user|useradd/i,
  USER_DELETED: /userdel/i,
  PASSWORD_CHANGED: /password changed|passwd/i,
  SERVICE_STARTED: /started/i,
  SERVICE_STOPPED: /stopped/i,
};

export const WindowsPatterns = {
  LOGIN_SUCCESS: /4624/,
  LOGIN_FAILED: /4625/,
  ACCOUNT_LOCKED: /4740/,
  PASSWORD_CHANGED: /4723|4724/,
  USER_CREATED: /4720/,
  USER_DELETED: /4726/,
};

export const FirewallPatterns = {
  CONNECTION_ALLOWED: /allow|accepted|permitted/i,
  CONNECTION_BLOCKED: /deny|blocked|dropped|reject/i,
};

export const ApplicationPatterns = {
  LOGIN_SUCCESS: /login successful|authentication successful/i,
  LOGIN_FAILED: /login failed|authentication failed/i,
  ERROR: /exception|error|failed/i,
};