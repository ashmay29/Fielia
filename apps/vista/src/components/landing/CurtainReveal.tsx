"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Extremely smooth gradient with 60+ micro-steps - invisible transitions
const CURTAIN_GRADIENT_STOPS =
  "#2E0506 0%, #2E0506 2%, #2F0607 4%, #300708 6%, #311015 8%, #331116 9%, #351015 10%, #361116 11%, #381117 12%, #3A1218 13%, #3D1318 15%, #3E1419 16%, #3F1419 17%, #40141A 18%, #42151A 20%, #43151B 21%, #45161A 23%, #46161B 24%, #48171B 26%, #49171C 27%, #45161A 29%, #47171B 30%, #49181C 31%, #4A181C 32%, #4C181D 33%, #4D181C 35%, #4E191D 36%, #4F191D 37%, #50191E 38%, #511A1E 39%, #531A1F 39.5%, #551A1E 40%, #551A1E 42%, #551A1E 45%, #551A1E 48%, #551A1E 50%, #551A1E 52%, #551A1E 55%, #551A1E 58%, #551A1E 60%, #531A1F 60.5%, #511A1E 61%, #50191E 62%, #4F191D 63%, #4E191D 64%, #4D181C 65%, #4C181D 67%, #4A181C 68%, #49181C 69%, #47171B 70%, #45161A 71%, #49171C 73%, #48171B 74%, #46161B 76%, #45161A 77%, #43151B 79%, #42151A 80%, #40141A 82%, #3F1419 83%, #3E1419 84%, #3D1318 85%, #3A1218 87%, #381117 88%, #361116 89%, #351015 90%, #331116 91%, #311015 92%, #300708 94%, #2F0607 96%, #2E0506 98%, #2E0506 100%";

export default function CurtainReveal({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    setMounted(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) {
    return (
      <div
        className="fixed inset-0 z-100 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(350 45% 10% / 0.50) 0%, hsl(350 40% 7% / 0.75) 40%, hsl(350 35% 5% / 0.95) 70%, hsl(350 30% 3% / 1.00) 100%)",
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-100 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(350 45% 10% / 0.50) 0%, hsl(350 40% 7% / 0.75) 40%, hsl(350 35% 5% / 0.95) 70%, hsl(350 30% 3% / 1.00) 100%)",
      }}
    >
      {isMobile ? (
        <MobileCurtains onComplete={onComplete} />
      ) : (
        <DesktopCurtains onComplete={onComplete} />
      )}
    </div>
  );
}

