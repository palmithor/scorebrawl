"use client";
import { LayoutActionButton } from "@/components/layout/LayoutActionButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSeason } from "@/context/SeasonContext";
import { api } from "@/trpc/react";
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
        <LayoutActionButton
          text={"Match"}
          onClick={() => void push(`/leagues/${leagueSlug}/seasons/${seasonSlug}/matches/create`)}
          Icon={PlusIcon}
        />
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
