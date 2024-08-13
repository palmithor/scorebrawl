import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  const ongoingSeason = await api.season.findActive({ leagueSlug });

  if (!ongoingSeason) {
    redirect(`/leagues/${leagueSlug}/seasons/create?message=no-active`);
  } else {
    redirect(`/leagues/${leagueSlug}/seasons/${ongoingSeason.slug}`);
  }
  return null;
};
