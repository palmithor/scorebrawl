import { getLeagueBySlug } from "@/repository/league-repository";
import { auth } from "@clerk/nextjs";
import { ScoreBrawlError } from "@scorebrawl/db";
import { RedirectType, redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function LeagueLayout({
  params,
  children,
}: {
  params: { leagueSlug: string };
  children: ReactNode;
}) {
  const { userId } = auth();

  try {
    await getLeagueBySlug({ userId: userId as string, slug: params.leagueSlug });
  } catch (e) {
    redirect(
      `/leagues?errorCode=${e instanceof ScoreBrawlError ? e.code : "UNKNOWN"}`,
      RedirectType.replace,
    );
  }

  return <>${children}</>;
}
