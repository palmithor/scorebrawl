"use client";
import { api } from "@/trpc/react";
import { Button } from "@scorebrawl/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@scorebrawl/ui/tooltip";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const AddSeasonButton = ({ leagueSlug }: { leagueSlug: string }) => {
  const { push } = useRouter();
  const { data: hasEditAccess } = api.league.hasEditorAccess.useQuery({ leagueSlug });
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          size="sm"
          variant="outline"
          disabled={!hasEditAccess}
          className="h-8 gap-1"
          onClick={() => void push(`/leagues/${leagueSlug}/seasons/create`)}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Season</span>
        </Button>
      </TooltipTrigger>
      {!hasEditAccess && (
        <TooltipContent side="bottom">
          <p className="w-52">You do now have permission to add a season</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
