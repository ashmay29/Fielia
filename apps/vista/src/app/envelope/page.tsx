"use client";

import { useEffect, useState } from "react";
import { EnvelopeAnimation } from "@/components/envelope/EnvelopeAnimation";
import { InvitationContent } from "@/components/invitation/InvitationContent";

export default function EnvelopePage() {
  const [showInvitation, setShowInvitation] = useState<boolean>(false);

  // After mount, reconcile with persisted state without affecting initial hydration
  useEffect(() => {
    try {
      if (localStorage.getItem("fielia_envelope_opened") === "true") {
        // Defer the state transition to the next frame to avoid strict effect lints
        requestAnimationFrame(() => setShowInvitation(true));
      }
    } catch {}
  }, []);

  const handleAnimationComplete = () => {
    try {
      localStorage.setItem("fielia_envelope_opened", "true");
    } catch {}
    console.log("[Analytics] Envelope animation completed");
    setShowInvitation(true);
  };

  const handleAnimationStart = () => {
    console.log("[Analytics] Envelope animation started");
  };

  return (
    <main className="relative min-h-screen w-full bg-[#501515]">
      {/* Layer 1: The Video/Envelope */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          showInvitation ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        suppressHydrationWarning
        aria-hidden={showInvitation}
      >
        {!showInvitation && (
          <EnvelopeAnimation
            onStart={handleAnimationStart}
            onComplete={handleAnimationComplete}
          />
        )}
      </div>

      {/* Layer 2: Invitation Content */}
      <div
        className={`absolute inset-0 z-30 transition-opacity duration-1000 ease-out ${
          showInvitation ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        suppressHydrationWarning
        aria-hidden={!showInvitation}
      >
        <InvitationContent />
      </div>
    </main>
  );
}
