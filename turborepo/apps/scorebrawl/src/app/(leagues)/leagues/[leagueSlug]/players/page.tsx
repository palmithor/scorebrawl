import { getBySlug } from "@/actions/league";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const { slug } = await getBySlug({ slug: params.leagueSlug });

  return <h1>players</h1>;
}
