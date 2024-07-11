"use client";
import { deleteMatch } from "@/actions/match";
import { MatchResult } from "@/components/match/match-result";
import type { Match } from "@scorebrawl/db/types";
import { Button } from "@scorebrawl/ui/button";
import { useToast } from "@scorebrawl/ui/use-toast";
import { CheckIcon, Undo2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const LatestMatchCardContent = ({
  match,
}: {
  match: Match;
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  const { refresh } = useRouter();

  const onClickConfirmDelete = async () => {
    try {
      await deleteMatch({ matchId: match.id });
      refresh();
      toast({
        title: "Match reverted",
        description: "Latest match has now been deleted",
      });
      setConfirmDelete(false);
    } catch (err) {
      toast({
        title: "Error creating league",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
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
