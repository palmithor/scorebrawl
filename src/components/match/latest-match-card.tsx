import { CheckIcon, Undo2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MatchResult } from "~/components/match/matchResult";
import { useLeagueInvalidation } from "~/hooks/useLeagueInvalidation";
import { useIsLeaguePlayer } from "~/hooks/useIsLeaguePlayer";

export const LatestMatchCard = ({ leagueSlug }: { leagueSlug: string }) => {
  const { mutate } = api.match.undoLatest.useMutation();
  const { data } = api.match.getLatest.useQuery({ leagueSlug });
  const invalidate = useLeagueInvalidation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: ongoingSeason } = api.season.getOngoing.useQuery({ leagueSlug }, { retry: false });
  const isLeaguePlayer = useIsLeaguePlayer();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Latest match</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </CardHeader>
      <CardContent>
        {data ? (
          <>
            <div className="flex items-center gap-2">
              <MatchResult match={data} />
              {data.season.id === ongoingSeason?.id && isLeaguePlayer && (
                <>
                  {!confirmDelete ? (
                    <Button
                      variant={"ghost"}
                      className={"px-2"}
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Undo2Icon size={20} />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={"outline"}
                        className={"px-2"}
                        onClick={() => setConfirmDelete(false)}
                      >
                        <XIcon size={20} className={"text-red-500"} />
                      </Button>
                      <Button
                        variant={"outline"}
                        className={"px-2"}
                        onClick={() => {
                          setConfirmDelete(false);
                          mutate(
                            { matchId: data.id },
                            {
                              onSuccess: () => {
                                void invalidate();
                              },
                            },
                          );
                        }}
                      >
                        <CheckIcon size={20} className={"text-green-500"} />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              In season <b>{data.season.name}</b>
            </p>
          </>
        ) : (
          <div className="text-sm">No matches played</div>
        )}
      </CardContent>
    </Card>
  );
};