function DesktopCurtains({ onComplete }: { onComplete: () => void }) {
  // Create vertical fold pattern (pleats) for desktop
  const foldCount = 16;
  const folds = Array.from({ length: foldCount }, (_, i) => {
    const position = (i / foldCount) * 100;
    const isPeak = i % 2 === 0;
    const depth = 0.9 + (i % 4) * 0.04;
    return {
      position: `${position}%`,
      // Extremely smooth gradient with 60+ micro-steps - invisible transitions
      gradient: `linear-gradient(90deg, ${CURTAIN_GRADIENT_STOPS})`,
      isPeak,
      depth,
    };
  });

  return (
    <>
      <div className="curtain-valance" />

      <motion.div
        className="curtain curtain-left"
        initial={{ x: 0, skewY: 0, scaleX: 1 }}
        animate={{ x: "-102%", skewY: -1, scaleX: 0.985 }}
        transition={{
          duration: 2.75,
          ease: [0.7, 0, 0.2, 1],
        }}
      >
        <div className="curtain-sheen-left" />
        <div className="curtain-depth-left" />

        {/* Vertical folds/pleats with dynamic width (narrower at top, wider at bottom) */}
        {folds.map((fold, i) => (
          <div
            key={i}
            className="absolute top-0 h-full"
            style={{
              left: fold.position,
              width: `${100 / foldCount}%`,
              background: fold.gradient,
              opacity: fold.isPeak ? 0.98 : 0.84,
              transform: `scaleY(${fold.depth})`,
              transformOrigin: "top",
              boxShadow: fold.isPeak
                ? "inset 1px 0 5px rgba(255,255,255,0.06), inset -3px 0 10px rgba(0,0,0,0.35)"
                : "inset 1px 0 4px rgba(255,255,255,0.03), inset -2px 0 12px rgba(0,0,0,0.45)",
              // Clip-path creates curtain draping: narrower at top (15-85%), wider at bottom (0-100%)
              clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="curtain curtain-right"
        initial={{ x: 0, skewY: 0, scaleX: 1 }}
        animate={{ x: "102%", skewY: 1, scaleX: 0.985 }}
        transition={{
          duration: 2.75,
          delay: 0.12,
          ease: [0.7, 0, 0.2, 1],
        }}
        onAnimationComplete={onComplete}
      >
        <div className="curtain-sheen-right" />
        <div className="curtain-depth-right" />

        {/* Vertical folds/pleats with dynamic width */}
        {folds.map((fold, i) => (
          <div
            key={i}
            className="absolute top-0 h-full"
            style={{
              left: fold.position,
              width: `${100 / foldCount}%`,
              background: fold.gradient,
              opacity: fold.isPeak ? 0.98 : 0.84,
              transform: `scaleY(${fold.depth})`,
              transformOrigin: "top",
              boxShadow: fold.isPeak
                ? "inset -1px 0 5px rgba(255,255,255,0.06), inset 3px 0 10px rgba(0,0,0,0.35)"
                : "inset -1px 0 4px rgba(255,255,255,0.03), inset 2px 0 12px rgba(0,0,0,0.45)",
              // Clip-path creates curtain draping: narrower at top (15-85%), wider at bottom (0-100%)
              clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
            }}
          />
        ))}
      </motion.div>
    </>
  );
}

function MobileCurtains({ onComplete }: { onComplete: () => void }) {
  // Create horizontal fold pattern (pleats) for mobile
  const foldCount = 12;
  const folds = Array.from({ length: foldCount }, (_, i) => {
    const position = (i / foldCount) * 100;
    const isPeak = i % 2 === 0;
    return {
      position: `${position}%`,
      // Extremely smooth gradient (vertical) with 60+ micro-steps - invisible transitions
      gradient: `linear-gradient(180deg, ${CURTAIN_GRADIENT_STOPS})`,
      isPeak,
    };
  });

  return (
    <>
      <div className="curtain-valance curtain-valance-mobile" />

      <motion.div
        className="curtain curtain-top"
        initial={{ y: 0, scaleY: 1 }}
        animate={{ y: "-102%", scaleY: 0.985 }}
        transition={{
          duration: 2.35,
          ease: [0.7, 0, 0.2, 1],
        }}
      >
        <div className="curtain-sheen-top" />
        <div className="curtain-depth-top" />

        {/* Horizontal folds/pleats */}
        {folds.map((fold, i) => (
          <div
            key={i}
            className="absolute left-0 w-full"
            style={{
              top: fold.position,
              height: `${100 / foldCount}%`,
              background: fold.gradient,
              opacity: fold.isPeak ? 0.98 : 0.85,
              boxShadow: fold.isPeak
                ? "inset 0 1px 4px rgba(255,255,255,0.07), inset 0 -3px 8px rgba(0,0,0,0.35)"
                : "inset 0 1px 3px rgba(255,255,255,0.03), inset 0 -3px 10px rgba(0,0,0,0.42)",
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="curtain curtain-bottom"
        initial={{ y: 0, scaleY: 1 }}
        animate={{ y: "102%", scaleY: 0.985 }}
        transition={{
          duration: 2.35,
          delay: 0.12,
          ease: [0.7, 0, 0.2, 1],
        }}
        onAnimationComplete={onComplete}
      >
        <div className="curtain-sheen-bottom" />
        <div className="curtain-depth-bottom" />

        {/* Horizontal folds/pleats */}
        {folds.map((fold, i) => (
          <div
            key={i}
            className="absolute left-0 w-full"
            style={{
              top: fold.position,
              height: `${100 / foldCount}%`,
              background: fold.gradient,
              opacity: fold.isPeak ? 0.98 : 0.85,
              boxShadow: fold.isPeak
                ? "inset 0 -1px 4px rgba(255,255,255,0.07), inset 0 3px 8px rgba(0,0,0,0.35)"
                : "inset 0 -1px 3px rgba(255,255,255,0.03), inset 0 3px 10px rgba(0,0,0,0.42)",
            }}
          />
        ))}
      </motion.div>
    </>
  );
}
