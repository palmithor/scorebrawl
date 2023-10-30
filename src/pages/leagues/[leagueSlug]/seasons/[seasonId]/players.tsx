import { type NextPage } from "next";
import { SeasonDetailsLayout } from "~/components/season/season-details-layout";
import { api } from "~/lib/api";
import { useRouter } from "next/router";
import { Standing } from "~/components/standing/standing";
import { PointsDiff } from "~/components/player/points-diff";
import { Form } from "~/components/player/form";

const SeasonPlayers: NextPage = () => {
  const seasonId = useRouter().query.seasonId as string;
  const { data: players } = api.season.getPlayers.useQuery({ seasonId: seasonId });

  const items =
    players?.map((p) => ({
      id: p.id,
      name: p.name,
      elo: p.elo,
      matchCount: p.matchCount,
      avatars: [{ id: p.userId, name: p.name, imageUrl: p.imageUrl }],
    })) || [];

  return (
    <SeasonDetailsLayout>
      <Standing items={items} renderPointDiff={PointsDiff} renderForm={Form} />
    </SeasonDetailsLayout>
  );
};

export default SeasonPlayers;
