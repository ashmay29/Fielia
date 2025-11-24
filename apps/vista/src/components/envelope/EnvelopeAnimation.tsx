"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface EnvelopeAnimationProps {
  onStart: () => void;
  onComplete: () => void;
}

export function EnvelopeAnimation({ onStart, onComplete }: EnvelopeAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const watchdogRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  // A11y: Subscribe to reduced motion preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleOpen = () => {
    onStart(); // Analytics trigger

    if (prefersReducedMotion) {
      // A11y Bypass
      onComplete();
    } else if (videoRef.current) {
      setIsPlaying(true);
      startedRef.current = false;

      // Start a short watchdog: if playback doesn't progress, fallback
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      watchdogRef.current = window.setTimeout(() => {
        if (!startedRef.current) {
          console.warn("[Envelope] Video failed to start in time, falling back to content.");
          onComplete();
        }
      }, 1500);

      videoRef.current.play().catch((err) => {
        console.error("Autoplay failed:", err);
        // Fallback if video fails
        onComplete();
      });
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.pause();
    onComplete();
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#501515]">
      {/* 1. Video Layer */}
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover ${isPlaying ? '' : 'pointer-events-none'}`}
        playsInline
        muted
        preload="auto"
        poster="/assets/envelope-start-frame.jpg"
        onPlay={() => { startedRef.current = true; if (watchdogRef.current) window.clearTimeout(watchdogRef.current); }}
        onTimeUpdate={() => { startedRef.current = true; if (watchdogRef.current) window.clearTimeout(watchdogRef.current); }}
        onError={() => { console.error("[Envelope] Video error - falling back."); onComplete(); }}
        onEnded={onComplete}
        aria-hidden="true"
      >
        <source src="/assets/Envelope_Opens_To_Website_Animation.webm" type="video/webm" />
        <source src="/assets/Envelope_Opens_To_Website_Animation.mp4" type="video/mp4" />
      </video>

      {/* 2. UI Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute inset-0 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto absolute left-1/2 top-[84%] -translate-x-1/2 -translate-y-1/2">
              <Button
                onClick={handleOpen}
                variant="secondary"
                aria-label="Open Invitation"
                className="px-8 py-4 text-base sm:px-12 sm:py-6 sm:text-lg md:px-15 md:py-6 md:text-xl"
              >
                Open Invitation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Skip Button (Visible only while playing) */}
      <AnimatePresence>
        {isPlaying && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-30 font-(family-name:--font-cormorant) text-sm text-[#E1D6C7]/50 hover:text-[#E1D6C7] transition-colors uppercase tracking-widest"
          >
            Skip Animation
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Vignette (Consistent across states) */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-radial from-transparent via-transparent to-[#0A0A08]/40" />
    </div>
  );
}
