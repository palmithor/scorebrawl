"use client";
import { MultiAvatar } from "@/components/multi-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";
import { ChevronDown, Filter, X } from "lucide-react";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useState } from "react";

const Statuses = [
  { value: "all", label: "All" },
  { value: "completed", label: "Finished" },
  { value: "upcoming", label: "Upcoming" },
];

export const useFixtureFilters = () => {
  const [seasonPlayerIds, setSeasonPlayerIds] = useQueryState(
    "seasonPlayerId",
    parseAsArrayOf(parseAsString),
  );
  const [rounds, setRounds] = useQueryState("round", parseAsArrayOf(parseAsInteger));
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringEnum(["played", "upcoming", "all"]),
  );
  const toggleFilter = async (type: "status" | "players" | "rounds", value: string) => {
    switch (type) {
      case "status":
        await setStatus((prev) => (prev === value ? "all" : value));
        break;
      case "players":
        await setSeasonPlayerIds((prev) => {
          const index = prev?.indexOf(value);
          if (!prev || index === undefined || index === -1) {
            return [...(prev ?? []), value];
          }
          prev.splice(index, 1);
          return [...prev];
        });
        break;
      case "rounds":
        await setRounds((prev) => {
          const index = prev?.indexOf(Number(value));
          if (!prev || index === undefined || index === -1) {
            return [...(prev ?? []), Number(value)];
          }
          prev.splice(index, 1);
          return [...prev];
        });
        break;
    }
  };

  const clearFilter = async (type: "status" | "players" | "rounds") => {
    switch (type) {
      case "status":
        await setStatus("all");
        break;
      case "players":
        await setSeasonPlayerIds([]);
        break;
      case "rounds":
        await setRounds([]);
        break;
    }
  };

  const clearAllFilters = async () => {
    await setStatus("all");
    await setSeasonPlayerIds([]);
    await setRounds([]);
  };

  const activeFiltersCount =
    status && status !== "all" ? 1 : 0 + (seasonPlayerIds?.length ?? 0) + (rounds?.length ?? 0);
  return {
    rounds: rounds ?? [],
    players: seasonPlayerIds ?? [],
    status,
    toggleFilter,
    clearFilter,
    clearAllFilters,
    activeFiltersCount,
  };
};

