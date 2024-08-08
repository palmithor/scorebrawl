import { findLeagueBySlugWithUserRole } from "@/actions/league";
import type { Metadata, ResolvingMetadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata(
  { params: { leagueSlug } }: { params: { leagueSlug: string } },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const league = { name: "" };
  try {
    const leagueBySlug = await findLeagueBySlugWithUserRole(leagueSlug);
    league.name = leagueBySlug?.name ?? "Unknown";
  } catch (_e) {
    // ignore
  }

  return {
    title: `${league.name} | Seasons`,
  };
}

export default function Layout({
  children,
}: { children: ReactNode; params: { leagueSlug: string; seasonSlug: string } }) {
  return children;
}
