import { getLeagueOrRedirect } from "@/actions/league";
import { getAll } from "@/actions/season";
import { TitleLayout } from "@/components/layout/title-layout";
import { SeasonForm310 } from "@/components/season/season-form-310";
import { SeasonFormElo } from "@/components/season/season-form-elo";
import { SeasonList } from "@/components/season/season-list";
import type { ScoreType } from "@scorebrawl/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@scorebrawl/ui/tabs";

export default async function ({
  params,
  searchParams,
}: { params: { leagueSlug: string }; searchParams: { scoreType: ScoreType } }) {
  const league = await getLeagueOrRedirect(params.leagueSlug);
  const seasons = await getAll(params.leagueSlug);

  const scoreType = searchParams.scoreType ?? "elo";
  return (
    <TitleLayout
      title="Create a season"
      subtitle={league ? `In league "${league.name}"` : undefined}
      backLink={`/leagues/${league.slug}`}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        <Tabs defaultValue={scoreType} className="flex-1 flex flex-col">
          <TabsList className="flex">
            <TabsTrigger className="flex-1" value="elo">
              Elo
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="3-1-0">
              3-1-0
            </TabsTrigger>
          </TabsList>
          <TabsContent value="elo">
            <div className="flex flex-col gap-2 h-svh sm:h-auto">
              <SeasonFormElo league={league} />
            </div>
          </TabsContent>
          <TabsContent value="3-1-0">
            <div className="flex flex-col gap-2 h-svh sm:h-auto">
              <SeasonForm310 league={league} />
            </div>
          </TabsContent>
        </Tabs>
        {seasons.length > 0 && <SeasonList className="flex-1" seasons={seasons} />}
      </div>
    </TitleLayout>
  );
}