export function MatchFixturesFilter({
  fixtureRounds,
}: { fixtureRounds: { id: string; name: string }[] }) {
  const { leagueSlug, seasonSlug } = useSeason();
  const { data: PLAYERS } = api.seasonPlayer.getAll.useQuery({
    leagueSlug,
    seasonSlug,
  });

  const {
    rounds,
    players,
    status,
    toggleFilter,
    clearFilter,
    clearAllFilters,
    activeFiltersCount,
  } = useFixtureFilters();

  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);
  // const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoundDropdownOpen, setIsRoundDropdownOpen] = useState(false);
  const filteredPlayers =
    PLAYERS?.filter((player) => players.includes(player.seasonPlayerId)) ?? [];
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Fixed filter bar for mobile */}
      <div className="sticky top-0 z-10 bg-background border-b p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">Fixtures</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-6">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        {/* Mobile view - filter button that opens sheet */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filter Matches</SheetTitle>
                <SheetDescription>Apply filters to find specific matches</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                {/* Status filter - 3 buttons with checks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="text-sm font-medium">Match Status</label>
                    {status && status !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => clearFilter("status")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={!status || status === "all" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => clearFilter("status")}
                    >
                      All
                    </Button>
                    <Button
                      variant={status === "completed" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => toggleFilter("status", "completed")}
                    >
                      Finished
                    </Button>
                    <Button
                      variant={status === "upcoming" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => toggleFilter("status", "upcoming")}
                    >
                      Upcoming
                    </Button>
                  </div>
                </div>

                {/* Player filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="text-sm font-medium">Players</label>
                    <div className="flex gap-2">
                      {players.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => clearFilter("players")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto font-normal"
                      onClick={() => setIsPlayerListOpen(!isPlayerListOpen)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {filteredPlayers.length === 0 ? (
                          <span>Select Players</span>
                        ) : filteredPlayers.length === 1 && filteredPlayers[0] ? (
                          <div className="flex gap-2" key={filteredPlayers[0].user.userId}>
                            <MultiAvatar
                              users={[
                                { id: filteredPlayers[0].user.userId, ...filteredPlayers[0].user },
                              ]}
                              visibleCount={5}
                            />
                            <div className="grid items-center">
                              <p className="font-medium truncate">{filteredPlayers[0].user.name}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="flex gap-2 items-center">
                            <MultiAvatar
                              users={filteredPlayers.map((p) => ({
                                id: p.user.userId,
                                ...p.user,
                              }))}
                              visibleCount={5}
                            />
                            {players.length} players selected
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${isPlayerListOpen ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {isPlayerListOpen && (
                      <div className="border-t">
                        <ScrollArea className="h-[200px]">
                          <div className="grid grid-cols-1 gap-1 p-1 text-sm">
                            {PLAYERS?.map((player) => (
                              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                              <div
                                key={player.seasonPlayerId}
                                className="flex items-center space-x-2 p-2"
                                onClick={() => toggleFilter("players", player.seasonPlayerId)}
                              >
                                <Checkbox
                                  id={`player-${player.seasonPlayerId}`}
                                  checked={players.includes(player.seasonPlayerId)}
                                />
                                <div className="flex gap-2" key={player.user.userId}>
                                  <MultiAvatar
                                    users={[{ id: player.user.userId, ...player.user }]}
                                    visibleCount={5}
                                  />
                                  <div className="grid items-center">
                                    <p className="font-medium truncate">{player.user.name}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>

                {/* Round filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="text-sm font-medium">Rounds</label>
                    <div className="flex gap-2">
                      {rounds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => clearFilter("rounds")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto font-normal"
                      onClick={() => setIsRoundDropdownOpen(!isRoundDropdownOpen)}
                    >
                      <div className="flex items-center gap-2">
                        {rounds.length === 0 ? (
                          <span>Select Rounds</span>
                        ) : rounds.length === 1 ? (
                          <span>Round {rounds[0]}</span>
                        ) : (
                          <span>{rounds.length} rounds selected</span>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${isRoundDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {isRoundDropdownOpen && (
                      <div className="border-t">
                        <ScrollArea className="h-[150px]">
                          <div className="grid grid-cols-1 gap-1 p-1">
                            {fixtureRounds.map((round) => (
                              <div key={round.id} className="flex items-center space-x-2 p-2">
                                <Checkbox
                                  id={`round-${round.id}`}
                                  checked={rounds.includes(Number(round.id))}
                                  onCheckedChange={() => toggleFilter("rounds", round.id)}
                                />
                                <label
                                  htmlFor={`round-${round.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {round.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <span className="mr-1">Status</span>
                {status && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {1}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Match Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Statuses.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={status === value}
                  onCheckedChange={() => toggleFilter("status", value)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
              {status && status !== "all" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center text-xs text-muted-foreground"
                    onClick={() => clearFilter("status")}
                  >
                    Clear Selection
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Players dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <span className="mr-1">Players</span>
                {players.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {players.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              <DropdownMenuLabel>Select Players</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {PLAYERS?.map((player) => (
                  <DropdownMenuCheckboxItem
                    key={player.user.userId}
                    checked={players.includes(player.seasonPlayerId)}
                    onCheckedChange={() => toggleFilter("players", player.seasonPlayerId)}
                    className="flex items-center gap-2"
                  >
                    <div className="flex gap-2" key={player.user.userId}>
                      <MultiAvatar
                        users={[{ id: player.user.userId, ...player.user }]}
                        visibleCount={5}
                      />
                      <div className="grid items-center">
                        <p className="font-medium truncate">{player.user.name}</p>
                      </div>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </ScrollArea>
              {players.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="flex justify-between p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => clearFilter("players")}
                    >
                      Clear
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rounds dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <span className="mr-1">Rounds</span>
                {rounds.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {rounds.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Select Rounds</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-4 gap-1 p-1">
                {fixtureRounds.map((round) => (
                  <Button
                    key={round.id}
                    variant={rounds.includes(Number(round.id)) ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toggleFilter("rounds", round.id)}
                  >
                    {round.name}
                  </Button>
                ))}
              </div>
              {rounds.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="flex justify-between p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => clearFilter("rounds")}
                    >
                      Clear
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearAllFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <div className="p-3 border-b">
            <div className="flex flex-wrap gap-1">
              {status && status !== "all" && (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  {status === "completed" ? "Finished" : "Upcoming"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter("status", status)}
                  />
                </Badge>
              )}

              {filteredPlayers.map((player) => {
                return (
                  <Badge
                    key={player.seasonPlayerId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {player.user.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleFilter("players", player.seasonPlayerId)}
                    />
                  </Badge>
                );
              })}

              {rounds.map((round) => (
                <Badge key={round} variant="secondary" className="flex items-center gap-1">
                  Round {round}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter("rounds", round.toString())}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
