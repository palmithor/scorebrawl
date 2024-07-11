"use client";
import { StatsCard } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/StatsCard";
import { MatchResult } from "@/components/match/match-result";
import { api } from "@/trpc/react";
import type { Match } from "@scorebrawl/db/types";
import { Button } from "@scorebrawl/ui/button";
import { Skeleton } from "@scorebrawl/ui/skeleton";
import { useToast } from "@scorebrawl/ui/use-toast";
import { CalendarCheck2, CheckIcon, Undo2Icon, XIcon } from "lucide-react";
import { useState } from "react";

export const LatestMatchCard = ({
  leagueSlug,
  seasonSlug,
}: { leagueSlug: string; seasonSlug: string }) => {
  const { data, isLoading } = api.match.getLatest.useQuery({ seasonSlug, leagueSlug });

  return (
    <StatsCard Icon={CalendarCheck2} title={"Latest Match"}>
      {isLoading && <Skeleton className={"gap-2 h-14 w-full"} />}
      {data && (
        <LatestMatchCardContent match={data} leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
      )}
      {!data && !isLoading && <div className={"gap-2 text-sm"}>No matches</div>}
    </StatsCard>
  );
};

const LatestMatchCardContent = ({
  leagueSlug,
  seasonSlug,
  match,
}: {
  leagueSlug: string;
  seasonSlug: string;
  match: Match;
}) => {
  const { mutate } = api.match.remove.useMutation();
  const utils = api.useUtils();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();

  const onClickConfirmDelete = async () => {
    mutate(
      { seasonSlug, leagueSlug, matchId: match.id },
      {
        onSuccess: () => {
          // todo invalidate season standing and more
          utils.match.getLatest.invalidate();
          utils.player.getTopPlayer.invalidate();
          toast({
            title: "Match reverted",
            description: "Latest match has now been deleted",
          });
        },
        onError: (err) => {
          toast({
            title: "Error creating league",
            description: err instanceof Error ? err.message : "Unknown error",
            variant: "destructive",
          });
        },
      },
    );
    /*try {
      await deleteMatch({ matchId: match.id });
      refresh();
      setConfirmDelete(false);
    } catch (err) {
      toast({
        title: "Error creating league",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }*/
  };
  return (
    <div className="flex items-center gap-2">
      <MatchResult match={match} />

      <>
        {!confirmDelete ? (
          <Button variant={"ghost"} className={"px-2"} onClick={() => setConfirmDelete(true)}>
            <Undo2Icon size={20} />
          </Button>
        ) : (
          <>
            <Button variant={"outline"} className={"px-2"} onClick={() => setConfirmDelete(false)}>
              <XIcon size={20} className={"text-red-500"} />
            </Button>
            <Button variant={"outline"} className={"px-2"} onClick={onClickConfirmDelete}>
              <CheckIcon size={20} className={"text-green-500"} />
            </Button>
          </>
        )}
      </>
    </div>
  );
};
