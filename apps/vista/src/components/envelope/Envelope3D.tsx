"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { WaxSeal } from "./WaxSeal";
import { EnvelopeFlap } from "./EnvelopeFlap";
import { PocketLeft, PocketRight, PocketBottom } from "./EnvelopePockets";
import { InvitationContent } from "@/components/invitation/InvitationContent";
import { SharedLogo } from "@/components/ui/SharedLogo";

// Animation phases
type AnimationPhase = "closed" | "opening" | "zooming" | "revealing" | "done";

export function Envelope3D({ onOpen: _onOpen }: { onOpen: () => void }) {
  const [phase, setPhase] = useState<AnimationPhase>("closed");
  const isOpen = phase !== "closed";

  const handleOpen = useCallback(() => {
    if (phase !== "closed") return;
    setPhase("opening");

    // Sequence:
    // 1. Open Flap & Slide Card Up (starts immediately)
    // 2. Zoom Card to Full Screen (starts after card is revealed)
    setTimeout(() => {
      setPhase("zooming");
    }, 2500); // 1.2s flap + 1.3s card slide overlap

    // 3. Reveal Content (starts after zoom finishes)
    setTimeout(() => {
      setPhase("revealing");
    }, 3500); // 2.5s + 1s zoom

    // 4. Notify parent/cleanup (optional, kept for robustness)
    setTimeout(() => {
      setPhase("done");
      // onOpen(); // We don't need to navigate away anymore, we stay here.
    }, 4500);
  }, [phase]);

  useEffect(() => {
    // Auto-open on mount
    const timer = setTimeout(() => {
      handleOpen();
    }, 500); // Small delay to ensure smooth entry

    return () => clearTimeout(timer);
  }, [handleOpen]);

  // Custom bezier curve for "Heavy Paper" feel (starts fast, ends slow)
  const paperPhysics = {
    duration: 1.2,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  };

  // Slower card reveal for dramatic effect
  const cardReveal = {
    duration: 1.5,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  };

  return (
    <motion.div
      // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
      className="relative flex min-h-screen w-full flex-col items-center justify-end pb-16"
      style={{
        background: `radial-gradient(circle at center, var(--fielia-3) 0%, var(--fielia-2) 40%, var(--fielia-4) 100%)`,
        overflow: ["zooming", "revealing", "done"].includes(phase)
          ? "visible"
          : "hidden",
      }}
    >
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Large Watermark */}
        <span className="font-(family-name:--font-great-vibes) translate-y-[-10%] select-none text-[25vw] text-surface opacity-[0.03] blur-sm">
          Fielia
        </span>

        {/* Paper Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 300 300%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22ptex%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.009%22 numOctaves=%225%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23ffffff%22 filter=%22url(%23ptex)%22 opacity=%220.8%22/%3E%3C/svg%3E")',
          }}
        />

        {/* Decorative Corners */}
        <div className="absolute left-6 top-6 h-32 w-32 border-l border-t border-[#E1D6C7]/20" />
        <div className="absolute right-6 top-6 h-32 w-32 border-r border-t border-[#E1D6C7]/20" />
        <div className="absolute bottom-6 left-6 h-32 w-32 border-b border-l border-[#E1D6C7]/20" />
        <div className="absolute bottom-6 right-6 h-32 w-32 border-b border-r border-[#E1D6C7]/20" />
      </div>

      {/* Top Heading */}
      <motion.div
        // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
        className="absolute top-24 z-20 text-center px-4"
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-(family-name:--font-cormorant) text-sm sm:text-base font-semibold uppercase tracking-[0.3em] text-[#E1D6C7]/80">
          An invite-only bar and supper club
        </p>
      </motion.div>

      {/* Stage: Sets the 3D Scene */}
      <div
        className="relative z-10"
        style={{
          width: "min(600px, 90vw)", // Responsive width
          aspectRatio: "3 / 2", // Standard envelope ratio
          perspective: ["zooming", "revealing", "done"].includes(phase)
            ? "none"
            : "1200px", // Remove 3D context during zoom
        }}
      >
        {/* Container: Preserves 3D space for children */}
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: ["zooming", "revealing", "done"].includes(phase)
              ? "flat"
              : "preserve-3d",
          }}
        >
          {/* LAYER 1: Back Panel */}
          <div
            className="absolute inset-0 z-0 rounded-sm bg-[#2a0808]"
            style={{ boxShadow: "0 0 60px 5px rgba(225, 214, 199, 0.1)" }}
          />

          {/* LAYER 2: The Invitation Card */}
          <motion.div
            // @ts-expect-error - Framer Motion type issue
            className={`absolute flex items-start justify-center bg-[#E1D6C7] pt-8 shadow-md ${
              ["zooming", "revealing", "done"].includes(phase)
                ? "fixed inset-0 z-50 h-full w-full overflow-y-auto"
                : "inset-x-4 top-4 bottom-4" // Normal card position constrained to envelope
            }`}
            initial={{ y: 0, zIndex: 20, scale: 1 }}
            animate={
              phase === "zooming" || phase === "revealing" || phase === "done"
                ? {
                    y: 0,
                    x: 0,
                    scale: 1,
                    zIndex: 50,
                    borderRadius: 0,
                    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }, // Ultra-smooth easeOutQuint
                  }
                : isOpen
                ? { y: -220, zIndex: 20 }
                : { y: 0, zIndex: 20 }
            }
            transition={
              // Use different transitions for different properties if needed
              phase === "zooming"
                ? { duration: 1.5, ease: "easeInOut" }
                : {
                    y: { ...cardReveal, delay: 1 },
                    zIndex: { delay: 0 },
                  }
            }
          >
            {/* Inner Content Container */}
            <div className="w-full h-full relative">
              {/* Initial Small Content (Logo + Text) - Fades out during zoom/reveal */}
              <motion.div
                // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
                className="absolute top-8 left-0 right-0 flex flex-col items-center gap-2"
                animate={{
                  opacity: phase === "revealing" || phase === "done" ? 0 : 1,
                }}
              >
                <SharedLogo size="small" />
                <span className="font-(family-name:--font-cormorant) text-sm uppercase tracking-widest text-[#370D10]/70">
                  You are invited
                </span>
              </motion.div>

              {/* Full Invitation Content - Fades in after zoom */}
              {["revealing", "done"].includes(phase) && (
                <div className="absolute inset-0">
                  <InvitationContent visible={true} />
                </div>
              )}
            </div>
          </motion.div>

          {/* LAYER 3: Pockets (Static Overlay - Always on top) */}
          <motion.div
            // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
            className="absolute inset-0 z-30 pointer-events-none"
            animate={{
              opacity: ["zooming", "revealing", "done"].includes(phase) ? 0 : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <PocketLeft />
            <PocketRight />
            <PocketBottom />
          </motion.div>

          {/* LAYER 4: Rotating Flap (On top when closed, below card when open) */}
          <motion.div
            // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
            className="absolute inset-x-0 top-0 h-[52%] origin-top"
            initial={{ rotateX: 0, zIndex: 35 }}
            animate={
              isOpen ? { rotateX: 180, zIndex: 10 } : { rotateX: 0, zIndex: 35 }
            }
            transition={{
              rotateX: paperPhysics,
              zIndex: { delay: isOpen ? 0.5 : 0 }, // Delay until flap passes 90 degrees
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden", // Prevents graphical glitches
            }}
          >
            {/* Outer Face */}
            <div className="absolute inset-0 backface-hidden">
              <EnvelopeFlap />
            </div>

            {/* Inner Face (Visible when open) - Triangle shape to match outer flap */}
            <div
              className="absolute inset-0 backface-hidden"
              style={{ transform: "rotateY(180deg)" }}
            >
              <svg
                viewBox="0 0 600 300"
                fill="none"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <path d="M0 0 L300 295 L600 0 V0 H0 Z" fill="#421212" />
              </svg>
            </div>
          </motion.div>

          {/* LAYER 5: Wax Seal (Always on top, rotates with flap) */}
          <motion.div
            // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
            className="absolute inset-x-0 top-0 z-40 h-[52%] origin-top pointer-events-none"
            initial={{ rotateX: 0 }}
            animate={isOpen ? { rotateX: 180 } : { rotateX: 0 }}
            transition={paperPhysics}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="absolute top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 backface-hidden">
              <WaxSeal />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
