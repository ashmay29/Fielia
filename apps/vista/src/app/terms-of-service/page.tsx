"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useState, useRef, useCallback } from "react";

const TermsOfServicePage = () => {
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
                            Terms of Service
                        </h1>
                        <p
                            className="text-[#E1D6C7]/60 text-lg sm:text-xl italic"
                            style={{ fontFamily: "var(--font-playfair), serif" }}
                        >
                            The definitive rules of engagement.
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
                            <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>1. Acceptance of Terms</h2>
                            <p>By accessing the website or securing a reservation/membership at Fielia, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our digital and physical premises.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>2. Elite Membership & Access</h2>
                            <p>Fielia is an invite-only Cocktail Cinema Bar & Supper Theatre. Access to membership applications and subsequent approval is solely at the discretion of the founders and management. We reserve the right to revoke or suspend membership privileges if our standards of conduct or exclusivity parameters are breached.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>3. Reservations & Cancellations</h2>
                            <ul className="list-disc pl-5 space-y-2 text-[#E1D6C7]/70">
                                <li>Reservations are strictly subject to availability and member prioritization.</li>
                                <li>Due to the exclusive nature of our culinary direction and seating arrangements, cancellations must be communicated at least 24 hours prior to the reservation.</li>
                                <li>Failure to honor a reservation without adequate notice may impact future booking privileges.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>4. Code of Conduct</h2>
                            <p>Patrons are expected to maintain an elevated level of decorum reflecting the elegant, cinematic nature of Fielia. A formal or smart-chic dress code applies; sportswear and informal attire are strictly prohibited. The management reserves the right to refuse entry to anyone failing to meet these standards.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>5. Intellectual Property</h2>
                            <p>All content on this website—including photography, branding, menu descriptions, and the "Sin & Scandal" conceptual framework—is the intellectual property of Fielia unless otherwise noted. Unauthorized reproduction, distribution, or commercial use is strictly prohibited.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>6. Limitation of Liability</h2>
                            <p>Fielia shall not be held liable for any direct, indirect, or consequential damages arising from your use of this website or instances occurring during your visit, except as mandated by the governing laws of India.</p>
                        </section>

                        <section className="space-y-4 pt-4 border-t border-[#E1D6C7]/20">
                            <h2 className="text-2xl text-[#E1D6C7] italic mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>Contact Us</h2>
                            <p>If you have questions regarding these Terms, please reach out to us at:</p>
                            <p className="mt-2 text-[#E1D6C7]"><strong>Fielia</strong><br />Mahalaxmi Racecourse, Mumbai, India</p>
                        </section>
                    </motion.div>
                </motion.main>

                <Footer />
            </div>
        </div>
    );
};

export default TermsOfServicePage;
