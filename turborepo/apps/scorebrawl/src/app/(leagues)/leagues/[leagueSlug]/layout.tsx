import { getBySlug } from "@/actions/league";
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
  try {
    await getBySlug({ slug: params.leagueSlug });
  } catch (e) {
    redirect(
      `/leagues?errorCode=${e instanceof ScoreBrawlError ? e.code : "UNKNOWN"}`,
      RedirectType.replace,
    );
  }

  return <div className="py-2">{children}</div>;
}
