import { Button } from "@/components/ui/Button";
import { EnvelopeFlap } from "@/components/envelope/EnvelopeFlap";
import { WaxSeal } from "@/components/envelope/WaxSeal";

export default function EnvelopePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#501515] via-[#370D10] to-[#2E0506]">
      {/* Envelope creases matching sketch */}
      <EnvelopeFlap />

      {/* Wax seal at center */}
      <WaxSeal />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0A0A08]/60" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-16">
        
        {/* Top tagline */}
        <p className="font-[family-name:var(--font-cormorant)] text-sm uppercase tracking-[0.3em] text-[#E1D6C7] sm:text-base">
          An invite-only bar and supper club
        </p>

        {/* Middle spacer for seal */}
        <div />

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-6">
          <Button
            href="/invitation"
            variant="secondary"
            className="px-12 py-4 text-base sm:px-14 sm:py-4 sm:text-lg"
          >
            Open Invitation
          </Button>

          <p className="font-[family-name:var(--font-cormorant)] text-xs tracking-wider text-[#D8CBBB]/70 sm:text-sm">
            Membership by referral only
          </p>
        </div>
      </div>
    </div>
  );
}
