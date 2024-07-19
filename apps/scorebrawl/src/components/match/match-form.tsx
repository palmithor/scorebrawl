"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SeasonPlayer } from "@scorebrawl/db/types";
import type { badgeVariants } from "@scorebrawl/ui/badge";
import { Button } from "@scorebrawl/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@scorebrawl/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@scorebrawl/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@scorebrawl/ui/form";
import { cn } from "@scorebrawl/ui/lib";
import { CircleEqual, Shuffle } from "lucide-react";
import { useForm } from "react-hook-form";

import { create } from "@/actions/match";
import { events } from "@/analytics/counters";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { trackEvent } from "@openpanel/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@scorebrawl/ui/avatar";
import { LoadingButton } from "@scorebrawl/ui/loading-button";
import { Separator } from "@scorebrawl/ui/separator";
import { useToast } from "@scorebrawl/ui/use-toast";
import { capitalize, getInitialsFromString } from "@scorebrawl/utils/string";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { TitleLayout } from "../layout/title-layout";
import { AvatarBadge } from "../user/avatar-badge";

const seasonPlayerSchema = z.object({
  id: z.string(),
  leaguePlayerId: z.string(),
  userId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  score: z.number(),
  joinedAt: z.date(),
  disabled: z.boolean(),
  matchCount: z.number(),
});
const schema = z.object({
  awayPlayers: seasonPlayerSchema.array().min(1),
  homePlayers: seasonPlayerSchema.array().min(1),
  homeScore: z.coerce.number().min(0),
  awayScore: z.coerce.number().min(0),
});

type FormValues = z.output<typeof schema>;

