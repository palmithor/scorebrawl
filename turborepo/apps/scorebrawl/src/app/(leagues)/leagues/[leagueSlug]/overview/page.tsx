import { getBySlug } from "@/actions/league";
import { SubNav } from "@/components/layout/sub-nav";
import { leagueSubNav } from "@/components/layout/utils";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const { slug } = await getBySlug({ slug: params.leagueSlug });

  return (
    <SubNav links={leagueSubNav(slug)}>
      <h1>overview</h1>
    </SubNav>
  );
}
