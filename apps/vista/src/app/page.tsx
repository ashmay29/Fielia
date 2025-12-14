"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import SpotlightCursor from "@/components/landing/SpotlightCursor";

import InvitationScreen from "@/components/landing/InvitationScreen";
import MainWebsite from "@/components/landing/MainWebsite";
import EntranceText from "@/components/landing/EntranceText";

export default function HomePage() {
  // Stage 1: Spotlight reveal of F logo
  const [showSpotlight, setShowSpotlight] = useState(true);

  // Stage 2: Invitation card
  const [showInvitation, setShowInvitation] = useState(false);

  // Stage 3: Main website
  const [showMainWebsite, setShowMainWebsite] = useState(false);
  const [isTransitioningToMain, setIsTransitioningToMain] = useState(false);

  // Automatic transition after "You may enter" completes
  const handleEntranceComplete = useCallback(() => {
    // Prevent re-triggering if we are already past this stage
    if (showInvitation || showMainWebsite) return;

    setShowSpotlight(false);
    setShowInvitation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Safe: this callback is only used to transition from initial state

  useEffect(() => {
    if (!isTransitioningToMain) return;

    const timer = setTimeout(() => {
      setShowInvitation(false);
      setShowMainWebsite(true);
      setIsTransitioningToMain(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTransitioningToMain]);

  const handleInvitationEnter = useCallback(() => {
    setIsTransitioningToMain(true);
  }, []);

  // Temporary navigation handlers for dev purposes
  const handleNavigateToInvitation = () => {
    setShowMainWebsite(false);
    setShowSpotlight(false);
    setShowInvitation(true);
  };

  const handleNavigateToSpotlight = () => {
    setShowMainWebsite(false);
    setShowInvitation(false);
    setShowSpotlight(true);
  };

  const MotionDiv = motion.div as React.ElementType;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "hsl(350 40% 8%)" }}
    >
      {/* Persistent Satin Background - visible across transitions */}
      <div
        className="absolute inset-0 high-quality-bg"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Persistent Animated Overlay - starts nearly black, reveals wine-red edges */}
      <MotionDiv
        className="absolute inset-0"
        initial={{
          background:
            "radial-gradient(ellipse at center, hsl(350 45% 10% / 0.98) 0%, hsl(350 40% 7% / 0.99) 40%, hsl(350 35% 5% / 1.00) 70%, hsl(350 30% 3% / 1.00) 100%)",
        }}
        animate={{
          background:
            "radial-gradient(ellipse at center, hsl(350 45% 10% / 0.50) 0%, hsl(350 40% 7% / 0.75) 40%, hsl(350 35% 5% / 0.95) 70%, hsl(350 30% 3% / 1.00) 100%)",
        }}
        transition={{
          duration: 3,
          ease: "easeOut",
        }}
      />

      {/* Stage 1: Cinematic entrance with spotlight */}
      <MotionDiv
        className="absolute inset-0"
        initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        animate={{
          opacity: showSpotlight ? 1 : 0,
          filter: showSpotlight ? "blur(0px)" : "blur(10px)",
          scale: showSpotlight ? 1 : 1.05,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{ pointerEvents: showSpotlight ? "auto" : "none" }}
      >
        <div className="absolute inset-0">
          <SpotlightCursor isActive={showSpotlight} />

          {/* "You may enter" text */}
          <EntranceText startDelay={3000} onComplete={handleEntranceComplete} />
        </div>
      </MotionDiv>

      {/* Stage 2: Invitation card with keyhole */}
      {showInvitation && (
        <InvitationScreen
          isVisible={showInvitation}
          onEnter={handleInvitationEnter}
        />
      )}

      {/* Stage 3: Main website */}
      {showMainWebsite && (
        <MainWebsite
          isVisible={showMainWebsite}
          onNavigateToInvitation={handleNavigateToInvitation}
          onNavigateToSpotlight={handleNavigateToSpotlight}
        />
      )}
    </div>
  );
}
