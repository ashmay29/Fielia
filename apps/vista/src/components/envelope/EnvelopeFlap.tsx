import { motion } from "framer-motion";

interface EnvelopeFlapProps {
  isOpen?: boolean;
}

export function EnvelopeFlap({ isOpen = false }: EnvelopeFlapProps) {
  return (
    <>
      {/* --- TOP FLAP (Animated) --- */}
      <motion.div
        className="absolute inset-0 origin-top z-30"
        initial={{ rotateX: 0 }}
        animate={{
          rotateX: isOpen ? -180 : 0,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", transformOrigin: "top" }}
      >
        {/* Front of the flap (Closed state) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient
                id="flap-front-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(46,5,6,0.85)" />
                <stop offset="60%" stopColor="rgba(64,19,18,0.6)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M 0 0 L 100 0 L 50 55 Q 50 48 0 0 Z"
              fill="url(#flap-front-gradient)"
              stroke="#E1D6C7"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Back of the flap (Open state) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient
                id="flap-back-gradient"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(46,5,6,0.85)" />
                <stop offset="60%" stopColor="rgba(64,19,18,0.6)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M 0 0 L 100 0 L 50 55 Q 50 48 0 0 Z"
              fill="url(#flap-back-gradient)"
              stroke="#E1D6C7"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </motion.div>
    </>
  );
}
