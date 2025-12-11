'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SpotlightCursor from '@/components/landing/SpotlightCursor';
import FieliaMonogram from '@/components/landing/FieliaMonogram';
import InvitationScreen from '@/components/landing/InvitationScreen';
import MainWebsite from '@/components/landing/MainWebsite';
import EntranceText from '@/components/landing/EntranceText';

export default function HomePage() {
  // Stage 1: Spotlight reveal of F logo
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [logoRevealed, setLogoRevealed] = useState(false);

  // Stage 2: Invitation card
  const [showInvitation, setShowInvitation] = useState(false);

  // Stage 3: Main website
  const [showMainWebsite, setShowMainWebsite] = useState(false);

  // Track cursor position for monogram proximity detection
  if (typeof window !== 'undefined' && showSpotlight) {
    window.addEventListener('mousemove', (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    });
  }

  // Automatic transition after "You may enter" completes
  const handleEntranceComplete = () => {
    setShowSpotlight(false);
    setShowInvitation(true);
  };

  const handleInvitationEnter = () => {
    // InvitationScreen handles zoom animation (1000ms - faster transition)
    setTimeout(() => {
      setShowInvitation(false);
      setShowMainWebsite(true);
    }, 1000);
  };

  // Temporary navigation handlers for dev purposes
  const handleNavigateToInvitation = () => {
    setShowMainWebsite(false);
    setShowSpotlight(false);
    setShowInvitation(true);
    setLogoRevealed(false);
  };

  const handleNavigateToSpotlight = () => {
    setShowMainWebsite(false);
    setShowInvitation(false);
    setShowSpotlight(true);
    setLogoRevealed(false);
  };

  const MotionDiv = motion.div as any;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: 'hsl(350 40% 8%)' }}>
      {/* Stage 1: Cinematic entrance with spotlight */}
      <MotionDiv
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: showSpotlight ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ pointerEvents: showSpotlight ? "auto" : "none" }}
      >
        {showSpotlight && (
          <div className="absolute inset-0">
            {/* Satin background image */}
            <div
              className="absolute inset-0 high-quality-bg"
              style={{
                backgroundImage: 'url(/satinbg.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Animated overlay - starts nearly black, reveals wine-red edges */}
            <MotionDiv
              className="absolute inset-0"
              initial={{
                background: 'radial-gradient(ellipse at center, hsl(350 45% 10% / 0.98) 0%, hsl(350 40% 7% / 0.99) 40%, hsl(350 35% 5% / 1.00) 70%, hsl(350 30% 3% / 1.00) 100%)',
              }}
              animate={{
                background: 'radial-gradient(ellipse at center, hsl(350 45% 10% / 0.50) 0%, hsl(350 40% 7% / 0.75) 40%, hsl(350 35% 5% / 0.95) 70%, hsl(350 30% 3% / 1.00) 100%)',
              }}
              transition={{
                duration: 3,
                ease: "easeOut",
              }}
            />

            <SpotlightCursor isActive={showSpotlight} />

            {/* "You may enter" text */}
            <EntranceText
              startDelay={3000}
              onComplete={handleEntranceComplete}
            />
          </div>
        )}
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
