"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";

interface SharedLogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function SharedLogo({ size = "small", className }: SharedLogoProps) {
  return (
    // @ts-expect-error - Framer Motion v10 + React 19 type compatibility issue
    <motion.div layoutId="fielia-logo" className={className}>
      <Logo size={size} />
    </motion.div>
  );
}
