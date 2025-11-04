export function EnvelopeFlap() {
  return (
    <>
      {/* --- TOP FLAP --- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(46,5,6,0.85) 0%, rgba(64,19,18,0.6) 60%, transparent 100%)",
          clipPath:
            "path('M 0 0 H 100% L 50% 55% Q 50% 48% 0 0 Z')"
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,8,0.45) 0%, transparent 50%)",
          clipPath:
            "path('M 0 0 H 100% L 50% 55% Q 50% 48% 0 0 Z')"
        }}
      />

      {/* Subtle curved notch shadow under flap */}
      <div
        className="pointer-events-none absolute left-1/2 top-[calc(55%-1rem)] h-16 w-64 -translate-x-1/2 opacity-35"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, rgba(10,10,8,0.6) 0%, rgba(10,10,8,0.35) 35%, transparent 70%)"
        }}
      />

      {/* --- BOTTOM FLAP --- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(64,19,18,0.75) 0%, rgba(80,21,21,0.5) 50%, transparent 100%)",
          clipPath: "polygon(0 100%, 100% 100%, 50% 55%)"
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,8,0.45) 0%, transparent 45%)",
          clipPath: "polygon(0 100%, 100% 100%, 50% 55%)"
        }}
      />

      {/* --- LEFT FLAP --- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(46,5,6,0.8) 0%, rgba(64,19,18,0.55) 50%, transparent 100%)",
          clipPath: "polygon(0 0, 0 100%, 50% 55%)"
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,8,0.4) 0%, transparent 40%)",
          clipPath: "polygon(0 0, 0 100%, 50% 55%)"
        }}
      />

      {/* --- RIGHT FLAP --- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, rgba(46,5,6,0.8) 0%, rgba(64,19,18,0.55) 50%, transparent 100%)",
          clipPath: "polygon(100% 0, 100% 100%, 50% 55%)"
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, rgba(10,10,8,0.4) 0%, transparent 40%)",
          clipPath: "polygon(100% 0, 100% 100%, 50% 55%)"
        }}
      />
    </>
  );
}
