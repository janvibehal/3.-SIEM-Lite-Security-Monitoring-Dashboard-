/**
 * VerificationBadge.jsx
 * Shows email verification status.
 */

export default function VerificationBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-widest uppercase border rounded-full px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-widest uppercase border rounded-full px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="8.5" r="0.75" fill="currentColor" />
      </svg>
      Unverified
    </span>
  );
}