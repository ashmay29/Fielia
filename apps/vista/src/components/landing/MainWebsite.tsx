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

  // Cinematic story panels with overlaid copy
  const storyPanels = [
    {
      kicker: "Provenance",
      title: "Curtains Rise. FIELIA Begins.",
      body:
        "An invite-only bar by Afsana Verma, Amit Verma, and Dhaval Udeshi — designed by Gauri Khan. Inside the iconic Mahalaxmi Race Course, Fielia reimagines the aperitivo bar as a Cocktail Cinema.",
      image: "/interior/DSC02056-Edit.jpg",
      align: "right" as const,
    },
    {
      kicker: "Cocktail Cinema",
      title: "Sin & Scandal",
      body:
        "A cinematic, cocktail-forward experience: dress-circle seats, a double-height room, mezzanine galleries like theatre boxes, and a bar that plays the screen — the stage where every pour unfolds.",
      image: "/interior/DSC02076-Edit.jpg",
      align: "left" as const,
    },
    {
      kicker: "The Space",
      title: "Designed by Gauri Khan",
      body:
        "Century-old mill architecture becomes cinematic, sensual, and modern: a moody ground floor wrapped in wrought-iron stairs, with a mezzanine that mirrors vintage theatre drama.",
      image: "/interior/DSC02065-Edit.jpg",
      align: "right" as const,
    },
    {
      kicker: "Culinary Direction",
      title: "Chef Hitesh Shanbhag",
      body:
        "Aperitivo plates interpret the seven sins through precise, expressive cooking — from pillowy Sage Chèvre Gnocchi to molten Burnt Basque & Cacao Textures. Nothing overwhelms. Everything entices.",
      image: "/interior/DSC02069-Edit-2.jpg",
      align: "left" as const,
    },
  ];

  // Unified border radii (text : image = 1 : 1.5)
  const TEXT_RADIUS = 12; // px
  const IMAGE_RADIUS = TEXT_RADIUS * 1.5;

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
          textRadius={TEXT_RADIUS}
        />
        {/* Hero Content - Fades in after header */}
        <motion.div
          className="flex-1 w-full relative z-10 min-h-[70vh] sm:min-h-[75vh] md:min-h-[85vh]"
          variants={fadeUpVariants}
        >
          {/* Hero Background Image - Full bleed */}
          <div className="absolute inset-0 z-[-1] overflow-hidden">
            <Image
              src="/interior/DSC02069-Edit-2.jpg"
              alt="Fielia Ambience"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          {/* Hero visual - Pure typography on background */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-10 flex flex-col items-center justify-center text-center min-h-[70vh] sm:min-h-[75vh] md:min-h-[85vh]">

            <p
              className="text-[#E1D6C7] text-[0.65rem] sm:text-xs md:text-sm tracking-[0.3em] uppercase mb-4 sm:mb-6 px-4"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              Curtains Rise. Fielia Begins.
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#E1D6C7] opacity-90 mb-5 sm:mb-7 leading-tight px-4"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontStyle: "italic",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              Fielia Private Bar
            </h2>

            {/* Mobile-only supporting line removed as requested */}

            {/* Invitation copy above CTA */}
            <p
              className="text-[#E1D6C7]/90 text-sm sm:text-base italic font-serif mb-4 sm:mb-5 px-2"
            >
              Enter the hush—where excellence lingers in every pour.
            </p>

            {/* Primary CTA */}
            <StarBorder
              as={Link}
              href="/membership"
              className="custom-class"
              color="#E1D6C7"
              speed="5s"
            >
              <span
                className="relative z-10 text-[#E1D6C7] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm font-semibold transition-colors duration-300 group-hover:text-white px-6 sm:px-0"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                Apply for Membership
              </span>
            </StarBorder>

            <div className="mt-8 sm:mt-12 flex items-center gap-3 sm:gap-4 opacity-60">
              <div className="h-px w-8 sm:w-12 bg-[#E1D6C7]/30" />
              <span className="text-[#E1D6C7] text-[0.65rem] sm:text-xs font-serif italic">
                Est. MCMXXIII
              </span>
              <div className="h-px w-8 sm:w-12 bg-[#E1D6C7]/30" />
            </div>
          </div>
        </motion.div>

        {/* Cinematic Story Panels */}
        <motion.section
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid gap-8 md:gap-12"
          variants={fadeUpVariants}
        >
          {storyPanels.map((panel, i) => (
            <div
              key={i}
              className="relative w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9] overflow-hidden border border-[#E1D6C7]/15 shadow-[0_20px_80px_rgba(0,0,0,0.45)] group"
              style={{ borderRadius: `${IMAGE_RADIUS}px` }}
            >
              <Image
                src={panel.image}
                alt={panel.title}
                fill
                className="object-cover"
                priority={i === 0}
              />

              {/* Shared overlay to keep copy readable */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/25 md:bg-gradient-to-l md:from-black/70 md:via-black/40 md:to-transparent"
                style={{ borderRadius: `${IMAGE_RADIUS}px` }}
              />

              {/* Abstract glow accents */}
              <div className="absolute -left-10 top-8 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(225,214,199,0.14),_rgba(12,5,7,0.05)_65%)] blur-2xl opacity-80 pointer-events-none" />
              <div className="absolute right-6 bottom-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(217,120,99,0.25),_rgba(12,5,7,0)_70%)] blur-xl opacity-70 pointer-events-none" />

              {/* Mobile-first copy stack pinned to bottom in a framed card */}
              <div
                className={`absolute inset-x-0 bottom-0 md:hidden flex pb-5 ${
                  panel.align === "right"
                    ? "justify-end pr-4 sm:pr-6"
                    : "justify-start pl-4 sm:pl-6"
                }`}
              >
                <div
                  className="relative w-[86%] sm:w-[78%] max-w-[520px] bg-[#0c0507]/78 backdrop-blur-[8px] p-6 sm:p-7 border border-[#E1D6C7]/25 shadow-[0_16px_60px_rgba(0,0,0,0.6)] translate-y-3 group-hover:-translate-y-1 transition-transform duration-400"
                  style={{ borderRadius: `${TEXT_RADIUS}px` }}
                >
                  <div
                    className="absolute -inset-[10px] border border-[#E1D6C7]/8 blur-[2px]"
                    style={{ borderRadius: `${TEXT_RADIUS + 6}px` }}
                  />
                  <div className="flex items-center gap-3 pb-3 border-b border-[#E1D6C7]/15 relative z-10">
                    <span
                      className="text-[#E1D6C7]/70 text-[0.7rem] sm:text-xs tracking-[0.25em] uppercase"
                      style={{ fontFamily: "var(--font-cormorant), serif" }}
                    >
                      {panel.kicker}
                    </span>
                    <span className="h-px flex-1 bg-[#E1D6C7]/20" />
                  </div>
                  <div className="relative z-10">
                    <h3
                      className="text-xl sm:text-2xl text-[#E1D6C7] italic mt-3 mb-2"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {panel.title}
                    </h3>
                    <p
                      className="text-[#E1D6C7]/85 text-sm leading-relaxed"
                      style={{ fontFamily: "var(--font-cormorant), serif" }}
                    >
                      {panel.body}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop/tablet layout keeps directional alignment */}
              <div
                className={`hidden md:flex absolute inset-y-0 ${
                  panel.align === "right" ? "right-0" : "left-0"
                } items-center`}
              >
                <div
                  className="relative m-6 md:m-8 max-w-[620px] bg-black/45 backdrop-blur-[4px] p-6 md:p-8 border border-[#E1D6C7]/15 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                  style={{ borderRadius: `${TEXT_RADIUS}px` }}
                >
                  <div
                    className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(217,120,99,0.18),_rgba(12,5,7,0)_70%)] blur-xl opacity-80"
                    style={{ borderRadius: `${TEXT_RADIUS}px` }}
                  />
                  <span
                    className="block text-[#E1D6C7]/70 text-[0.7rem] sm:text-xs tracking-[0.25em] uppercase pb-2"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    {panel.kicker}
                  </span>
                  <h3
                    className="text-2xl md:text-3xl text-[#E1D6C7] italic mb-2"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {panel.title}
                  </h3>
                  <p
                    className="text-[#E1D6C7]/85 text-sm md:text-base leading-relaxed"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    {panel.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.section>

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
              Cocktail Cinema
            </span>
            <h3
              className="text-3xl md:text-4xl text-[#E1D6C7] italic text-center"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Sin & Scandal — A Cocktail Narrative
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: "/F&B/Illuminati.JPG", name: "Illuminati" },
              { img: "/F&B/Red Card.JPG", name: "Red Card" },
              { img: "/F&B/Stolen Kohinoor.JPG", name: "Stolen Kohinoor" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] group overflow-hidden bg-white/5 border border-[#E1D6C7]/10 p-2"
                style={{ borderRadius: `${IMAGE_RADIUS}px` }}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{ borderRadius: `${IMAGE_RADIUS}px` }}
                >
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    style={{ borderRadius: `${IMAGE_RADIUS}px` }}
                  />
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-[#E1D6C7] text-lg italic font-serif">
                    {item.name}
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
