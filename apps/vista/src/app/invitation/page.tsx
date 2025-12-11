import { ParchmentBackground } from "@/components/invitation/ParchmentBackground";
import { InvitationCard } from "@/components/invitation/InvitationCard";
import { InvitationContent } from "@/components/invitation/InvitationContent";

export default function InvitationPage() {
  return (
    <ParchmentBackground>
      <InvitationCard>
        <InvitationContent />
      </InvitationCard>
    </ParchmentBackground>
  );
}
