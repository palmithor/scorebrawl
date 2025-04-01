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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";
import { ChevronDown, Filter, X } from "lucide-react";
import { useState } from "react";

export function MatchFixturesFilter() {
  const { leagueSlug, seasonSlug } = useSeason();
  // Updated state to support multi-select
  const [filters, setFilters] = useState({
    status: [] as string[],
    players: [] as string[],
    rounds: [] as string[],
  });
  const { data: PLAYERS } = api.seasonPlayer.getAll.useQuery({
    leagueSlug,
    seasonSlug,
  });

  const STATUSES: { value: string; label: string }[] = [{}];
  const ROUNDS: string[] = [];

  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoundDropdownOpen, setIsRoundDropdownOpen] = useState(false);

  // Count total active filters
  const activeFiltersCount = filters.status.length + filters.players.length + filters.rounds.length;

  // Toggle a filter value
  const toggleFilter = (type: "status" | "players" | "rounds", value: string) => {
    setFilters((prev) => {
      const currentValues = [...prev[type]];
      const valueIndex = currentValues.indexOf(value);

      if (valueIndex === -1) {
        // Add value if not present
        return { ...prev, [type]: [...currentValues, value] };
      }
      // Remove value if already present
      currentValues.splice(valueIndex, 1);
      return { ...prev, [type]: currentValues };
    });
  };

  // Select all values for a filter type
  const selectAllFilter = (type: "status" | "players" | "rounds") => {
    let allValues: string[] = [];

    if (type === "status") {
      allValues = STATUSES.map((s) => s.value);
    } else if (type === "players") {
      allValues = PLAYERS?.map((p) => p.user.userId) || [];
    } else if (type === "rounds") {
      allValues = ROUNDS.map((r) => r.toString());
    }

    setFilters((prev) => ({ ...prev, [type]: allValues }));
  };

  // Clear all values for a filter type
  const clearFilter = (type: "status" | "players" | "rounds") => {
    setFilters((prev) => ({ ...prev, [type]: [] }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      status: [],
      players: [],
      rounds: [],
    });
  };

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
                {/* Status filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="text-sm font-medium">Match Status</label>
                    {filters.status.length > 0 && (
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
                  <div className="space-y-2">
                    {STATUSES.map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={filters.status.includes(status.value)}
                          onCheckedChange={() => toggleFilter("status", status.value)}
                        />
                        <label
                          htmlFor={`status-${status.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="text-sm font-medium">Players</label>
                    <div className="flex gap-2">
                      {filters.players.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => clearFilter("players")}
                        >
                          Clear
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => selectAllFilter("players")}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto font-normal"
                      onClick={() => setIsPlayerListOpen(!isPlayerListOpen)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {filters.players.length === 0 ? (
                          <span>Select Players</span>
                        ) : filters.players.length === 1 ? (
                          <span>TODO Render player</span>
                        ) : (
                          <span>{filters.players.length} players selected</span>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${isPlayerListOpen ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {isPlayerListOpen && (
                      <div className="border-t">
                        <ScrollArea className="h-[200px]">
                          <div className="grid grid-cols-1 gap-1 p-1">
                            {PLAYERS?.map((player) => (
                              <div className="flex gap-2" key={player.user.userId}>
                                <MultiAvatar
                                  users={[{ id: player.user.userId, ...player.user }]}
                                  visibleCount={5}
                                />
                                <div className="grid items-center">
                                  <p className="font-medium truncate">{player.user.name}</p>
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
                      {filters.rounds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => clearFilter("rounds")}
                        >
                          Clear
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => selectAllFilter("rounds")}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                  <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-2">
                      <TabsTrigger value="select">Dropdown</TabsTrigger>
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                    </TabsList>
                    <TabsContent value="select">
                      <div className="border rounded-md overflow-hidden">
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto font-normal"
                          onClick={() => setIsRoundDropdownOpen(!isRoundDropdownOpen)}
                        >
                          <div className="flex items-center gap-2">
                            {filters.rounds.length === 0 ? (
                              <span>Select Rounds</span>
                            ) : filters.rounds.length === 1 ? (
                              <span>Round {filters.rounds[0]}</span>
                            ) : (
                              <span>{filters.rounds.length} rounds selected</span>
                            )}
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${isRoundDropdownOpen ? "rotate-180" : ""}`}
                          />
                        </Button>

                        {isRoundDropdownOpen && (
                          <div className="border-t">
                            <ScrollArea className="h-[200px]">
                              <div className="grid grid-cols-1 gap-1 p-1">
                                {ROUNDS.map((round) => (
                                  <div key={round} className="flex items-center space-x-2 p-2">
                                    <Checkbox
                                      id={`round-${round}`}
                                      checked={filters.rounds.includes(round.toString())}
                                      onCheckedChange={() =>
                                        toggleFilter("rounds", round.toString())
                                      }
                                    />
                                    <label
                                      htmlFor={`round-${round}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      Round {round}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="grid">
                      <div className="grid grid-cols-4 gap-1">
                        {ROUNDS.map((round) => (
                          <Button
                            key={round}
                            variant={
                              filters.rounds.includes(round.toString()) ? "default" : "outline"
                            }
                            className="w-full"
                            onClick={() => toggleFilter("rounds", round.toString())}
                          >
                            {round}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop view - inline filters */}
        <div className="hidden md:flex items-center gap-2">
          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <span className="mr-1">Status</span>
                {filters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Match Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={filters.status.includes(status.value)}
                  onCheckedChange={() => toggleFilter("status", status.value)}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}
              {filters.status.length > 0 && (
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
                {filters.players.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {filters.players.length}
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
                    checked={filters.players.includes(player.user.userId)}
                    onCheckedChange={() => toggleFilter("players", player.user.userId)}
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
              {filters.players.length > 0 && (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => selectAllFilter("players")}
                    >
                      Select All
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
                {filters.rounds.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {filters.rounds.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Select Rounds</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-4 gap-1 p-1">
                {ROUNDS.map((round) => (
                  <Button
                    key={round}
                    variant={filters.rounds.includes(round.toString()) ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toggleFilter("rounds", round.toString())}
                  >
                    {round}
                  </Button>
                ))}
              </div>
              {filters.rounds.length > 0 && (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => selectAllFilter("rounds")}
                    >
                      Select All
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
      </div>

      {/* 
      {activeFiltersCount > 0 && (
        <div className="p-3 border-b">
          <div className="flex flex-wrap gap-1">
            {filters.status.map((status) => (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {status === "completed" ? "Result only" : "Not yet"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleFilter("status", status)}
                />
              </Badge>
            ))}

            {filters.players.map((playerId) => {
              const player = PLAYERS.find((p) => p.id === playerId);
              return (
                <Badge key={playerId} variant="secondary" className="flex items-center gap-1">
                  {player?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter("players", playerId)}
                  />
                </Badge>
              );
            })}

            {filters.rounds.map((round) => (
              <Badge key={round} variant="secondary" className="flex items-center gap-1">
                Round {round}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleFilter("rounds", round)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
