import { ReactNode } from "react";

interface InvitationCardProps {
  children: ReactNode;
}

export function InvitationCard({ children }: InvitationCardProps) {
  return (
    <div className="relative mx-auto max-w-3xl rounded-sm bg-[#F7F7F7] px-8 py-12 shadow-[0_8px_30px_rgba(55,13,16,0.12),0_2px_8px_rgba(55,13,16,0.08)] sm:px-12 md:px-16 lg:py-16">
      {/* Decorative border */}
      <div className="absolute inset-4 rounded-sm border border-[#370D10]/5" />
      {children}
    </div>
  );
}
