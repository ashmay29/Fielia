export function EnvelopeFlap() {
  return (
    <svg
      viewBox="0 0 600 300"
      fill="none"
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      {/* Main Flap Triangle */}
      <path
        d="M0 0 L300 295 L600 0 V0 H0 Z"
        fill="url(#flapGradient)"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
      <defs>
        <linearGradient
          id="flapGradient"
          x1="300"
          y1="0"
          x2="300"
          y2="295"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#501515" />
          <stop offset="1" stopColor="#380e0e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
