import { findLeagueBySlugWithUserRole } from "@/actions/league";
import { validateMembership } from "@/actions/permissions";
import { LeagueMemberTable } from "@/app/(leagues)/leagues/[leagueSlug]/members/components/MemberTable";
import { AddSeasonButton } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/components/AddSeasonButton";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { RedirectType, redirect } from "next/navigation";

export default async ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  const leagueWithMembership =
    (await findLeagueBySlugWithUserRole(leagueSlug)) ??
    redirect("/?errorCode=LEAGUE_NOT_FOUND", RedirectType.replace);
  await validateMembership({ leagueWithMembership, allowedRoles: ["owner", "editor"] });

  return (
    <>
      <BreadcrumbsHeader breadcrumbs={[{ name: "Members" }]}>
        <AddSeasonButton leagueSlug={leagueSlug} />
      </BreadcrumbsHeader>
      <LeagueMemberTable leagueSlug={leagueSlug} />
    </>
  );
};
