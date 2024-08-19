import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  const ongoingSeason = await api.season.findActive({ leagueSlug });
  const hasEditorAccess = await api.league.hasEditorAccess({ leagueSlug });

  if (!ongoingSeason && hasEditorAccess) {
    redirect(`/leagues/${leagueSlug}/seasons/create?message=no-active`);
  } else if (ongoingSeason) {
    redirect(`/leagues/${leagueSlug}/seasons/${ongoingSeason.slug}`);
  } else {
    redirect(`/leagues/${leagueSlug}/seasons`);
  }
  return null;
};
