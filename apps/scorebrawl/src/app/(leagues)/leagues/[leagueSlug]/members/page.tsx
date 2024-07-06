import { LeagueMemberTable } from "@/app/(leagues)/leagues/[leagueSlug]/members/components/MemberTable";
import { api } from "@/trpc/server";

export default async ({ params }: { params: { leagueSlug: string } }) => {
  const members = await api.member.getMembers({ leagueSlug: params.leagueSlug });
  return <LeagueMemberTable members={members} />;
};
