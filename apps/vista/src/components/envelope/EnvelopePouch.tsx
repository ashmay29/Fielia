import React from "react";

export function EnvelopePouch() {
  return (
    <>
      {/* Subtle curved notch shadow under flap */}
      <div
        className="pointer-events-none absolute left-1/2 top-[calc(55%-1rem)] h-16 w-64 -translate-x-1/2 opacity-35 z-10"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, rgba(10,10,8,0.6) 0%, rgba(10,10,8,0.35) 35%, transparent 70%)",
        }}
      />

      {/* --- BOTTOM FLAP --- */}
      <div className="absolute inset-0 z-20">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="bottom-flap-gradient"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(64,19,18,0.75)" />
              <stop offset="50%" stopColor="rgba(80,21,21,0.5)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 0 100 L 100 100 L 50 55 Z"
            fill="url(#bottom-flap-gradient)"
            stroke="#E1D6C7"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* --- LEFT FLAP --- */}
      <div className="absolute inset-0 z-20">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="left-flap-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(46,5,6,0.8)" />
              <stop offset="50%" stopColor="rgba(64,19,18,0.55)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 0 0 L 0 100 L 50 55 Z"
            fill="url(#left-flap-gradient)"
            stroke="#E1D6C7"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* --- RIGHT FLAP --- */}
      <div className="absolute inset-0 z-20">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="right-flap-gradient"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="0%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(46,5,6,0.8)" />
              <stop offset="50%" stopColor="rgba(64,19,18,0.55)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 100 0 L 100 100 L 50 55 Z"
            fill="url(#right-flap-gradient)"
            stroke="#E1D6C7"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </>
  );
}
