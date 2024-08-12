import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) {
  const ongoingSeason = await api.season.findOngoing({ leagueSlug });

  if (!ongoingSeason) {
    redirect(`/leagues/${leagueSlug}/seasons/create?message=no-ongoing`);
  } else {
    redirect(`/leagues/${leagueSlug}/seasons/${ongoingSeason.slug}`);
  }
  return null;
}
