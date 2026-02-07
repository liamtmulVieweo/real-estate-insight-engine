export function VieweoLogo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e5a8a" />
          <stop offset="100%" stopColor="#3aa5a0" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a4d7c" />
          <stop offset="60%" stopColor="#1a4d7c" />
          <stop offset="100%" stopColor="#2d9a96" />
        </linearGradient>
      </defs>

      {/* Location pin shape */}
      <path
        d="M22 3C13 3 5 11 5 20C5 32 22 47 22 47C22 47 39 32 39 20C39 11 31 3 22 3Z"
        fill="url(#pinGradient)"
      />

      {/* Chart bars inside pin - white */}
      <rect x="13" y="26" width="5" height="12" rx="1.5" fill="white" />
      <rect x="19.5" y="18" width="5" height="20" rx="1.5" fill="white" />
      <rect x="26" y="22" width="5" height="16" rx="1.5" fill="white" />

      {/* Text "vieweo" with gradient */}
      <text
        x="50"
        y="34"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="600"
        letterSpacing="-0.5"
        fill="url(#textGradient)"
      >
        vieweo
      </text>
    </svg>
  );
}
