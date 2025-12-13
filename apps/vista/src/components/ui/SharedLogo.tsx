"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";

interface SharedLogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function SharedLogo({ size = "small", className }: SharedLogoProps) {
  return (
    <motion.div layoutId="fielia-logo" className={className}>
      <Logo size={size} />
    </motion.div>
  );
}
