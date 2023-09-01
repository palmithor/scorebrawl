import { CheckIcon, Undo2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MultiAvatar } from "../user/multi-avatar";

export const LatestMatchCard = ({ leagueSlug }: { leagueSlug: string }) => {
  const { mutate } = api.match.undoLatest.useMutation();
  const { data } = api.match.getLatest.useQuery({ leagueSlug });
  const { league: leagueApi, season: seasonApi, match: matchApi } = api.useContext();
  const [confirmDelete, setConfirmDelete] = useState(false);

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
              <MultiAvatar users={data.homeTeam.players} visibleCount={3} />
              <div className="whitespace-nowrap text-2xl font-bold">
                {data.homeTeam.score} - {data.awayTeam.score}
              </div>
              <MultiAvatar users={data.awayTeam.players} visibleCount={3} />
              {!confirmDelete ? (
                <Button variant={"ghost"} className={"px-2"} onClick={() => setConfirmDelete(true)}>
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
                            void seasonApi.getPlayers.invalidate({ seasonId: data.season.id });
                            void seasonApi.playerForm.invalidate({ seasonId: data.season.id });
                            void seasonApi.getOngoing.invalidate({ leagueSlug });
                            void matchApi.getLatest.invalidate({ leagueSlug });
                            void leagueApi.getBestForm.invalidate({ leagueSlug });
                            void leagueApi.getMatchesPlayedStats.invalidate({ leagueSlug });
                          },
                        }
                      );
                    }}
                  >
                    <CheckIcon size={20} className={"text-green-500"} />
                  </Button>
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
