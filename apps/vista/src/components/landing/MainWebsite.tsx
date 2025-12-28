import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { ReservationForm } from "./ReservationForm";
import Footer from "./Footer";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import StarBorder from "@/components/ui/StarBorder";

interface MainWebsiteProps {
  isVisible: boolean;
}

const MainWebsite = ({ isVisible }: MainWebsiteProps) => {
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

  const ticking = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;

    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const shouldHideLogo = scrollTop > 0;
        const shouldChangeColor = scrollTop > 100;

        setIsLogoHidden(shouldHideLogo);
        setIsColorChanged(shouldChangeColor);

        ticking.current = false;
      });

      ticking.current = true;
    }
  }, []);

  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      onScroll={handleScroll}
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
          className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center relative z-10"
          variants={fadeUpVariants}
        >
          {/* Hero visual - Pure typography on background */}
          <div className="relative w-full flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
            {/* Hero Background Image */}
            <div className="absolute inset-0 z-[-1] overflow-hidden rounded-sm opacity-60">
              <Image
                src="https://placehold.co/1920x1080/1a0505/e1d6c7?text=Ambience+Background"
                alt="Fielia Ambience"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            <p
              className="text-[#E1D6C7] text-xs md:text-sm tracking-[0.3em] uppercase mb-6"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              An exclusive sanctuary for curated cocktails and private
              gatherings
            </p>
            <h2
              className="text-5xl md:text-8xl lg:text-9xl text-[#E1D6C7] opacity-90 mb-8"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontStyle: "italic",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              Fielia Private
              <br />
              Cocktail Bar
            </h2>

            {/* Primary CTA */}
            {/* Primary CTA */}
            <StarBorder
              as={Link}
              href="/membership"
              className="custom-class"
              color="#E1D6C7"
              speed="5s"
            >
              <span
                className="relative z-10 text-[#E1D6C7] tracking-[0.2em] uppercase text-sm font-semibold transition-colors duration-300 group-hover:text-white"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                Apply for Membership
              </span>
            </StarBorder>

            <div className="mt-12 flex items-center gap-4 opacity-60">
              <div className="h-px w-12 bg-[#E1D6C7]/30" />
              <span className="text-[#E1D6C7] text-xs font-serif italic">
                Est. MCMXXIII
              </span>
              <div className="h-px w-12 bg-[#E1D6C7]/30" />
            </div>
          </div>
        </motion.div>

        {/* Cocktail Showcase Section */}
        <motion.div
          className="w-full max-w-7xl mx-auto px-6 py-16 relative z-10"
          variants={fadeUpVariants}
        >
          <div className="flex flex-col items-center mb-10">
            <span
              className="text-[#E1D6C7]/70 text-xs tracking-[0.25em] uppercase border-b border-[#E1D6C7]/20 pb-2 mb-2"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              The Collection
            </span>
            <h3
              className="text-3xl md:text-4xl text-[#E1D6C7] italic"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Curated Libations & Seasonal Menus
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative aspect-[3/4] group overflow-hidden bg-white/5 border border-[#E1D6C7]/10 p-2"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={`https://placehold.co/600x800/2a0a0a/e1d6c7?text=Cocktail+${i}`}
                    alt={`Cocktail Showcase ${i}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-[#E1D6C7] text-lg italic font-serif">
                    Signature {i}
                  </p>
                </div>
              </div>
            ))}
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
      </div>
    </motion.div>
  );
};

export default MainWebsite;
