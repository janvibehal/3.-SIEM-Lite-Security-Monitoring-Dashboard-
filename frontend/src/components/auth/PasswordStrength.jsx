/**
 * PasswordStrength.jsx
 * Visual password strength indicator.
 * Rules mirror backend/src/validators/auth.validator.ts registerSchema exactly.
 */

import { PASSWORD_RULES, checkPassword } from "../../utils/passwordValidation";

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const passing = checkPassword(password);
  const score = passing.length; // 0–5

  const bars = [
    { min: 0, color: "bg-red-500" },
    { min: 2, color: "bg-orange-500" },
    { min: 3, color: "bg-yellow-500" },
    { min: 4, color: "bg-lime-500" },
    { min: 5, color: "bg-cyan-400" },
  ];

  const activeBar = [...bars].reverse().find((b) => score >= b.min) || bars[0];

  const label = ["", "Weak", "Weak", "Fair", "Good", "Strong"][score] || "";

  return (
    <div className="space-y-2.5 mt-1">
      {/* Segmented bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? activeBar.color : "bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Label */}
      {score > 0 && (
        <p className={`text-xs font-medium ${activeBar.color.replace("bg-", "text-")}`}>
          {label}
        </p>
      )}

      {/* Individual rule checks */}
      <ul className="grid grid-cols-1 gap-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = passing.includes(rule.id);
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-xs transition-colors ${
                ok ? "text-cyan-400" : "text-slate-600"
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                ok ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700"
              }`}>
                {ok && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
