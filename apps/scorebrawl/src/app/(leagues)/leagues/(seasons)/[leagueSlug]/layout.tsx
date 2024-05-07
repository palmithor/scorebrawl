import { getLeagueOrRedirect } from "@/actions/league";
import type { ReactNode } from "react";

export default async function ({
  params,
  children,
}: { params: { leagueSlug: string }; children: ReactNode }) {
  // verify access rights
  await getLeagueOrRedirect(params.leagueSlug);
  return <>{children}</>;
}
