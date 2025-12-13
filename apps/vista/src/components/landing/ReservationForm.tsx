"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const ReservationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "",
    date: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto p-12 text-center border border-[#E1D6C7]/20 bg-[#2a0808]/40 backdrop-blur-sm"
      >
        <h3
          className="text-3xl text-[#E1D6C7] mb-4"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontStyle: "italic",
          }}
        >
          Request Received
        </h3>
        <p
          className="text-[#E1D6C7]/80 text-sm tracking-widest uppercase"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          Our concierge will contact you shortly to confirm your reservation.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto px-6 py-20"
    >
      <div className="text-center mb-12 space-y-4">
        <h2
          className="text-4xl md:text-5xl text-[#E1D6C7]"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontStyle: "italic",
          }}
        >
          Request a Table
        </h2>
        <div className="h-px w-24 bg-[#E1D6C7]/30 mx-auto" />
        <p
          className="text-[#E1D6C7]/60 text-xs tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          Exclusive Dining Experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="bg-transparent border-b border-[#E1D6C7]/30 text-[#E1D6C7] focus:border-[#E1D6C7] rounded-none px-0"
            labelClassName="text-[#E1D6C7]"
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-transparent border-b border-[#E1D6C7]/30 text-[#E1D6C7] focus:border-[#E1D6C7] rounded-none px-0"
            labelClassName="text-[#E1D6C7]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            className="bg-transparent border-b border-[#E1D6C7]/30 text-[#E1D6C7] focus:border-[#E1D6C7] rounded-none px-0"
            labelClassName="text-[#E1D6C7]"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Guests"
              name="guests"
              type="number"
              min="1"
              max="10"
              value={formData.guests}
              onChange={handleChange}
              required
              className="bg-transparent border-b border-[#E1D6C7]/30 text-[#E1D6C7] focus:border-[#E1D6C7] rounded-none px-0"
              labelClassName="text-[#E1D6C7]"
            />
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="bg-transparent border-b border-[#E1D6C7]/30 text-[#E1D6C7] focus:border-[#E1D6C7] rounded-none px-0 date-input-gold"
              labelClassName="text-[#E1D6C7]"
            />
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="secondary"
            className="px-12 py-4 text-sm tracking-[0.2em] min-w-[200px]"
          >
            {isSubmitting ? "Sending Request..." : "Request Invitation"}
          </Button>
        </div>
      </form>

      {/* CSS Helper for Date Input Icon Color */}
      <style jsx global>{`
        ::-webkit-calendar-picker-indicator {
          filter: invert(91%) sepia(8%) saturate(365%) hue-rotate(345deg)
            brightness(93%) contrast(88%);
          opacity: 0.6;
          cursor: pointer;
        }
      `}</style>
    </motion.div>
  );
};
