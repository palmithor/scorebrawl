"use client";
import { useSeason } from "@/context/SeasonContext";
import { api } from "@/trpc/react";
import { Button } from "@scorebrawl/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@scorebrawl/ui/tooltip";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const AddMatchButton = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  const { push } = useRouter();
  const { data: season } = api.season.getBySlug.useQuery({ leagueSlug, seasonSlug });
  const { data: ongoingSeasonPlayers } = api.seasonPlayer.getAll.useQuery({
    leagueSlug,
    seasonSlug,
  });
  const hasTwoPlayersOrMore = ongoingSeasonPlayers && ongoingSeasonPlayers.length > 1;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          size="sm"
          className="h-8 gap-1"
          variant="outline"
          onClick={() => void push(`/leagues/${leagueSlug}/seasons/${seasonSlug}/matches/create`)}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Match</span>
        </Button>
      </TooltipTrigger>
      {!(hasTwoPlayersOrMore && season) && (
        <TooltipContent side="bottom">
          <p className="w-52">
            An ongoing season or at least two players required for adding match
          </p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
