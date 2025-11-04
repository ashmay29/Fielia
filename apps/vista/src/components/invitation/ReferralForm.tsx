"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ReferralForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    referralCode: "",
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="relative rounded-sm border border-[#501515]/20 bg-[#E1D6C7]/30 px-8 py-12 text-center">
        <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-[#370D10] sm:text-xl">
          Thank you. Your request has been received.
          <br />
          We'll reach out via referral.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6">
      <Input
        id="fullName"
        name="fullName"
        type="text"
        label="Full Name"
        required
        value={formData.fullName}
        onChange={handleChange}
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email Address"
        required
        value={formData.email}
        onChange={handleChange}
      />

      <Input
        id="referralCode"
        name="referralCode"
        type="text"
        label="Referral Code"
        optional
        value={formData.referralCode}
        onChange={handleChange}
      />

      <Textarea
        id="note"
        name="note"
        label="Short Note"
        rows={4}
        value={formData.note}
        onChange={handleChange}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full px-8 py-4 text-base sm:text-lg"
      >
        Request an Invitation
      </Button>
    </form>
  );
}