type SeasonPlayerType = z.infer<typeof seasonPlayerSchema>;
export const MatchForm = ({
  season,
  leagueSlug,
  seasonPlayers,
}: {
  leagueSlug: string;
  season: { id: string; leagueId: string; name: string };
  seasonPlayers: SeasonPlayer[];
}) => {
  const { toast } = useToast();
  const { refresh } = useRouter();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      homeScore: 0,
      homePlayers: [],
      awayScore: 0,
      awayPlayers: [],
    },
  });

  const enableReorder = () => {
    return (
      form.getValues().homePlayers.length > 1 &&
      (form.getValues().homePlayers.length + form.getValues().awayPlayers.length) % 2 === 0
    );
  };

  const shuffleTeams = () => {
    trackEvent(events.createMatch.evenTeams, {
      leagueSlug,
      homeTeamPlayerCount: form.getValues().homePlayers.length,
      awayTeamPlayerCount: form.getValues().awayPlayers.length,
    });
    const homePlayers = form.getValues().homePlayers;
    const awayPlayers = form.getValues().awayPlayers;
    const allPlayers = [...homePlayers, ...awayPlayers];

    for (let i = allPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // @ts-ignore
      [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
    }
    form.setValue("homePlayers", allPlayers.slice(0, allPlayers.length / 2));
    form.setValue("awayPlayers", allPlayers.slice(allPlayers.length / 2, allPlayers.length));
  };

  const evenTeams = () => {
    trackEvent(events.createMatch.evenTeams, {
      leagueSlug,
      homeTeamPlayerCount: form.getValues().homePlayers.length,
      awayTeamPlayerCount: form.getValues().awayPlayers.length,
    });
    const homePlayers = form.getValues().homePlayers;
    const awayPlayers = form.getValues().awayPlayers;
    const allPlayers = [...homePlayers, ...awayPlayers].sort((u1, u2) =>
      u1.score < u2.score ? 1 : -1,
    );
    const n = allPlayers.length;
    let minDiff = Number.POSITIVE_INFINITY;
    let bestTeams: [SeasonPlayerType[], SeasonPlayerType[]] = [[], []];

    // Helper function to calculate the absolute difference between two numbers
    const absDiff = (a: number, b: number) => Math.abs(a - b);

    // Backtracking function to explore all possible team combinations
    function backtrack(
      index: number,
      team1: SeasonPlayerType[],
      team2: SeasonPlayerType[],
      total1: number,
      total2: number,
    ) {
      if (index === n) {
        // Calculate the difference in total scores between the two teams
        const diff = absDiff(total1, total2);
        if (diff < minDiff) {
          minDiff = diff;
          bestTeams = [team1.slice(), team2.slice()];
        }
        return;
      }

      // Try adding the current player to team 1
      backtrack(
        index + 1,
        [...team1, allPlayers[index] as SeasonPlayerType],
        team2,
        total1 + (allPlayers[index] as SeasonPlayerType).score,
        total2,
      );

      // Try adding the current player to team 2
      backtrack(
        index + 1,
        team1,
        [...team2, allPlayers[index] as SeasonPlayerType],
        total1,
        total2 + (allPlayers[index] as SeasonPlayerType).score,
      );
    }

    // Start backtracking from the first player
    backtrack(0, [], [], 0, 0);

    form.setValue("homePlayers", bestTeams[0]);
    form.setValue("awayPlayers", bestTeams[1]);
  };
  const onSubmit = async ({ homeScore, homePlayers, awayPlayers, awayScore }: FormValues) => {
    setIsLoading(true);
    try {
      await create({
        leagueId: season.leagueId,
        seasonId: season.id,
        homeScore,
        awayScore,
        homePlayerIds: homePlayers.map((p) => p.id) as [string, ...string[]],
        awayPlayerIds: awayPlayers.map((p) => p.id) as [string, ...string[]],
      });
      toast({
        title: "Match created",
        description: "Match has been created successfully",
      });
      form.reset();
      refresh();
      setSelectedPlayerIds([]);
    } catch (err) {
      toast({
        title: "Error creating match",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const remainingPlayers = seasonPlayers.filter((player) => !selectedPlayerIds.includes(player.id));

  return (
    <div>
      <TitleLayout
        title="Create Match"
        subtitle={`In season "${season.name}"`}
        backLink={`/leagues/${leagueSlug}`}
      >
        <Form {...form}>
          <form noValidate className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <Drawer>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <FormField
                  control={form.control}
                  name="homeScore"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-center">
                      <FormControl>
                        <ScoreStepper
                          team={"home"}
                          score={field.value}
                          min={0}
                          onClickMinus={() => {
                            field.onChange(field.value - 1);
                          }}
                          onClickPlus={() => {
                            field.onChange(field.value + 1);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="awayScore"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-center">
                      <FormControl>
                        <ScoreStepper
                          team={"away"}
                          score={field.value}
                          min={0}
                          onClickMinus={() => {
                            field.onChange(field.value - 1);
                          }}
                          onClickPlus={() => {
                            field.onChange(field.value + 1);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homePlayers"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <PlayerListCard
                          team="home"
                          teamPlayers={field.value}
                          selectedTeam={selectedTeam}
                          remainingPlayers={remainingPlayers}
                          onClickAddPlayers={setSelectedTeam}
                          onSelect={(player) => {
                            field.onChange([...field.value, player]);
                            setSelectedPlayerIds((prev) => [...prev, player.id]);
                          }}
                          onDeselect={(player) => {
                            field.onChange(field.value.filter((p) => p.id !== player.id));
                            setSelectedPlayerIds((prev) => prev.filter((pId) => pId !== player.id));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="awayPlayers"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <PlayerListCard
                          team="away"
                          selectedTeam={selectedTeam}
                          teamPlayers={field.value}
                          remainingPlayers={remainingPlayers}
                          onClickAddPlayers={setSelectedTeam}
                          onSelect={(player) => {
                            field.onChange([...field.value, player]);
                            setSelectedPlayerIds((prev) => [...prev, player.id]);
                          }}
                          onDeselect={(player) => {
                            field.onChange(field.value.filter((p) => p.id !== player.id));
                            setSelectedPlayerIds((prev) => prev.filter((pId) => pId !== player.id));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between">
                <div>
                  <Button
                    disabled={!enableReorder}
                    className="text-xs"
                    variant="outline"
                    type="button"
                    onClick={shuffleTeams}
                  >
                    <Shuffle className="mr-2 h-4 w-4" /> Shuffle
                  </Button>
                  <Button
                    className="ml-2 text-xs"
                    disabled={!enableReorder}
                    variant="outline"
                    type="button"
                    onClick={evenTeams}
                  >
                    <CircleEqual className="mr-2 h-4 w-4" /> Even
                  </Button>
                </div>
                <LoadingButton loading={isLoading} type="submit">
                  Create Match
                </LoadingButton>
              </div>
            </Drawer>
          </form>
        </Form>
      </TitleLayout>
    </div>
  );
};

const PlayerListCard = ({
  team,
  teamPlayers,
  remainingPlayers,
  selectedTeam,
  onClickAddPlayers,
  onSelect,
  onDeselect,
}: {
  team: "home" | "away";
  selectedTeam: "home" | "away";
  teamPlayers: SeasonPlayer[];
  remainingPlayers: SeasonPlayer[];
  onClickAddPlayers: (team: "home" | "away") => void;
  onSelect: (player: SeasonPlayer) => void;
  onDeselect: (player: SeasonPlayer) => void;
}) => (
  <Card className={"p-0"}>
    <CardHeader>
      <CardTitle className="text-center">{capitalize(team)} Team</CardTitle>
    </CardHeader>
    <CardContent className="grid h-40 overflow-y-scroll">
      {teamPlayers.map((p) => (
        <div className="flex gap-2" key={p.id}>
          <Avatar className="h-6 w-6">
            <AvatarImage src={p.imageUrl} />
            <AvatarFallback>{getInitialsFromString(p.name)}</AvatarFallback>
          </Avatar>
          <div className="grid auto-rows-min">
            <p className="text-xs font-medium truncate">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.score}</p>
          </div>
        </div>
      ))}
    </CardContent>
    <Separator className="mb-4" />
    <CardFooter className="flex-1">
      <DrawerTrigger asChild>
        <Button variant="secondary" className="flex-grow" onClick={() => onClickAddPlayers(team)}>
          Edit Team
        </Button>
      </DrawerTrigger>
      {selectedTeam === team && (
        <TeamDrawerContent
          team={team}
          remainingPlayers={remainingPlayers}
          teamPlayers={teamPlayers}
          onSelect={onSelect}
          onDeselect={onDeselect}
        />
      )}
    </CardFooter>
  </Card>
);

const TeamDrawerContent = ({
  team,
  teamPlayers,
  remainingPlayers,
  onSelect,
  onDeselect,
}: {
  team: "home" | "away";
  teamPlayers: SeasonPlayer[];
  remainingPlayers: SeasonPlayer[];
  onSelect: (player: SeasonPlayer) => void;
  onDeselect: (player: SeasonPlayer) => void;
}) => {
  return (
    <DrawerContent>
      <div className="mx-auto w-full max-w-4xl">
        <DrawerHeader>
          <DrawerTitle className="text-center">{`Add ${team} players`}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <PlayerList
              title="Available"
              variant="outline"
              className="cursor-pointer"
              players={remainingPlayers}
              onSelect={onSelect}
            />
            <PlayerList
              title="Selected"
              variant="default"
              className="cursor-pointer"
              players={teamPlayers}
              onSelect={onDeselect}
            />
          </div>
        </div>
        <DrawerFooter className="items-center">
          <DrawerClose asChild>
            <Button className="w-20" variant="outline">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  );
};

const PlayerList = ({
  title,
  variant,
  players,
  onSelect,
  className,
}: {
  title: string;
  players: SeasonPlayer[];
  onSelect: (player: SeasonPlayer) => void;
  className?: string;
} & VariantProps<typeof badgeVariants>) => (
  <div className={cn("flex-col items-center justify-center", className)}>
    <h3 className={cn("text-sm text-center mb-4 font-medium leading-none tracking-tight")}>
      {title}
    </h3>
    <div className="flex flex-wrap overflow-y-auto h-24 items-center">
      {players.map((player) => (
        <AvatarBadge
          key={player.id}
          className="truncate"
          variant={variant}
          item={{ ...player, name: player.name }}
          onClick={() => {
            onSelect(player);
          }}
        />
      ))}
    </div>
  </div>
);

const ScoreStepper = ({
  team,
  score,
  min,
  max,
  onClickMinus,
  onClickPlus,
}: {
  team: "home" | "away";
  score: number;
  min?: number;
  max?: number;
  onClickMinus: () => void;
  onClickPlus: () => void;
}) => {
  return (
    <div className="flex items-center justify-between w-40">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={onClickMinus}
        type="button"
        disabled={min !== undefined && score <= min}
      >
        <MinusIcon className="h-4 w-4" />
        <span className="sr-only">Decrease</span>
      </Button>
      <div className="text-center">
        <div className="text-6xl font-bold tracking-tighter">{score}</div>
        <div className="text-[0.70rem] uppercase text-muted-foreground">{team}</div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={onClickPlus}
        type="button"
        disabled={max !== undefined && score <= max}
      >
        <PlusIcon className="h-4 w-4" />
        <span className="sr-only">Increase</span>
      </Button>
    </div>
  );
};
