import { InviteTable } from "@/app/(leagues)/leagues/[leagueSlug]/invites/components/InviteTable";
import { api } from "@/trpc/server";

export default async ({ params }: { params: { leagueSlug: string } }) => {
  const invites = await api.invite.getInvites({ leagueSlug: params.leagueSlug });
  return <InviteTable invites={invites} />;
};
