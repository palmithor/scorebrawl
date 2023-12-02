import { type NextPage } from "next";
import { api } from "~/lib/api";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { Standing } from "~/components/standing/standing";
import { type ReactNode } from "react";
import { FormDots } from "~/components/standing/form-dots";
import { PointDiffText } from "~/components/standing/PointDiffText";
import { SeasonDetailsLayout } from "~/components/season/season-details-layout";

const PointsDiff = (id: string): ReactNode | null => {
  const { data } = api.season.teamPointDiff.useQuery({ seasonTeamId: id });

  return <PointDiffText diff={data?.diff} />;
};

const Form = (id: string): ReactNode | null => {
  const { data } = api.season.teamForm.useQuery({ seasonTeamId: id });

  return data ? <FormDots form={data} /> : null;
};

const TeamStanding: NextPage = () => {
  const leagueSlug = useLeagueSlug();
  const { data: ongoingSeason } = api.season.getOngoing.useQuery({ leagueSlug }, { retry: false });
  const { data } = api.season.getTeams.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason?.id },
  );

  const items = data?.map((team) => ({
    id: team.id,
    name: team.name,
    elo: team.elo,
    matchCount: team.matchCount,
    avatars: team.players.map((player) => ({
      id: player.id,
      name: player.name,
      imageUrl: player.imageUrl,
    })),
  }));
  return (
    <SeasonDetailsLayout>
      {items && <Standing items={items} renderPointDiff={PointsDiff} renderForm={Form} />}
    </SeasonDetailsLayout>
  );
};

export default TeamStanding;
