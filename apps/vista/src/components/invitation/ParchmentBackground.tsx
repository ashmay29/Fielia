import { ReactNode } from "react";

interface ParchmentBackgroundProps {
  children: ReactNode;
}

export function ParchmentBackground({ children }: ParchmentBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#E1D6C7] via-[#D8CBBB] to-[#E1D6C7] px-4 py-12 sm:px-6 md:px-8 lg:py-16">
      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(55,13,16,0.1) 2px, rgba(55,13,16,0.1) 4px)`,
          backgroundSize: "100% 4px",
        }}
      />

      {/* Decorative corner flourishes */}
      <div className="absolute left-8 top-8 h-16 w-16 border-l-2 border-t-2 border-[#370D10]/10 sm:h-24 sm:w-24" />
      <div className="absolute bottom-8 right-8 h-16 w-16 border-b-2 border-r-2 border-[#370D10]/10 sm:h-24 sm:w-24" />

      {children}
    </div>
  );
}
