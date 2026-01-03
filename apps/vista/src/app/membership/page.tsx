"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useState, useRef, useCallback } from "react";
import StarBorder from "@/components/ui/StarBorder";
import Masonry from "@/components/ui/Masonry";
import { createMembershipApplication } from "./actions";

// Sample data for Masonry
const masonryItems = [
  {
    id: "1",
    img: "/F&B/Illuminati.JPG",
    url: "",
    height: 400,
  },
  {
    id: "2",
    img: "/F&B/Red Card.JPG",
    url: "",
    height: 300,
  },
  {
    id: "3",
    img: "/F&B/Sage chèvre gnocchi.JPG",
    url: "",
    height: 600,
  },
  {
    id: "4",
    img: "/F&B/Smoke chimichurri.JPG",
    url: "",
    height: 300,
  },
  {
    id: "5",
    img: "/F&B/Stolen Kohinoor.JPG",
    url: "",
    height: 400,
  },
  {
    id: "6",
    img: "/F&B/Brunt basque&cacao textures.JPG",
    url: "",
    height: 450,
  },
  {
    id: "7",
    img: "/F&B/Lobster&scampi mac n cheese.JPG",
    url: "",
    height: 500,
  },
  {
    id: "8",
    img: "/F&B/Smoke salmon bruschetta .JPG",
    url: "",
    height: 250,
  },
];

