/**
 * passwordValidation.js
 * Mirrors the Zod registerSchema from backend/src/validators/auth.validator.ts EXACTLY.
 * Used for real-time client-side feedback before form submission.
 *
 * Schema:
 *   password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/)
 */

export const PASSWORD_RULES = [
  { id: "length",  label: "At least 8 characters",      test: (v) => v.length >= 8 },
  { id: "upper",   label: "One uppercase letter (A-Z)",  test: (v) => /[A-Z]/.test(v) },
  { id: "lower",   label: "One lowercase letter (a-z)",  test: (v) => /[a-z]/.test(v) },
  { id: "digit",   label: "One digit (0-9)",              test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "One special character (!@#…)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/**
 * Returns array of rule IDs that are currently passing.
 */
export function checkPassword(value) {
  return PASSWORD_RULES.filter((r) => r.test(value)).map((r) => r.id);
}

/**
 * Returns true only when ALL rules pass (matches Zod schema).
 */
export function isPasswordValid(value) {
  return PASSWORD_RULES.every((r) => r.test(value));
}

/**
 * Username: min 3, max 50 (from registerSchema: z.string().min(3).max(50))
 */
export function isUsernameValid(value) {
  return value.length >= 3 && value.length <= 50;
}

/**
 * Email: basic format check — Zod uses z.email()
 */
export function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
