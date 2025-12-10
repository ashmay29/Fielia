'use client';
import { useState } from 'react';
import SpotlightCursor from '@/components/landing/SpotlightCursor';
import FieliaMonogram from '@/components/landing/FieliaMonogram';
import InvitationScreen from '@/components/landing/InvitationScreen';
import MainWebsite from '@/components/landing/MainWebsite';

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

  const handleMonogramClick = () => {
    setLogoRevealed(true);
    // Fade out spotlight and show invitation
    setTimeout(() => {
      setShowSpotlight(false);
      setShowInvitation(true);
    }, 1000);
  };

  const handleInvitationEnter = () => {
    // InvitationScreen handles zoom animation (1000ms - faster transition)
    setTimeout(() => {
      setShowInvitation(false);
      setShowMainWebsite(true);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Stage 1: Dark screen with spotlight cursor revealing F logo */}
      {showSpotlight && (
        <div className="absolute inset-0 bg-[#0A0A08]">
          <SpotlightCursor isActive={showSpotlight} />
          <FieliaMonogram
            isRevealed={logoRevealed}
            onReveal={handleMonogramClick}
            cursorPosition={cursorPosition}
          />
        </div>
      )}

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
        />
      )}
    </div>
  );
}
