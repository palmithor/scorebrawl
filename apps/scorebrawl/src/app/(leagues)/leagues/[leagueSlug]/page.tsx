import { redirect } from "next/navigation";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  redirect(`/leagues/${params.leagueSlug}/overview`);
}
