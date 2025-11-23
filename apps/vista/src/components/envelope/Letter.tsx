import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

interface LetterProps {
  isExposed?: boolean;
}

export function Letter({ isExposed = false }: LetterProps) {
  return (
    <div className="h-full w-full">
      <motion.div
        className="h-full w-full bg-[#E1D6C7] shadow-md origin-bottom"
        layoutId="parchment-bg"
      >
        {/* Teaser content that appears when letter is exposed */}
        <motion.div
          className="h-full w-full p-6 flex flex-col items-center justify-center border border-[#370D10]/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExposed ? 1 : 0 }}
          transition={{ delay: isExposed ? 0.3 : 0, duration: 0.5 }}
        >
          <div className="opacity-50 grayscale transform scale-75">
            <Logo size="small" />
          </div>
          <div className="mt-4 text-center font-cormorant text-[#370D10]">
            <p className="text-xl font-medium tracking-wide">You are invited</p>
            <p className="text-xs mt-2 opacity-60 uppercase tracking-widest">
              Private Access
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
