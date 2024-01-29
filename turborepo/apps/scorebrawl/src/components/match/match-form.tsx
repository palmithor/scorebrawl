"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Season, SeasonPlayer } from "@scorebrawl/db/src/types";
import { badgeVariants } from "@scorebrawl/ui/badge";
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
import { useForm } from "react-hook-form";

import { create } from "@/actions/match";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Avatar, AvatarFallback, AvatarImage } from "@scorebrawl/ui/avatar";
import { Checkbox } from "@scorebrawl/ui/checkbox";
import { LoadingButton } from "@scorebrawl/ui/loading-button";
import { Separator } from "@scorebrawl/ui/separator";
import { useToast } from "@scorebrawl/ui/use-toast";
import { capitalize, getInitialsFromString } from "@scorebrawl/utils/string";
import { type VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { z } from "zod";
import { TitleLayout } from "../layout/title-layout";
import { AvatarBadge } from "../user/avatar-badge";

const seasonPlayerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  elo: z.number(),
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

type FormValues = z.infer<typeof schema>;

export const MatchForm = ({
  season,
  leagueSlug,
  seasonPlayers,
}: { leagueSlug: string; season: Season; seasonPlayers: SeasonPlayer[] }) => {
  const { toast } = useToast();
  const { refresh } = useRouter();
  const [remainingPlayers, setRemainingPlayers] = useState<SeasonPlayer[]>(seasonPlayers);
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

  const isHomeTeam = () => selectedTeam === "home";

  const onSubmit = async ({ homeScore, homePlayers, awayPlayers, awayScore }: FormValues) => {
    setIsLoading(true);
    try {
      const match = await create({
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
      setRemainingPlayers(seasonPlayers);
    } catch (err) {
      toast({
        title: "Error creating league",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                            setRemainingPlayers(remainingPlayers.filter((p) => p.id !== player.id));
                          }}
                          onDeselect={(player) => {
                            field.onChange(field.value.filter((p) => p.id !== player.id));
                            setRemainingPlayers([...remainingPlayers, player]);
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
                            setRemainingPlayers(remainingPlayers.filter((p) => p.id !== player.id));
                          }}
                          onDeselect={(player) => {
                            field.onChange(field.value.filter((p) => p.id !== player.id));
                            setRemainingPlayers([...remainingPlayers, player]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <LoadingButton loading={isLoading} type="submit">
                Create Match
              </LoadingButton>
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
            <p className="text-xs text-muted-foreground">{p.elo}</p>
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
