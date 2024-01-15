import { getBySlug } from "@/actions/league";
import { RedirectType, redirect } from "next/navigation";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const { slug } = await getBySlug({ slug: params.leagueSlug });

  redirect(`/leagues/${slug}/overview`, RedirectType.replace);
}
