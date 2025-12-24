"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getCardByUuid, createCard, updateCard, CardData } from "./actions";
import { motion } from "framer-motion";

export default function NfcCardPage() {
  const [status, setStatus] = useState<
    "WAITING" | "LOADING" | "SUCCESS" | "NOT_FOUND" | "REGISTERING" | "EDITING"
  >("WAITING");
  const [cardData, setCardData] = useState<CardData | null>(null);
  const inputBuffer = useRef<string>("");
  const [scannedUuid, setScannedUuid] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    preference: "",
  });

  // Timeout to clear buffer if typing stops (prevents random keystrokes from accumulating)
  const bufferTimeout = useRef<NodeJS.Timeout>(null);

  const fetchCard = useCallback(async (uuid: string) => {
    setStatus("LOADING");
    setScannedUuid(uuid); // Store UUID for potential registration
    try {
      const response = await getCardByUuid(uuid);
      if (response.success && response.data) {
        setCardData(response.data);
        setStatus("SUCCESS");
      } else {
        setCardData(null);
        setStatus("NOT_FOUND");
      }
    } catch (error) {
      console.error("Failed to fetch card", error);
      setStatus("NOT_FOUND");
    }
  }, []);

  const handleEditMode = () => {
    if (cardData) {
      setFormData({
        firstName: cardData.firstName,
        lastName: cardData.lastName,
        phone: cardData.phone,
        address: cardData.address,
        preference: cardData.preference,
      });
      setStatus("EDITING");
    }
  };

  const handleRegisterOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = status === "EDITING";
    setStatus(isEditing ? "LOADING" : "REGISTERING"); // Keep status for spinner or update it

    try {
      let response;
      if (isEditing) {
        response = await updateCard({
          uuid: cardData?.uuid || scannedUuid,
          ...formData,
        });
      } else {
        response = await createCard({
          uuid: scannedUuid,
          ...formData,
        });
      }

      if (response.success && response.data) {
        setCardData(response.data);
        setStatus("SUCCESS");
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          address: "",
          preference: "",
        });
      } else {
        alert(
          response.error ||
            `Failed to ${isEditing ? "update" : "register"} card`
        );
        if (!isEditing) setStatus("NOT_FOUND");
        else setStatus("EDITING"); // If editing, stay on editing to fix errors.
      }
    } catch (error) {
      console.error(`${isEditing ? "Update" : "Registration"} failed`, error);
      alert("An unexpected error occurred");
      if (!isEditing) setStatus("NOT_FOUND");
      else setStatus("EDITING");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable scanner input when typing in the form
      if (
        status === "NOT_FOUND" ||
        status === "REGISTERING" ||
        status === "EDITING"
      ) {
        // Allow Escape to reset, but don't listen to other keys as scanner input
        if (e.key === "Escape") {
          setStatus("WAITING");
          setCardData(null);
          inputBuffer.current = "";
          return;
        }
        return;
      }

      // If we are in SUCCESS state, pressing Escape or Space resets to WAITING
      if (status === "SUCCESS") {
        if (e.key === "Escape" || e.key === " ") {
          setStatus("WAITING");
          setCardData(null);
          inputBuffer.current = "";
          return;
        }
        // Allow re-scanning while in result state (scanner acts as keyboard)
      }

      if (e.key === "Enter") {
        const uuid = inputBuffer.current.trim();
        inputBuffer.current = ""; // Clear buffer immediately
        if (uuid) {
          fetchCard(uuid);
        }
        return;
      }

      // Ignore modifiers and non-printable keys (approximated)
      if (e.key.length === 1) {
        inputBuffer.current += e.key;

        // Clear buffer if no input for 2s (allows for manual typing test and slow scanners)
        if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
        bufferTimeout.current = setTimeout(() => {
          inputBuffer.current = "";
        }, 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
    };
  }, [status, fetchCard]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(350,40%,8%)] text-[var(--color-surface)] flex flex-col items-center justify-center">
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content Container */}
      <div className="z-10 w-full max-w-4xl p-8 text-center flex flex-col items-center">
        {status === "WAITING" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 rounded-xl border-2 border-[var(--color-accent)]/30 flex items-center justify-center animate-pulse">
              <svg
                className="w-12 h-12 text-[var(--color-accent)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.848.575-4.133"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-surface)] tracking-wide">
              Ready to Scan
            </h1>
            <p className="text-[var(--color-surface-muted)] font-light tracking-widest text-sm uppercase">
              Please place card on reader
            </p>
          </motion.div>
        )}

        {status === "LOADING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-serif text-xl text-[var(--color-surface-muted)]">
              Verifying Identity...
            </p>
          </motion.div>
        )}

        {status === "REGISTERING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-serif text-xl text-[var(--color-surface-muted)]">
              Registering New Card...
            </p>
          </motion.div>
        )}

        {status === "SUCCESS" && cardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[rgba(20,20,20,0.6)] backdrop-blur-md border border-[var(--color-primary-strong)] p-8 rounded-lg shadow-2xl max-w-3xl mx-auto w-full"
          >
            <div className="mb-6 text-center">
              <span className="inline-block px-3 py-1 text-xs tracking-[0.2em] uppercase border border-[var(--color-accent)] text-[var(--color-accent)] rounded-full mb-6">
                Verified Access
              </span>
              <h2 className="text-4xl md:text-6xl font-serif text-[var(--color-surface)] mb-1 leading-tight">
                {cardData.firstName} {cardData.lastName}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto border-t border-[var(--color-primary-strong)]/30 pt-6">
              {cardData.preference && (
                <div className="md:col-span-2 text-center mb-4">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--color-surface-muted)] mb-2 opacity-70">
                    Preference
                  </label>
                  <p className="text-2xl text-[var(--color-champagne)] font-serif italic text-center text-[#E1D6C7]">
                    &quot;{cardData.preference}&quot;
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--color-surface-muted)] mb-1 opacity-70">
                  Phone
                </label>
                <p className="text-lg text-[var(--color-surface)] font-light tracking-wide">
                  {cardData.phone}
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--color-surface-muted)] mb-1 opacity-70">
                  Address
                </label>
                <p className="text-lg text-[var(--color-surface)] font-light tracking-wide">
                  {cardData.address}
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button
                onClick={handleEditMode}
                className="px-6 py-3 text-sm uppercase tracking-[0.15em] text-[var(--color-accent)] hover:text-white transition-colors border border-[var(--color-accent)] hover:bg-[var(--color-accent)] rounded-sm"
              >
                Edit Details
              </button>
              <button
                onClick={() => {
                  setStatus("WAITING");
                  setCardData(null);
                }}
                className="px-6 py-3 text-sm uppercase tracking-[0.15em] text-[var(--color-surface-muted)] hover:text-white transition-colors border border-transparent hover:border-[var(--color-surface-muted)] rounded-sm"
              >
                Scan Next
              </button>
            </div>
          </motion.div>
        )}

        {(status === "NOT_FOUND" || status === "EDITING") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[rgba(20,20,20,0.8)] backdrop-blur-md border border-[var(--color-primary-strong)] p-8 rounded-lg shadow-2xl"
          >
            <div className="mb-6">
              <span className="text-[var(--color-accent)] text-4xl mb-2 block">
                ❖
              </span>
              <h2 className="text-3xl font-serif text-[var(--color-surface)] mb-2">
                {status === "EDITING" ? "Update Details" : "New Card Detected"}
              </h2>
              <p className="text-[var(--color-surface-muted)] text-sm font-light">
                {status === "EDITING"
                  ? "Modify the details associated with this card."
                  : "Register this card to associate it with a guest."}
              </p>
              {status !== "EDITING" && (
                <p className="text-[var(--color-surface-muted)] font-mono text-xs opacity-50 mt-2">
                  ID: {scannedUuid}
                </p>
              )}
            </div>

            <form
              onSubmit={handleRegisterOrUpdate}
              className="space-y-4 text-left"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-surface-muted)] mb-1">
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-primary-strong)] rounded p-2 text-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none transition-colors"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-surface-muted)] mb-1">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-primary-strong)] rounded p-2 text-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none transition-colors"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-surface-muted)] mb-1">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-primary-strong)] rounded p-2 text-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-surface-muted)] mb-1">
                  Address
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-primary-strong)] rounded p-2 text-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-surface-muted)] mb-1">
                  Preference
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-primary-strong)] rounded p-2 text-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  value={formData.preference}
                  onChange={(e) =>
                    setFormData({ ...formData, preference: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (status === "EDITING") {
                      setStatus("SUCCESS"); // Go back to success view
                    } else {
                      setStatus("WAITING");
                      setScannedUuid("");
                    }
                  }}
                  className="flex-1 py-3 border border-[var(--color-surface-muted)] text-[var(--color-surface-muted)] font-serif tracking-wide rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[var(--color-primary-strong)] text-white font-serif tracking-wide rounded hover:bg-[var(--color-primary)] transition-colors"
                >
                  {status === "EDITING" ? "Update Details" : "Register Card"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
