"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EntranceText from "@/components/landing/EntranceText";
import MainWebsite from "@/components/landing/MainWebsite";

// All images used by MainWebsite — preloaded while the entrance text is showing
const PRELOAD_IMAGES = [
  "/satinbg.jpeg",
  "/interior/DSC02056-Edit.jpg",
  "/interior/DSC02076-Edit.jpg",
  "/interior/DSC02065-Edit.jpg",
  "/interior/DSC02069-Edit-2.jpg",
  "/F&B/Illuminati.JPG",
  "/F&B/Red Card.JPG",
  "/F&B/Stolen Kohinoor.JPG",
];

export default function HomePage() {
  const [showText, setShowText] = useState(false);
  const [showSite, setShowSite] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");

    if (hasSeenIntro) {
      // Skip intro entirely on revisit
      setShowSite(true);
    } else {
      // Show entrance text immediately, then reveal site
      setShowText(true);

      // Preload all images in the background
      PRELOAD_IMAGES.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });

      // Show site after entrance text finishes (3.2s fade-in + 1s hold + 0.6s fade-out = ~4.8s + small buffer)
      const siteTimeout = setTimeout(() => {
        setShowText(false);
        setShowSite(true);
        sessionStorage.setItem("hasSeenIntro", "true");
      }, 5000);

      return () => clearTimeout(siteTimeout);
    }
  }, []);

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
        animate={{ opacity: showText || showSite ? 1 : 0 }}
        transition={{
          duration: 4,
          delay: 0.3,
          ease: [0.16, 1, 0.3, 1],
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

      {/* Stage 1: "You may enter" Text */}
      {showText && <EntranceText startDelay={0} />}

      {/* Stage 2: Main Website */}
      {showSite && <MainWebsite isVisible={showSite} />}
    </div>
  );
}
