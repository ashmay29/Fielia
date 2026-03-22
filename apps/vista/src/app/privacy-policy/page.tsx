"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useState, useRef, useCallback } from "react";

const PrivacyPolicyPage = () => {
  const [isLogoHidden, setIsLogoHidden] = useState(false);
  const [isColorChanged, setIsColorChanged] = useState(false);
  const ticking = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        setIsLogoHidden(scrollTop > 0);
        setIsColorChanged(scrollTop > 100);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  const fadeUp: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-[#1a0505] text-[#E1D6C7]"
      onScroll={handleScroll}
    >
      {/* Persistent Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar wrapper */}
        <Navbar isLogoHidden={isLogoHidden} isColorChanged={isColorChanged} />

        <motion.main
          initial="hidden"
          animate="visible"
          className="flex-1 w-full max-w-4xl mx-auto px-6 py-24 sm:py-32 flex flex-col"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-16 px-4">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl mb-4 text-[#E1D6C7]"
              style={{
                fontFamily: "var(--font-quintessential), cursive",
              }}
            >
              Privacy Policy
            </h1>
            <p
              className="text-[#E1D6C7]/60 text-lg sm:text-xl italic"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Protecting your exclusivity and trust.
            </p>
            <div className="w-24 h-px bg-[#E1D6C7]/30 mx-auto mt-8" />
          </motion.div>

          {/* Content Container */}
          <motion.div
            variants={fadeUp}
            className="w-full p-8 sm:p-12 border border-[#E1D6C7]/20 bg-black/40 backdrop-blur-md rounded-sm shadow-2xl space-y-8 text-[#E1D6C7]/80 text-sm sm:text-base leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            <p><strong>Last Updated:</strong> March 2026</p>

            <section className="space-y-4">
              <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>1. Introduction</h2>
              <p>Welcome to Fielia ("we," "our," or "us"), a private invite-only bar and supper theatre located at the Mahalaxmi Racecourse, Mumbai. Your privacy is of the utmost importance to us. This Privacy Policy details how we collect, use, and protect your personal data when you visit our website, request membership, make reservations, or engage with our exclusive cinematic cocktail and culinary experiences.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>2. Information We Collect</h2>
              <p>To provide you with our premium, personalized services, we may collect the following types of information:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#E1D6C7]/70">
                <li><strong>Identity & Contact Data:</strong> Full name, email address, phone number, and physical address collected during membership applications or reservation requests.</li>
                <li><strong>Profile & Preference Data:</strong> Dietary requirements, seating preferences, celebration dates, and historical patronage details to tailor our culinary direction and service.</li>
                <li><strong>Technical & Usage Data:</strong> IP addresses, browser types, and interactions with our website to optimize the digital cinematic experience.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>3. How We Use Your Information</h2>
              <p>Your data enables us to maintain Fielia’s bespoke standards. We utilize your information to:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#E1D6C7]/70">
                <li>Review, verify, and approve private membership applications.</li>
                <li>Process reservations for the main room, mezzanine galleries, and private events.</li>
                <li>Personalize your experience through noted preferences and curated invitations to "Sin & Scandal" previews, tasting menus, and new launches.</li>
                <li>Communicate important updates regarding your membership, our operational hours, or changes to this policy.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>4. Data Security & Discretion</h2>
              <p>Discretion is a pillar of our establishment. We implement robust, industry-standard security measures to prevent unauthorized access, disclosure, or alteration of your personal data. Access to your information is strictly limited to authorized personnel necessary to facilitate your membership and dining experiences.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>5. Sharing Your Information</h2>
              <p>We do not sell or rent your personal data. We may share your information solely with trusted third-party service providers (such as payment processors and reservation partners) who adhere to strict confidentiality agreements, or when mandated by applicable Indian law.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>6. Your Rights</h2>
              <p>As a patron, you hold the right to access, correct, or request the deletion of your personal data stored with us. Should you wish to exercise these rights or amend your preferences, please contact our concierge.</p>
            </section>

            <section className="space-y-4 pt-4 border-t border-[#E1D6C7]/20">
              <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>Contact Us</h2>
              <p>For any inquiries regarding this Privacy Policy or your personal data, please contact us at:</p>
              <p className="mt-2 text-[#E1D6C7]"><strong>Fielia</strong><br />Mahalaxmi Racecourse, Mumbai, India</p>
            </section>
          </motion.div>
        </motion.main>

        <Footer />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
