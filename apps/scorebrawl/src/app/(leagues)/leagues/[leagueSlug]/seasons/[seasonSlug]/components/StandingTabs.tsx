"use client";

import { OverviewCard } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/OverviewCard";
import { SeasonPlayerStanding } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/SeasonPlayerStanding";
import { SeasonTeamStanding } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/SeasonTeamStanding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const StandingTabs = () => {
  return (
    <OverviewCard title="Standings">
      <Tabs defaultValue="individual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="individual">
          <SeasonPlayerStanding />
        </TabsContent>
        <TabsContent value="team">
          <SeasonTeamStanding />
        </TabsContent>
      </Tabs>
    </OverviewCard>
  );
};
