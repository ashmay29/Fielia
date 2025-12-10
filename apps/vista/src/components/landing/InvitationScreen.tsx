'use client';
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface InvitationScreenProps {
  isVisible: boolean;
  onEnter: () => void;
}

const InvitationScreen = ({ isVisible, onEnter }: InvitationScreenProps) => {
  const [isZooming, setIsZooming] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const keyholeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (keyholeRef.current && typeof window !== 'undefined') {
      const rect = keyholeRef.current.getBoundingClientRect();
      // Target the center of the keyhole circle (upper portion)
      // The SVG keyhole circle is at cy="12" out of viewBox height 40
      // Adjusted to 25% to move zoom origin higher
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + (rect.height * 0.15); // Much higher - 15% from top
      setTransformOrigin(`${centerX}px ${centerY}px`);
    }
  }, [isVisible]);

  const handleKeyholeClick = () => {
    setIsZooming(true);
    // Slower, smoother transition - 1100ms (900ms + 200ms)
    setTimeout(() => {
      onEnter();
    }, 1100);
  };

  const MotionDiv = motion.div as any;

  return (
    <MotionDiv
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isZooming ? 300 : 1,
      }}
      transition={{
        opacity: { duration: 2, delay: isZooming ? 0 : 0.5 },
        scale: {
          duration: 1.4,
          ease: [0.76, 0, 0.24, 1], // Smoother easing curve
          type: "tween" // Force tween for smooth animation
        }
      }}
      style={{
        background: `
          radial-gradient(ellipse at center, 
            hsl(350 45% 10%) 0%, 
            hsl(350 40% 7%) 50%,
            hsl(350 35% 5%) 100%
          )
        `,
        pointerEvents: isVisible && !isZooming ? "auto" : "none",
        transformOrigin: transformOrigin,
        willChange: isZooming ? "transform, opacity" : "auto",
        backgroundColor: "transparent", // Ensure no black background
      }}
    >

      {/* Removed black fade overlay for seamless parchment transition */}


      {/* Subtle velvet texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Warm maroon glow in center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(350 55% 15% / 0.4) 0%, transparent 60%)',
        }}
      />

      {/* Invitation card - darker, more mysterious */}
      <MotionDiv
        className="relative max-w-md w-full mx-6 p-10 md:p-14"
        style={{
          background: 'linear-gradient(180deg, hsl(350 40% 12%) 0%, hsl(350 45% 9%) 100%)',
          border: '1px solid hsl(42 40% 35% / 0.25)',
          boxShadow: `
            0 30px 80px hsl(350 50% 5% / 0.6),
            inset 0 1px 0 hsl(42 40% 40% / 0.1),
            0 0 100px hsl(350 50% 20% / 0.2)
          `,
        }}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{
          opacity: isVisible && !isZooming ? 1 : 0,
          y: isVisible ? 0 : 30,
          scale: isVisible ? 1 : 0.97,
        }}
        transition={{ duration: 1.4, delay: 1, ease: "easeOut" }}
      >
        {/* Art deco corner decorations - gold on dark */}
        <div className="absolute top-3 left-3 w-10 h-10">
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path d="M0 0 L40 0 L40 3 L3 3 L3 40 L0 40 Z" fill="none" stroke="hsl(42 55% 45%)" strokeWidth="0.5" opacity="0.5" />
            <path d="M8 8 L20 8 L20 11 L11 11 L11 20 L8 20 Z" fill="none" stroke="hsl(350 50% 40%)" strokeWidth="0.3" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute top-3 right-3 w-10 h-10 rotate-90">
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path d="M0 0 L40 0 L40 3 L3 3 L3 40 L0 40 Z" fill="none" stroke="hsl(42 55% 45%)" strokeWidth="0.5" opacity="0.5" />
            <path d="M8 8 L20 8 L20 11 L11 11 L11 20 L8 20 Z" fill="none" stroke="hsl(350 50% 40%)" strokeWidth="0.3" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-3 left-3 w-10 h-10 -rotate-90">
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path d="M0 0 L40 0 L40 3 L3 3 L3 40 L0 40 Z" fill="none" stroke="hsl(42 55% 45%)" strokeWidth="0.5" opacity="0.5" />
            <path d="M8 8 L20 8 L20 11 L11 11 L11 20 L8 20 Z" fill="none" stroke="hsl(350 50% 40%)" strokeWidth="0.3" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-3 right-3 w-10 h-10 rotate-180">
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path d="M0 0 L40 0 L40 3 L3 3 L3 40 L0 40 Z" fill="none" stroke="hsl(42 55% 45%)" strokeWidth="0.5" opacity="0.5" />
            <path d="M8 8 L20 8 L20 11 L11 11 L11 20 L8 20 Z" fill="none" stroke="hsl(350 50% 40%)" strokeWidth="0.3" opacity="0.6" />
          </svg>
        </div>

        {/* Inner border - subtle gold */}
        <div className="absolute inset-5 border border-accent/15" />

        {/* Content */}
        <div className="relative text-center">
          {/* Top ornament - elegant gold */}
          <MotionDiv
            className="flex justify-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 1.6 }}
          >
            <svg width="100" height="16" viewBox="0 0 100 16">
              <line x1="0" y1="8" x2="30" y2="8" stroke="hsl(42 50% 50%)" strokeWidth="0.4" opacity="0.6" />
              <path d="M40 8 L45 4 L50 8 L45 12 Z" fill="none" stroke="hsl(42 50% 50%)" strokeWidth="0.4" opacity="0.7" />
              <path d="M50 8 L55 4 L60 8 L55 12 Z" fill="none" stroke="hsl(42 50% 50%)" strokeWidth="0.4" opacity="0.7" />
              <line x1="70" y1="8" x2="100" y2="8" stroke="hsl(42 50% 50%)" strokeWidth="0.4" opacity="0.6" />
            </svg>
          </MotionDiv>

          {/* Cryptic welcome - speakeasy style */}
          <MotionDiv
            as="p"
            className="text-accent/50 text-[10px] tracking-[0.5em] uppercase font-[family-name:var(--font-cormorant)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            For those who know
          </MotionDiv>

          {/* Main title - elegant */}
          <MotionDiv
            as="h1"
            className="text-foreground text-4xl md:text-5xl font-[family-name:var(--font-playfair)] italic mb-1 tracking-wide"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2 }}
          >
            Fielia
          </MotionDiv>

          {/* Subtle tagline */}
          <MotionDiv
            as="p"
            className="text-muted-foreground/60 text-[9px] tracking-[0.5em] uppercase mb-6 font-[family-name:var(--font-cormorant)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2.2 }}
          >
            Est. MCMXXIII
          </MotionDiv>

          {/* Divider */}
          <MotionDiv
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: isVisible ? 1 : 0, scaleX: isVisible ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 2.4 }}
          >
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          </MotionDiv>

          {/* Mysterious description - secretive */}
          <MotionDiv
            as="p"
            className="text-foreground/50 text-xs leading-relaxed font-[family-name:var(--font-cormorant)] max-w-[260px] mx-auto mb-6 italic"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2.6 }}
          >
            Behind closed doors, where the refined gather.
            An evening of discretion, rare spirits,
            and conversations that never leave.
          </MotionDiv>

          {/* Exclusive details */}
          <MotionDiv
            className="space-y-1.5 mb-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2.8 }}
          >
            <p className="text-accent/40 text-[8px] tracking-[0.4em] uppercase font-[family-name:var(--font-cormorant)]">
              Admission by referral only
            </p>
            <p className="text-foreground/40 text-[10px] font-[family-name:var(--font-cormorant)] italic">
              "The password changes with the moon"
            </p>
          </MotionDiv>

          {/* Interactive Keyhole */}
          <MotionDiv
            ref={keyholeRef}
            className="flex justify-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 3.2 }}
          >
            <button
              onClick={handleKeyholeClick}
              className="relative group cursor-pointer bg-transparent border-none p-2"
              style={{
                cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23C9A227\' stroke-width=\'1.5\'><circle cx=\'8\' cy=\'8\' r=\'5\'/><path d=\'M10.5 10.5L21 21\'/><path d=\'M15 15l2 2\'/><path d=\'M18 18l2 2\'/></svg>") 0 0, pointer',
              }}
              aria-label="Enter Fielia"
            >
              {/* Keyhole SVG */}
              <svg
                width="28"
                height="40"
                viewBox="0 0 28 40"
                className="transition-all duration-500 group-hover:drop-shadow-[0_0_8px_hsl(42_60%_50%/0.6)]"
              >
                {/* Keyhole shape */}
                <defs>
                  <linearGradient id="keyholeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(42, 50%, 35%)" />
                    <stop offset="100%" stopColor="hsl(42, 40%, 25%)" />
                  </linearGradient>
                </defs>
                {/* Circle part of keyhole */}
                <circle
                  cx="14"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="url(#keyholeGradient)"
                  strokeWidth="1.5"
                  className="transition-all duration-500 group-hover:stroke-[hsl(42,60%,55%)]"
                />
                {/* Inner keyhole - split into circle (parchment) and tail (dark) */}
                {/* Circle part - parchment color */}
                <circle
                  cx="14"
                  cy="12"
                  r="4"
                  fill="hsl(35 30% 88%)"
                  stroke="url(#keyholeGradient)"
                  strokeWidth="0.5"
                />
                {/* Tail/ribbon part - dark color */}
                <path
                  d="M11 14 L10 32 L14 28 L18 32 L17 14"
                  fill="hsl(350, 40%, 6%)"
                  stroke="url(#keyholeGradient)"
                  strokeWidth="0.8"
                  className="transition-all duration-500 group-hover:stroke-[hsl(42,60%,55%)]"
                />
                {/* Decorative outer ring */}
                <circle
                  cx="14"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="hsl(42, 45%, 40%)"
                  strokeWidth="0.3"
                  opacity="0.5"
                  className="transition-all duration-500 group-hover:opacity-80"
                />
              </svg>

              {/* Subtle glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, hsl(42 60% 50% / 0.3) 0%, transparent 70%)',
                  }}
                />
              </div>
            </button>
          </MotionDiv>

          {/* Bottom ornament */}
          <MotionDiv
            className="flex justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 3 }}
          >
            <svg width="50" height="24" viewBox="0 0 50 24">
              <path
                d="M0 12 L15 12 M35 12 L50 12"
                stroke="hsl(42 50% 50%)"
                strokeWidth="0.4"
                opacity="0.5"
              />
              <path
                d="M20 6 L25 12 L30 6 M20 18 L25 12 L30 18"
                fill="none"
                stroke="hsl(350 50% 40%)"
                strokeWidth="0.4"
                opacity="0.6"
              />
            </svg>
          </MotionDiv>
        </div>
      </MotionDiv>

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(350 40% 5% / 0.5) 100%)",
        }}
      />
    </MotionDiv>
  );
};

export default InvitationScreen;
