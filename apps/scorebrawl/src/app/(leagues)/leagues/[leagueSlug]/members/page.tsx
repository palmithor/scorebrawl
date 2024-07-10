import { findLeagueBySlugWithUserRole } from "@/actions/league";
import { validateMembership } from "@/actions/permissions";
import { LeagueMemberTable } from "@/app/(leagues)/leagues/[leagueSlug]/members/components/MemberTable";
import { api } from "@/trpc/server";
import { RedirectType, redirect } from "next/navigation";

export default async ({ params }: { params: { leagueSlug: string } }) => {
  const leagueWithMembership =
    (await findLeagueBySlugWithUserRole(params.leagueSlug)) ??
    redirect("/?errorCode=LEAGUE_NOT_FOUND", RedirectType.replace);
  await validateMembership({ leagueWithMembership, allowedRoles: ["owner", "editor"] });

  const members = await api.member.getAll({ leagueSlug: params.leagueSlug });
  return <LeagueMemberTable members={members} />;
};
