"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  variants?: Variants;
  isLogoHidden: boolean;
  isColorChanged: boolean;
  textRadius?: number;
}

const Navbar = ({ variants, isLogoHidden, isColorChanged, textRadius = 12 }: NavbarProps) => {
  return (
    <motion.header
      className="sticky top-0 left-0 w-full z-50 border-b"
      style={{
        borderRadius: `0 0 ${textRadius}px ${textRadius}px`,
      }}
      variants={variants}
      initial={false}
      animate={{
        paddingTop: isLogoHidden ? 8 : 32, // 8px (py-2) vs 32px (py-8)
        paddingBottom: isLogoHidden ? 8 : 32,
        backgroundColor: isColorChanged ? "#E1D6C7" : "transparent",
        borderColor: isColorChanged
          ? "rgba(197, 165, 114, 0.5)"
          : "transparent",
        boxShadow: isColorChanged
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          : "none",
      }}
      transition={{
        duration: 0.5,
        ease: [0.33, 1, 0.68, 1], // Unify exact same curve for all props
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-4">

        {/* Title Block */}
        <Link
          href="/"
          className="text-center space-y-1 block hover:opacity-80 transition-opacity"
        >
          <h1
            className={`text-2xl md:text-3xl tracking-[0.2em] uppercase font-bold transition-colors duration-150 ${isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
              }`}
            style={{
              fontFamily: "var(--font-cormorant), serif",
            }}
          >
            Fielia
          </h1>
          <p
            className={`text-[10px] tracking-[0.4em] uppercase font-bold transition-colors duration-150 ${isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
              }`}
            style={{
              fontFamily: "var(--font-cormorant), serif",
            }}
          >
            Private Cocktail Bar
          </p>
        </Link>

        {/* Navigation - Centered below logo */}
        <nav>
          <ul className="flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { label: "The Bar", href: "/" },
              { label: "Community", href: "/membership" },
              { label: "Story", href: "/story" },
              { label: "Dining" },
              { label: "Experience" },
            ].map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`text-[10px] md:text-xs uppercase tracking-widest relative group font-bold transition-all duration-150 hover:scale-105 hover:text-[#C5A572] ${isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
                      }`}
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                    }}
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C5A572] transition-all duration-300 group-hover:w-full" />
                  </Link>
                ) : (
                  <button
                    className={`text-[10px] md:text-xs uppercase tracking-widest relative group font-bold transition-all duration-150 hover:scale-105 hover:text-[#C5A572] ${isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
                      }`}
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                    }}
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C5A572] transition-all duration-300 group-hover:w-full" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Thin Golden Line at the bottom */}
      <div
        className="absolute bottom-0 left-0 w-full h-px bg-[#C5A572]/40"
        style={{
          borderRadius: `0 0 ${textRadius}px ${textRadius}px`,
        }}
      />
    </motion.header>
  );
};

export default Navbar;
