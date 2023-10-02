import React, { useEffect, useMemo } from "react";
import z from "zod";
import { LoadingButton } from "~/components/ui/loading-button";
import { TitleLayout } from "~/components/layout/title-layout";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/lib/api";
import { FancyMultiSelect, type Item } from "~/components/ui/fancy-multi-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldPathValue, type FieldValues, useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { useRouter } from "next/router";
import { FullPageSpinner } from "~/components/full-page-spinner";

const schema = z.object({
  awayPlayerIds: z.string().array().nonempty({ message: "Must have at least one player" }),
  homePlayerIds: z.string().array().nonempty({ message: "Must have at least one player" }),
  homeScore: z.coerce.number().min(0),
  awayScore: z.coerce.number().min(0),
});

type MatchFormValues = z.infer<typeof schema>;

const CreateMatch = () => {
  const leagueSlug = useLeagueSlug();
  const router = useRouter();
  const { toast } = useToast();
  const {
    data: season,
    error,
    isLoading,
  } = api.season.getById.useQuery({ leagueSlug, seasonId: router.query.seasonId as string });
  const { data: players = [], isLoading: isLoadingPlayers } = api.season.getPlayers.useQuery({
    seasonId: router.query.seasonId as string,
  });
  const { isLoading: isSubmitting, mutate } = api.match.create.useMutation();
  const [homeTeam, setHomeTeam] = React.useState<Item[]>([]);
  const [awayTeam, setAwayTeam] = React.useState<Item[]>([]);
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      awayPlayerIds: [],
      awayScore: 0,
      homePlayerIds: [],
      homeScore: 0,
    },
  });

  const items = useMemo(() => players.map((p) => ({ value: p.id, label: p.name })), [players]);

  useEffect(() => {
    if (error) {
      router.push(`/leagues/${leagueSlug}`).catch(console.error);
    }
  }, [router, players, error, leagueSlug, toast]);

  if (isLoading || isLoadingPlayers) {
    return <FullPageSpinner className="h-[calc(100vh-180px)]" />;
  }

  const onSubmit = (val: MatchFormValues) => {
    mutate(
      { seasonId: season?.id as string, ...val },
      {
        onSuccess: () => void router.push(`/leagues/${leagueSlug}`),
        onError: (err) =>
          toast({
            title: "Error creating match",
            description: err.message,
          }),
      },
    );
  };

  const onTeamChange = (
    items: Item[],
    setTeam: React.Dispatch<React.SetStateAction<Item[]>>,
    onFieldChange: (event: FieldPathValue<FieldValues, string>) => void,
  ) => {
    const ids: [string, ...string[]] = items.map((i) => i.value) as [string, ...string[]];
    onFieldChange(ids);
    setTeam(items);
  };

  return (
    <TitleLayout title={"Create Match"} subtitle={season && `In season "${season.name}"`}>
      <Form {...form}>
        <form
          noValidate
          className="space-y-5"
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className="flex gap-4">
            <div className="grow">
              <FormField
                control={form.control}
                name="homePlayerIds"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Home Team</FormLabel>
                      <FormControl className="items-center">
                        <FancyMultiSelect
                          items={items}
                          closeOnSelect
                          excludeItems={awayTeam}
                          onValueChange={(items: Item[]) =>
                            onTeamChange(items, setHomeTeam, field.onChange)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="homeScore"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Score</FormLabel>
                      <FormControl>
                        <Input onFocus={(e) => e.target.select()} type="number" {...field}></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="grow">
              <FormField
                control={form.control}
                name="awayPlayerIds"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Away Team</FormLabel>
                      <FormControl>
                        <FancyMultiSelect
                          items={items}
                          excludeItems={homeTeam}
                          closeOnSelect
                          onValueChange={(items: Item[]) =>
                            onTeamChange(items, setAwayTeam, field.onChange)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="awayScore"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Score</FormLabel>
                      <FormControl>
                        <Input onFocus={(e) => e.target.select()} type="number" {...field}></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <LoadingButton loading={isSubmitting} type="submit">
            Create Match
          </LoadingButton>
        </form>
      </Form>
    </TitleLayout>
  );
};

export default CreateMatch;
