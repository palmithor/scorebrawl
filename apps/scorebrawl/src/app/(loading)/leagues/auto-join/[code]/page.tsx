"use server";
import { auth } from "@clerk/nextjs";
import { ScoreBrawlError, joinLeague } from "@scorebrawl/db";
import type { League } from "@scorebrawl/db/types";
import { redirect } from "next/navigation";

export default async function ({ params }: { params: { code: string } }) {
  let league: League;
  try {
    league = await joinLeague({ code: params.code, userId: auth().userId as string });
  } catch (e) {
    redirect(
      `/leagues?errorCode=${e instanceof ScoreBrawlError ? e.code : "INTERNAL_SERVER_ERROR"}`,
    );
  }
  redirect(`/leagues/${league.slug}/overview`);
}
