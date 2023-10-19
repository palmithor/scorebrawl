/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/router";
import { api } from "~/lib/api";
import { Standing } from "~/components/standing/standing";
import { PointsDiff } from "~/components/player/points-diff";
import { Form } from "~/components/player/form";

export const OngoingSeasonSection = ({
  className,
  leagueSlug,
}: {
  className?: string;
  leagueSlug: string;
}) => {
  const router = useRouter();
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery(
    { leagueSlug },
    { retry: false },
  );
  const { data: ongoingSeason, isLoading: isLoadingOngoingSeason } = api.season.getOngoing.useQuery(
    { leagueSlug },
    { retry: false },
  );
  const { data: players } = api.season.getPlayers.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason?.id },
  );
  const { data: league } = api.league.getBySlug.useQuery({ leagueSlug });

  const items =
    players?.map((p) => ({
      id: p.id,
      name: p.name,
      elo: p.elo,
      avatars: [{ id: p.userId, name: p.name, imageUrl: p.imageUrl }],
    })) || [];

  const cardContent = () => {
    if (isLoadingOngoingSeason) {
      return <Spinner />;
    } else if (ongoingSeason) {
      return <Standing items={items} renderPointDiff={PointsDiff} renderForm={Form} />;
    } else if (hasEditorAccess) {
      return (
        <Button
          onClick={() => void router.push(`/leagues/${league?.slug as string}/seasons/create`)}
        >
          Create season
        </Button>
      );
    } else {
      return <div className="text">Editors must create a season</div>;
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col py-4">
        <div className="grow">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Standing</h3>
          <p className="pt-1 text-xs text-muted-foreground">
            In season <span className="font-bold">{ongoingSeason?.name}</span>{" "}
            {ongoingSeason?.endDate &&
              ` ending at ${ongoingSeason.endDate.toLocaleDateString(window.navigator.language)}`}
          </p>
        </div>
        {!ongoingSeason && !isLoadingOngoingSeason && <div>No ongoing season</div>}
      </div>
      <div className="grid grow">{cardContent()}</div>
    </div>
  );
};
