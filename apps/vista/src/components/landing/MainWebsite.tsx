import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { ReservationForm } from "./ReservationForm";
import Footer from "./Footer";
import { useState } from "react";

interface MainWebsiteProps {
  isVisible: boolean;
  onNavigateToInvitation?: () => void;
  onNavigateToSpotlight?: () => void;
}

const MainWebsite = ({
  isVisible,
  onNavigateToInvitation,
  onNavigateToSpotlight,
}: MainWebsiteProps) => {
  // Track separate states for logo collapse and color transition
  const [isLogoHidden, setIsLogoHidden] = useState(false);
  const [isColorChanged, setIsColorChanged] = useState(false);

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 1.0, // 1s delay before content starts appearing (shows bg only)
      },
    },
  };

  const headerVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const fadeUpVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1.0, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      onScroll={(e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        setIsLogoHidden(scrollTop > 0);
        setIsColorChanged(scrollTop > 100); // Delayed color change to reduce lag
      }}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
        // No background here - uses persistent satinbg.jpeg from page.tsx
      }}
    >
      {/* Scrollable Content Wrapper */}
      <div className="relative min-h-screen flex flex-col items-center">
        {/* Header Section - Appears after 1s */}
        <Navbar
          variants={headerVariants}
          isLogoHidden={isLogoHidden}
          isColorChanged={isColorChanged}
        />
        {/* Hero Content - Fades in after header */}
        <motion.div
          className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center"
          variants={fadeUpVariants}
        >
          {/* Hero visual - Pure typography on background, removed card look */}
          <div className="relative w-full flex flex-col items-center justify-center text-center p-8">
            <p
              className="text-[#E1D6C7]/60 text-xs md:text-sm tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              Welcome to
            </p>
            <h2
              className="text-6xl md:text-9xl text-[#E1D6C7] opacity-90"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontStyle: "italic",
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              The Fielia Experience
            </h2>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px w-12 bg-[#E1D6C7]/30" />
              <span className="text-[#E1D6C7]/60 text-xs font-serif italic">
                Est. MCMXXIII
              </span>
              <div className="h-px w-12 bg-[#E1D6C7]/30" />
            </div>
          </div>
        </motion.div>
        {/* Reservation Section */}
        <motion.div
          className="w-full relative z-10 pb-20"
          variants={fadeUpVariants}
        >
          <ReservationForm />
        </motion.div>
        {/* Footer */}
        <Footer />
        {/* Temporary Dev Controls - Hidden/Subtle */}
        {(onNavigateToInvitation || onNavigateToSpotlight) && (
          <div className="fixed bottom-4 left-4 flex gap-2 opacity-0 hover:opacity-100 transition-opacity z-50">
            {onNavigateToInvitation && (
              <button
                onClick={onNavigateToInvitation}
                className="bg-black/20 text-xs p-1 rounded text-white"
              >
                Back
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MainWebsite;
