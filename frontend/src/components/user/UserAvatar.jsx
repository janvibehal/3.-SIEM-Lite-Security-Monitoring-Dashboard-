/**
 * UserAvatar.jsx
 * Circular avatar with initials fallback.
 * No external image dependency — derives initials from username or email.
 */

const SIZE_CLASSES = {
  sm:  "w-7 h-7 text-xs",
  md:  "w-9 h-9 text-sm",
  lg:  "w-14 h-14 text-lg",
  xl:  "w-20 h-20 text-2xl",
};

function getInitials(user) {
  if (!user) return "?";
  if (user.username) return user.username[0].toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  return "?";
}

export default function UserAvatar({ user, size = "md", className = "" }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <div
      className={`${sizeClass} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 flex-shrink-0 ${className}`}
      aria-label={user?.username ?? "User avatar"}
    >
      {getInitials(user)}
    </div>
  );
}