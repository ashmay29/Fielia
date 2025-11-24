const commonProps = {
  viewBox: "0 0 600 400",
  fill: "none",
  preserveAspectRatio: "none",
  className: "absolute inset-0 h-full w-full",
};

// Left Triangle
export function PocketLeft() {
  return (
    <svg
      {...commonProps}
      style={{ filter: "drop-shadow(2px 0 3px rgba(0,0,0,0.3))" }}
    >
      <path d="M0 0 L0 400 L300 210 Z" fill="#3d0f0f" />
    </svg>
  );
}

// Right Triangle
export function PocketRight() {
  return (
    <svg
      {...commonProps}
      style={{ filter: "drop-shadow(-2px 0 3px rgba(0,0,0,0.3))" }}
    >
      <path d="M600 0 L600 400 L300 210 Z" fill="#3d0f0f" />
    </svg>
  );
}

// Bottom Trapezoid (Sits on top)
export function PocketBottom() {
  return (
    <svg
      {...commonProps}
      style={{ filter: "drop-shadow(0 -4px 6px rgba(0,0,0,0.4))" }}
    >
      <path d="M0 400 L600 400 L300 210 Z" fill="url(#bottomGradient)" />
      <defs>
        <linearGradient
          id="bottomGradient"
          x1="300"
          y1="400"
          x2="300"
          y2="210"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#501515" />
          <stop offset="1" stopColor="#451010" />
        </linearGradient>
      </defs>
    </svg>
  );
}
