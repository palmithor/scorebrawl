import {
  findLeagueBySlugWithUserRole,
  getLeagueBySlugWithUserRoleOrRedirect,
} from "@/actions/league";

import type { ResolvingMetadata } from "next";
import type { ReactNode } from "react";

export const generateMetadata = async (
  { params: { leagueSlug } }: { params: { leagueSlug: string } },
  _parent: ResolvingMetadata,
) => {
  const league = { name: "" };
  try {
    const leagueBySlug = await findLeagueBySlugWithUserRole(leagueSlug);
    league.name = leagueBySlug?.name ?? "Unknown";
  } catch (_e) {
    // ignore
  }

  return {
    title: league.name,
  };
};

export default async ({
  params: { leagueSlug },
  children,
}: {
  params: { leagueSlug: string };
  children: ReactNode;
}) => {
  await getLeagueBySlugWithUserRoleOrRedirect(leagueSlug);
  return <>{children}</>;
};
