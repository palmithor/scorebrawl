import { findLeagueBySlugWithUserRole } from "@/actions/league";
import { getAll } from "@/actions/season";
import { TitleLayout } from "@/components/layout/title-layout";
import { SeasonForm310 } from "@/components/season/season-form-310";
import { SeasonFormElo } from "@/components/season/season-form-elo";
import { SeasonTable } from "@/components/season/season-table";
import type { ScoreType } from "@scorebrawl/api";
import { Label } from "@scorebrawl/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@scorebrawl/ui/tabs";
import { RedirectType, redirect } from "next/navigation";

export default async function ({
  params,
  searchParams,
}: { params: { leagueSlug: string }; searchParams: { scoreType: ScoreType } }) {
  const league =
    (await findLeagueBySlugWithUserRole(params.leagueSlug)) ??
    redirect("/?errorCode=LEAGUE_NOT_FOUND", RedirectType.replace);
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
        {seasons.length > 0 && (
          <div className={"flex-1"}>
            <div className="pb-3">
              <Label className="text-sm font-medium">All seasons</Label>
            </div>
            <div className="rounded-md border">
              <SeasonTable seasons={seasons} />
            </div>
          </div>
        )}
      </div>
    </TitleLayout>
  );
}
