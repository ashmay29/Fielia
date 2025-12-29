"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CurtainReveal from "@/components/landing/CurtainReveal";
import EntranceText from "@/components/landing/EntranceText";
import MainWebsite from "@/components/landing/MainWebsite";

export default function HomePage() {
  const [curtainDone, setCurtainDone] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSite, setShowSite] = useState(false);

  useEffect(() => {
    let textTimeout: ReturnType<typeof setTimeout> | undefined;
    let siteTimeout: ReturnType<typeof setTimeout> | undefined;

    if (curtainDone) {
      // Text appears 400ms after curtains
      textTimeout = setTimeout(() => setShowText(true), 400);
      // Site appears after text completes (400ms delay + 4800ms animation + 200ms buffer = 5400ms)
      siteTimeout = setTimeout(() => setShowSite(true), 5400);
    } else {
      // Reset state if curtainDone becomes false again
      if (showText) setShowText(false);
      if (showSite) setShowSite(false);
    }

    return () => {
      if (textTimeout !== undefined) clearTimeout(textTimeout);
      if (siteTimeout !== undefined) clearTimeout(siteTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curtainDone]);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "hsl(350 40% 8%)" }}
    >
      {/* Cinematic Satin Background Fade */}
      <motion.div
        className="absolute inset-0 high-quality-bg"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: curtainDone ? 1 : 0 }}
        transition={{
          duration: 6,
          delay: 0.8,
          ease: [0.16, 1, 0.3, 1], // Ultra-smooth exponential ease for organic feel
        }}
      />

      {/* Maroon Overlay - Visible Immediately */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(350 45% 10% / 0.50) 0%, hsl(350 40% 7% / 0.75) 40%, hsl(350 35% 5% / 0.95) 70%, hsl(350 30% 3% / 1.00) 100%)",
        }}
      />

      {/* Stage 1: Curtain Reveal */}
      {!curtainDone && (
        <CurtainReveal onComplete={() => setCurtainDone(true)} />
      )}

      {/* Stage 2: "You may enter" Text */}
      {showText && <EntranceText startDelay={0} />}

      {/* Stage 3: Main Website */}
      {showSite && <MainWebsite isVisible={showSite} />}
    </div>
  );
}
