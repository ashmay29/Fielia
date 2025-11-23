"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeFlap } from "./EnvelopeFlap";
import { EnvelopePouch } from "./EnvelopePouch";
import { WaxSeal } from "./WaxSeal";
import { Letter } from "./Letter";
import { InvitationContent } from "../invitation/InvitationContent";

// Animation timing constants matched to user's GSAP snippet
const ANIMATION_TIMING = {
  SEAL_CRACK: 500,
  FLAP_OPEN: 1200, // 1.2s
  LETTER_EXTRACT: 1500, // 1.5s
  LETTER_DELAY: 600, // 0.6s overlap (starts 0.6s after flap starts? No, GSAP was -=0.6 relative to end. Flap=1.2. End=1.2. Start=0.6)
} as const;

const TOTAL_SEQUENCE_TIME =
  ANIMATION_TIMING.SEAL_CRACK +
  ANIMATION_TIMING.FLAP_OPEN +
  ANIMATION_TIMING.LETTER_EXTRACT; // Approx total time

export default function EnvelopeSequence() {
  const [status, setStatus] = useState<"IDLE" | "OPENING" | "REVEALED">("IDLE");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    if (status !== "IDLE") return;
    setStatus("OPENING");

    // Schedule reveal with cleanup
    timeoutRef.current = setTimeout(() => {
      setStatus("REVEALED");
    }, TOTAL_SEQUENCE_TIME);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#2E0506]">
      <div className="relative w-[90vw] max-w-2xl aspect-[1.4/1] perspective-1000">
        {/* 1. FLAP (Animated) - z-30 initially, switches to z-0 after opening */}
        <motion.div
          className="absolute inset-0"
          initial={{ zIndex: 30 }}
          animate={{ zIndex: status === "IDLE" ? 30 : 0 }}
          transition={{ delay: 0.6 }} // Delay z-index switch to match new timing (halfway through flap open)
          style={{ perspective: "1000px", pointerEvents: "none" }}
        >
          <EnvelopeFlap
            isOpen={status === "OPENING" || status === "REVEALED"}
          />
        </motion.div>

        {/* 2. LETTER - z-10 (Between Flap and Pouch) -> z-50 (On top) */}
        <AnimatePresence>
          {status !== "REVEALED" && (
            <motion.div
              key="letter"
              className="absolute inset-x-12 top-8 h-56" // Smaller than envelope
              initial={{ y: 0, z: 0, zIndex: 10 }}
              animate={
                status === "OPENING"
                  ? {
                      y: -100, // Extract up
                      z: 100, // Move forward
                      zIndex: 50, // Go on top of everything
                      scale: 1.0,
                      rotateX: 0,
                    }
                  : { y: 0, z: 0, zIndex: 10 }
              }
              transition={{
                delay: ANIMATION_TIMING.LETTER_DELAY / 1000,
                duration: ANIMATION_TIMING.LETTER_EXTRACT / 1000,
                ease: "easeOut",
              }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Letter isExposed={status === "OPENING"} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. POUCH (Static) - z-20 (In front of Letter, behind Closed Flap) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Dark background behind the pouch to hide the letter bottom */}
          <div className="absolute inset-0 bg-[#401312] shadow-2xl" />
          <EnvelopePouch />
        </div>

        {/* 4. WAX SEAL - z-40 (Always on top) */}
        <WaxSeal onClick={handleOpen} isCracked={status !== "IDLE"} />
      </div>

      {/* THE INVITATION PAGE (Revealed) */}
      <AnimatePresence>
        {status === "REVEALED" && (
          <motion.div
            className="absolute inset-0 w-full h-full overflow-y-auto bg-[#E1D6C7] z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <InvitationContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
