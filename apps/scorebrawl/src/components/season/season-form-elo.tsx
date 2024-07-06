"use client";
import { create } from "@/actions/season";
import { createSeasonSchema, eloType } from "@scorebrawl/api";
import type { LeagueOmitCode } from "@scorebrawl/db/types";
import AutoForm from "@scorebrawl/ui/auto-form";
import { LoadingButton } from "@scorebrawl/ui/loading-button";
import { useToast } from "@scorebrawl/ui/use-toast";
import { endOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { z } from "zod";

type FormValues = {
  name: string;
  initialScore: number;
  startDate: Date;
  eloType?: "team vs team" | "individual vs team";
  endDate?: Date;
  kFactor: number;
};

const schema = createSeasonSchema
  .extend({
    eloType: z.enum(eloType).default("team vs team"),
  })
  .omit({ userId: true, leagueId: true, scoreType: true })
  .refine((data) => data.endDate && data.endDate > data.startDate, {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  });

export const SeasonFormElo = ({ league }: { league: LeagueOmitCode }) => {
  const { toast } = useToast();
  const { push, refresh } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [_scoreType, setScoreType] = useQueryState(
    "scoreType",
    parseAsString.withDefault("").withOptions({
      shallow: false,
      throttleMs: 500,
    }),
  );
  useEffect(() => {
    setScoreType("elo");
  }, [setScoreType]);
  const onSubmit = async (val: FormValues) => {
    setIsLoading(true);
    try {
      await create({
        ...val,
        endDate: val.endDate ? endOfDay(val.endDate) : undefined,
        leagueId: league.id,
        scoreType: val.eloType === "team vs team" ? "elo" : "elo-individual-vs-team",
        initialScore: val.initialScore,
      });
      refresh();
      push(`/leagues/${league.slug}/overview`);
    } catch (err) {
      toast({
        title: "Error creating season",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className="text-xs text-muted-foreground  h-16">
        Create a season using the Elo Points System. A higher K-Factor may lead to more volatile
        ratings, while a lower K-Factor results in more stable ratings over time.
      </p>
      <AutoForm className="flex-1" formSchema={schema} onSubmit={onSubmit}>
        <LoadingButton loading={isLoading} type="submit">
          Create Season
        </LoadingButton>
      </AutoForm>
    </>
  );
};
