import { type GetServerSidePropsContext, type NextPage } from "next";
import { InFormCard } from "~/components/league/in-form-card";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";
import { MatchesPlayedCard } from "~/components/league/match-count-card";
import { OngoingSeasonCard } from "~/components/league/ongoing-season-card";
import { LatestMatchCard } from "~/components/match/latest-match-card";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { LatestMatchesCard } from "~/components/league/latest-matches-card";
import { setCookie } from "cookies-next";
import { getAuth } from "@clerk/nextjs/server";

export const getServerSideProps = ({ req, res, params }: GetServerSidePropsContext) => {
  const auth = getAuth(req);
  setCookie(`${auth.userId}:league`, params?.leagueSlug, { req: req, res: res });
  return { props: {} };
};

const LeagueDetails: NextPage = () => {
  const leagueSlug = useLeagueSlug();

  return (
    <LeagueDetailsLayout activeTab={"overview"}>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <InFormCard leagueSlug={leagueSlug} />
        <MatchesPlayedCard leagueSlug={leagueSlug} />
        <LatestMatchCard leagueSlug={leagueSlug} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <OngoingSeasonCard leagueSlug={leagueSlug} className="col-span-4" />
        <LatestMatchesCard leagueSlug={leagueSlug} className="col-span-4" />
      </div>
    </LeagueDetailsLayout>
  );
};

export default LeagueDetails;
