import { ReactNode } from "react";

interface ParchmentBackgroundProps {
  children: ReactNode;
}

export function ParchmentBackground({ children }: ParchmentBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 py-12 sm:px-6 md:px-8 lg:py-16" style={{
      background: `linear-gradient(135deg, var(--fielia-6) 0%, var(--fielia-7) 50%, var(--fielia-6) 100%)`,
    }}>
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 300 300%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22ptex2%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.009%22 numOctaves=%225%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23ffffff%22 filter=%22url(%23ptex2)%22 opacity=%220.8%22/%3E%3C/svg%3E")',
        }}
      />

      {/* Decorative corner flourishes */}
      <div className="absolute left-8 top-8 h-16 w-16 border-l-2 border-t-2 border-[#370D10]/10 sm:h-24 sm:w-24" />
      <div className="absolute bottom-8 right-8 h-16 w-16 border-b-2 border-r-2 border-[#370D10]/10 sm:h-24 sm:w-24" />

      {children}
    </div>
  );
}