// Reusing Navbar component logic simply (state could be lifted if needed globally in a real app,
// strictly creating the page structure here)
const MembershipPage = () => {
  const [isLogoHidden, setIsLogoHidden] = useState(false);
  const [isColorChanged, setIsColorChanged] = useState(false);
  const ticking = useRef(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Moved items outside

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await createMembershipApplication(formData);

      if (response.success) {
        setSubmitStatus("success");
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          reason: "",
        });
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 5000);
      } else {
        setSubmitStatus("error");
        setErrorMessage(response.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      title: "Priority Access",
      desc: "Dedicated reservations, concierge support & remembered preferences.",
    },
    {
      title: "Private Invitations",
      desc: "Exclusive entry to launches, previews, cocktail theatre & curated gatherings.",
    },
    {
      title: "Member Events",
      desc: "Supper clubs, tasting menus, cinematic sessions & seasonal celebrations.",
    },
    {
      title: "First Access",
      desc: "New menus, premieres & limited-seat experiences before public release.",
    },
    {
      title: "Celebratory Benefits",
      desc: "Special privileges & birthday/anniversary delight.",
    },
    {
      title: "Friends & Family Privileges",
      desc: "Extend select benefits to your inner circle.",
    },
    {
      title: "Signature Welcome Experience",
      desc: "Complimentary welcome cocktail for member + 3 guests.",
    },
    {
      title: "Sins & Scandal Access",
      desc: "Priority to themed nights, secret dinners & special menus.",
    },
    {
      title: "Legacy Pathway",
      desc: "Eligibility for lifetime priority and future concept advantages.",
    },
  ];

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
      {/* Persistent Background (matching global style if needed, or specific to this page) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
        }}
      />
      {/* Masonry Background Layer - Fixed and masked/blended potentially, or just behind content */}
      <div className="absolute inset-0 top-[175px] z-0 opacity-40 pointer-events-none">
        <Masonry
          items={masonryItems}
          ease="power3.out"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover={false}
          hoverScale={0.95}
          blurToFocus={true}
          colorShiftOnHover={false}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Helper Navbar wrapper */}
        <Navbar isLogoHidden={isLogoHidden} isColorChanged={isColorChanged} />

        <motion.main
          initial="hidden"
          animate="visible"
          className="flex-1 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center"
        >
          {/* Header */}
          <motion.div
            variants={fadeUp}
            className="text-center mb-20 max-w-3xl px-4"
          >
            <h1
              className="text-5xl sm:text-6xl md:text-7xl mb-6 sm:whitespace-nowrap"
              style={{
                fontFamily: "var(--font-quintessential), cursive",
              }}
            >
              Fielia&apos;s Cocktail Community
            </h1>
            <p
              className="text-white/70 text-4xl sm:text-4xl md:text-5xl lg:text-5xl"
              style={{ fontFamily: "var(--font-monsieur), cursive" }}
            >
              Unlock a world of exclusive privileges.
            </p>
            <div className="w-24 h-px bg-[#E1D6C7]/30 mx-auto mt-8 mb-12" />
          </motion.div>

          {/* Content Container: Side by Side on Desktop */}
          <div className="flex flex-col lg:flex-row w-full gap-12 lg:gap-20 items-start mt-16">
            {/* Left Side: Benefits */}
            <div className="flex-1 w-full">
              <div className="w-full p-6 sm:p-8 border border-[#E1D6C7]/20 bg-black/40 backdrop-blur-md rounded-sm">
                <h2
                  className="text-2xl md:text-3xl mb-8 text-center lg:text-left"
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    fontStyle: "italic",
                  }}
                >
                  Exclusive Privileges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 py-4 w-full">
                  {benefits.map((b, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-row items-start gap-4 text-left group"
                    >
                      {/* Decorative Icon Substitute (Diamond/Dot) */}
                      <div className="w-2 h-2 rotate-45 bg-[#E1D6C7] mt-2 shrink-0 group-hover:bg-[#C5A572] transition-colors" />

                      <div>
                        <h3
                          className="text-xl mb-2 text-[#E1D6C7]"
                          style={{ fontFamily: "var(--font-playfair), serif" }}
                        >
                          {b.title}
                        </h3>
                        <p
                          className="text-[#E1D6C7]/60 font-serif leading-relaxed"
                          style={{
                            fontFamily: "var(--font-cormorant), serif",
                            fontSize: "1rem",
                          }}
                        >
                          {b.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Application Form */}
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 lg:sticky lg:top-32">
              <motion.div
                variants={fadeUp}
                whileInView="visible"
                initial="hidden"
                className="w-full p-8 border border-[#E1D6C7]/20 bg-black/40 backdrop-blur-md rounded-sm"
              >
                <div className="text-center mb-10">
                  <h2
                    className="text-3xl md:text-4xl mb-2"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    Request Invitation
                  </h2>
                  <p className="text-[#E1D6C7]/60 text-sm italic">
                    Begin your journey with Fielia
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {submitStatus === "success" && (
                    <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded text-sm">
                      Thank you! Your application has been submitted
                      successfully.
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm">
                      {errorMessage}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="fullName"
                        className="text-xs uppercase tracking-widest text-[#E1D6C7]/70"
                      >
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        disabled={isSubmitting}
                        className="bg-transparent border-b border-[#E1D6C7]/30 py-2 focus:outline-none focus:border-[#E1D6C7] text-[#E1D6C7] transition-colors disabled:opacity-50"
                        placeholder="Jane Doe"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="email"
                        className="text-xs uppercase tracking-widest text-[#E1D6C7]/70"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        disabled={isSubmitting}
                        className="bg-transparent border-b border-[#E1D6C7]/30 py-2 focus:outline-none focus:border-[#E1D6C7] text-[#E1D6C7] transition-colors disabled:opacity-50"
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <label
                      htmlFor="reason"
                      className="text-xs uppercase tracking-widest text-[#E1D6C7]/70"
                    >
                      Reason for Interest
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      required
                      disabled={isSubmitting}
                      className="bg-transparent border-b border-[#E1D6C7]/30 py-2 focus:outline-none focus:border-[#E1D6C7] text-[#E1D6C7] transition-colors resize-none disabled:opacity-50"
                      placeholder="Tell us a bit about yourself..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    />
                  </div>

                  <div className="pt-8 text-center">
                    <StarBorder
                      as="button"
                      type="submit"
                      className="custom-class"
                      color="#E1D6C7"
                      speed="5s"
                      disabled={isSubmitting}
                    >
                      <span className="text-[#E1D6C7] uppercase tracking-[0.2em] font-bold text-sm">
                        {isSubmitting
                          ? "Submitting..."
                          : "Apply for exclusivity"}
                      </span>
                    </StarBorder>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.main>

        <Footer />
      </div>
    </div>
  );
};

export default MembershipPage;
