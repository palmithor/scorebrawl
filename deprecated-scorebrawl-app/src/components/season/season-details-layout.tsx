import Head from "next/head";
import { useRouter } from "next/router";
import * as React from "react";
import { SeasonNav } from "~/components/season/season-nav";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";

export const SeasonDetailsLayout = ({
  children,
}: {
  children: React.ReactNode;
  hideJoinButton?: boolean;
}) => {
  const leagueSlug = useLeagueSlug();
  const router = useRouter();
  const seasonId = router.query.seasonId as string;
  const { data: season } = api.season.getById.useQuery({
    leagueSlug,
    seasonId,
  });

  return (
    <div>
      <Head>
        <title>Scorebrawl - {season?.name}</title>
      </Head>
      <SeasonNav className="pb-8 pt-6" />

      <div>{children}</div>
    </div>
  );
};
