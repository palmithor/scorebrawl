import { findLeagueBySlugWithUserRole } from "@/actions/league";
import { RedirectType, redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ({
  params,
  children,
}: { params: { leagueSlug: string }; children: ReactNode }) {
  // verify access rights
  (await findLeagueBySlugWithUserRole(params.leagueSlug)) ??
    redirect("/?errorCode=LEAGUE_NOT_FOUND", RedirectType.replace);
  return <>{children}</>;
}
