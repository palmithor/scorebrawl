import { findLeagueBySlugWithUserRole } from "@/actions/league";
import { validateMembership } from "@/actions/permissions";
import { RedirectType, redirect } from "next/navigation";
import { InviteDialog } from "./components/InviteDialog";
import { InviteTable } from "./components/InviteTable";

export default async ({ params }: { params: { leagueSlug: string } }) => {
  const leagueWithMembership =
    (await findLeagueBySlugWithUserRole(params.leagueSlug)) ??
    redirect("/?errorCode=LEAGUE_NOT_FOUND", RedirectType.replace);
  validateMembership({ leagueWithMembership, allowedRoles: ["owner", "editor"] });
  return (
    <div className={"grid"}>
      <div className={"justify-end w-full"}>
        <InviteDialog leagueSlug={params.leagueSlug} />
      </div>
      <InviteTable leagueSlug={params.leagueSlug} />
    </div>
  );
};
