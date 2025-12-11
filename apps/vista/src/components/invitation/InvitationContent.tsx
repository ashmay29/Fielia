"use client";

import { motion } from "framer-motion";
import { SharedLogo } from "@/components/ui/SharedLogo";
import { ReferralForm } from "@/components/invitation/ReferralForm";
import { Footer } from "@/components/common/Footer";

interface InvitationContentProps {
  visible?: boolean;
}

export function InvitationContent({ visible = true }: InvitationContentProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Slower stagger for luxurious feel
        delayChildren: 0.4, // Wait a bit more after zoom
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 }, // Slightly more travel distance
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1], // Custom smooth easing
      },
    },
  };

  return (
    <motion.div
      // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
      className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 md:py-20"
      variants={containerVariants}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
        className="relative mb-8 flex items-center justify-between border-b border-[#370D10]/10 pb-6"
      >
        <SharedLogo size="small" />
        <span className="font-(family-name:--font-cormorant) text-xs uppercase tracking-[0.2em] text-[#370D10]/60 sm:text-sm">
          Private Invitation
        </span>
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        variants={itemVariants}
        // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
        className="relative mb-8 font-(family-name:--font-playfair) text-3xl font-semibold tracking-tight text-[#370D10] sm:text-4xl md:text-5xl"
      >
        Welcome to FIELIA
      </motion.h1>

      {/* Body Copy */}
      <motion.div
        variants={itemVariants}
        // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
        className="relative mb-12 space-y-4 font-(family-name:--font-cormorant) text-base leading-relaxed text-[#370D10]/90 sm:text-lg sm:leading-loose"
      >
        <p>
          Fielia is an invite-only bar and supper club in Mumbai that embodies
          discretion, intimacy, and refined luxury. Created by Dhaval Udeshi,
          Afsana Verma, and Amit Verma, with design by Gauri Khan, it channels
          the spirit of 1920s art-deco salons.
        </p>
        <p>
          Its minimalist bar, EDIT by Fay Barretto, and supper club by Chef
          Hitesh Shanbhag offer an experience defined by restraint and elegance.
        </p>
        <p>
          Membership is private and by referral only — a world where
          conversation, craft, and culture meet in quiet sophistication.
        </p>
      </motion.div>

      {/* Feature Grid */}
      <motion.section
        variants={itemVariants}
        // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
        className="mb-12 grid gap-10 sm:gap-12 md:grid-cols-3"
      >
        {/* Card 1 */}
        <div className="group">
          <div className="aspect-4/3 w-full overflow-hidden rounded-sm bg-[#D8CBBB] shadow-[inset_0_1px_0_rgba(55,13,16,0.08)]">
            <div className="h-full w-full bg-linear-to-b from-[#E1D6C7] to-[#D8CBBB]" />
          </div>
          <h3 className="mt-5 font-(family-name:--font-playfair) text-2xl font-medium text-[#370D10]">
            Dress Code
          </h3>
          <p className="mt-2 font-(family-name:--font-cormorant) text-[#370D10]/80">
            The club observes an elegant dress code for all members and their
            guests.
          </p>
          <div className="mt-3 font-(family-name:--font-cormorant) text-[#501515]">
            →
          </div>
        </div>

        {/* Card 2 */}
        <div className="group">
          <div className="aspect-4/3 w-full overflow-hidden rounded-sm bg-[#D8CBBB] shadow-[inset_0_1px_0_rgba(55,13,16,0.08)]">
            <div className="h-full w-full bg-linear-to-b from-[#D8CBBB] to-[#CDBFAF]" />
          </div>
          <h3 className="mt-5 font-(family-name:--font-playfair) text-2xl font-medium text-[#370D10]">
            Club Rules
          </h3>
          <p className="mt-2 font-(family-name:--font-cormorant) text-[#370D10]/80">
            Members are expected to be familiar with our rules and ensure their
            guests adhere to them.
          </p>
          <div className="mt-3 font-(family-name:--font-cormorant) text-[#501515]">
            →
          </div>
        </div>

        {/* Card 3 */}
        <div className="group">
          <div className="aspect-4/3 w-full overflow-hidden rounded-sm bg-[#D8CBBB] shadow-[inset_0_1px_0_rgba(55,13,16,0.08)]">
            <div className="h-full w-full bg-linear-to-b from-[#E6DED1] to-[#D8CBBB]" />
          </div>
          <h3 className="mt-5 font-(family-name:--font-playfair) text-2xl font-medium text-[#370D10]">
            Cultural Programme
          </h3>
          <p className="mt-2 font-(family-name:--font-cormorant) text-[#370D10]/80">
            Conversations, gallery evenings, wine dinners and more—curated for
            quiet sophistication.
          </p>
          <div className="mt-3 font-(family-name:--font-cormorant) text-[#501515]">
            →
          </div>
        </div>
      </motion.section>

      {/* Referral Form & Footer */}
      <motion.div variants={itemVariants}>
        <ReferralForm />
        <Footer />
      </motion.div>
    </motion.div>
  );
}
