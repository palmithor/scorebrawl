import { type GetServerSidePropsContext, type NextPage } from "next";
import { InFormCard } from "~/components/league/in-form-card";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";
import { MatchesPlayedCard } from "~/components/league/matches-played-card";
import { OngoingSeasonSection } from "~/components/league/ongoing-season-section";
import { LatestMatchCard } from "~/components/match/latest-match-card";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { LatestMatchesSection } from "~/components/league/latest-matches-section";
import { setCookie } from "cookies-next";

export const latestOpenLeagueCookie = "latestOpenLeagueCookie";

export const getServerSideProps = ({ req, res, params }: GetServerSidePropsContext) => {
  setCookie("latestOpenLeagueCookie", params?.leagueSlug, { req: req, res: res });
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
        <OngoingSeasonSection leagueSlug={leagueSlug} className="col-span-4" />
        <LatestMatchesSection leagueSlug={leagueSlug} className="col-span-4" />
      </div>
    </LeagueDetailsLayout>
  );
};

export default LeagueDetails;
