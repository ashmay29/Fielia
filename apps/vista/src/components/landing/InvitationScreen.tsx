"use client";
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
    if (keyholeRef.current && typeof window !== "undefined") {
      const rect = keyholeRef.current.getBoundingClientRect();
      // Target the center of the keyhole image
      // For the PNG image, we want to zoom from the center of the circular part
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.12; // Adjusted to target the circular part at the top of the keyhole
      setTransformOrigin(`${centerX}px ${centerY}px`);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isZooming) return;

    const timeoutId = setTimeout(() => {
      onEnter();
    }, 1100);

    return () => clearTimeout(timeoutId);
  }, [isZooming, onEnter]);

  const handleKeyholeClick = () => {
    setIsZooming(true);
  };

  const MotionDiv = motion.div as React.ElementType;
  const MotionP = motion.p as React.ElementType;
  const MotionH1 = motion.h1 as React.ElementType;

  return (
    <MotionDiv
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isZooming ? 300 : 1,
      }}
      transition={{
        opacity: { duration: 0.8, delay: 0, ease: "easeInOut" },
        scale: {
          duration: 1.4,
          ease: [0.76, 0, 0.24, 1], // Smoother easing curve
          type: "tween", // Force tween for smooth animation
        },
      }}
      style={{
        pointerEvents: isVisible && !isZooming ? "auto" : "none",
        transformOrigin: transformOrigin,
        willChange: isZooming ? "transform, opacity" : "auto",
      }}
    >
      {/* High-quality gold rose background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/goldrosebg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Dark maroon gradient overlay to maintain aesthetic */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, 
              hsl(350 45% 10% / 0.70) 0%, 
              hsl(350 40% 7% / 0.78) 50%,
              hsl(350 35% 5% / 0.85) 100%
            )
          `,
        }}
      />

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
          background:
            "radial-gradient(ellipse at 50% 50%, hsl(350 55% 15% / 0.4) 0%, transparent 60%)",
        }}
      />

      {/* Invitation card - darker, more mysterious */}
      <MotionDiv
        className="relative max-w-md w-full mx-6 p-10 md:p-14"
        style={{
          background:
            "linear-gradient(180deg, hsl(350 40% 12%) 0%, hsl(350 45% 9%) 100%)",
          border: "1px solid hsl(42 40% 35% / 0.25)",
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
        {/* Invitation Border */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/invitation-border.png"
            alt=""
            className="w-full h-full scale-[1.12]"
            style={{ objectFit: "fill" }}
          />
        </div>

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
              <line
                x1="0"
                y1="8"
                x2="30"
                y2="8"
                stroke="hsl(42 50% 50%)"
                strokeWidth="0.4"
                opacity="0.6"
              />
              <path
                d="M40 8 L45 4 L50 8 L45 12 Z"
                fill="none"
                stroke="hsl(42 50% 50%)"
                strokeWidth="0.4"
                opacity="0.7"
              />
              <path
                d="M50 8 L55 4 L60 8 L55 12 Z"
                fill="none"
                stroke="hsl(42 50% 50%)"
                strokeWidth="0.4"
                opacity="0.7"
              />
              <line
                x1="70"
                y1="8"
                x2="100"
                y2="8"
                stroke="hsl(42 50% 50%)"
                strokeWidth="0.4"
                opacity="0.6"
              />
            </svg>
          </MotionDiv>

          {/* Cryptic welcome - speakeasy style */}
          <MotionP
            className="text-accent/50 text-[10px] tracking-[0.5em] uppercase font-(family-name:--font-cormorant)"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            For those who know
          </MotionP>

          {/* Main title - elegant */}
          <MotionH1
            className="text-foreground text-4xl md:text-5xl font-(family-name:--font-playfair) italic mb-1 tracking-wide"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2 }}
          >
            Fielia
          </MotionH1>

          {/* Subtle tagline */}
          <MotionP
            className="text-muted-foreground/60 text-[9px] tracking-[0.5em] uppercase mb-6 font-(family-name:--font-cormorant)"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2.2 }}
          >
            Est. MCMXXIII
          </MotionP>

          {/* Divider */}
          <MotionDiv
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: isVisible ? 1 : 0, scaleX: isVisible ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 2.4 }}
          >
            <div className="w-20 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent" />
          </MotionDiv>

          {/* Mysterious description - secretive */}
          <MotionP
            className="text-foreground/50 text-xs leading-relaxed font-(family-name:--font-cormorant) max-w-[260px] mx-auto mb-6 italic"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2.6 }}
          >
            Behind closed doors, where the refined gather. An evening of
            discretion, rare spirits, and conversations that never leave.
          </MotionP>

          {/* Exclusive details */}
          <MotionDiv
            className="space-y-1.5 mb-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
            transition={{ duration: 1, delay: 2.8 }}
          >
            <p className="text-accent/40 text-[8px] tracking-[0.4em] uppercase font-(family-name:--font-cormorant)">
              Admission by referral only
            </p>
            <p className="text-foreground/40 text-[10px] font-(family-name:--font-cormorant) italic">
              The password changes with the moon
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
                cursor: 'url("/keycursor-large-rotated.png") 24 24, pointer',
              }}
              aria-label="Enter Fielia"
            >
              {/* Keyhole Image */}
              <img
                src="/keyhole.png"
                alt="Keyhole"
                className="w-auto h-20 transition-all duration-500 group-hover:drop-shadow-[0_0_12px_hsl(42_60%_50%/0.7)] group-hover:brightness-110"
              />

              {/* Subtle glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(42 60% 50% / 0.3) 0%, transparent 70%)",
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
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(350 40% 5% / 0.5) 100%)",
        }}
      />
    </MotionDiv>
  );
};

export default InvitationScreen;
