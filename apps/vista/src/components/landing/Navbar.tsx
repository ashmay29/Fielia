// No changes to imports here, just showing context
// No changes to imports here, just showing context
import { motion, AnimatePresence, Variants } from "framer-motion";

interface NavbarProps {
  variants?: Variants;
  isLogoHidden: boolean;
  isColorChanged: boolean;
}

const Navbar = ({ variants, isLogoHidden, isColorChanged }: NavbarProps) => {
  return (
    <motion.header
      className="sticky top-0 left-0 w-full z-50 border-b"
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
        {/* Logo / Crest - Collapses on scroll */}
        {/* Logo / Crest - Collapses on scroll */}
        <motion.div
          initial={false}
          animate={{
            height: isLogoHidden ? 0 : 96, // Explicit 96px (h-24) to 0
            opacity: isLogoHidden ? 0 : 1,
            marginBottom: isLogoHidden ? 0 : 16,
            scale: isLogoHidden ? 0.8 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }} // MATCH EXACTLY
          className="overflow-hidden flex justify-center"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full border border-wine-rich/10 bg-white/10 backdrop-blur-sm shadow-inner">
            <span
              className={`text-3xl md:text-4xl font-bold transition-colors duration-300 ${
                isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
              }`}
              style={{
                fontFamily: "var(--font-great-vibes), cursive",
              }}
            >
              F
            </span>
            <svg
              className="absolute inset-0 w-full h-full rotate-30 opacity-30"
              viewBox="0 0 100 100"
            >
              <path
                id="curve"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="transparent"
              />
              <text width="500">
                <textPath
                  xlinkHref="#curve"
                  className="text-[10px] uppercase tracking-[0.3em] font-medium"
                  fill="hsl(350 50% 20%)" // Dark wine for the ring text
                  startOffset="50%"
                  textAnchor="middle"
                >
                  Est. 1923
                </textPath>
              </text>
            </svg>
          </div>
        </motion.div>

        {/* Title Block */}
        <div className="text-center space-y-1">
          <h1
            className={`text-2xl md:text-3xl tracking-[0.2em] uppercase font-bold transition-colors duration-150 ${
              isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
            }`}
            style={{
              fontFamily: "var(--font-cormorant), serif",
            }}
          >
            Fielia
          </h1>
          <p
            className={`text-[10px] tracking-[0.4em] uppercase font-bold transition-colors duration-150 ${
              isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
            }`}
            style={{
              fontFamily: "var(--font-cormorant), serif",
            }}
          >
            Private Dining
          </p>
        </div>

        {/* Navigation - Centered below logo */}
        <nav>
          <ul className="flex flex-wrap justify-center gap-6 md:gap-12">
            {["The Club", "Membership", "Story", "Dining", "Experience"].map(
              (item) => (
                <li key={item}>
                  <button
                    className={`text-[10px] md:text-xs uppercase tracking-widest relative group font-bold transition-all duration-150 hover:scale-105 hover:text-[#C5A572] ${
                      isColorChanged ? "text-[#370D10]" : "text-[#E1D6C7]"
                    }`}
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                    }}
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C5A572] transition-all duration-300 group-hover:w-full" />
                  </button>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>

      {/* Thin Golden Line at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A572]/40" />
    </motion.header>
  );
};

export default Navbar;
