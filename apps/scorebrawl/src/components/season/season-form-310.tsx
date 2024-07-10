"use client";
import { create } from "@/actions/season";
import { createSeasonSchema } from "@scorebrawl/api";
import AutoForm from "@scorebrawl/ui/auto-form";
import { LoadingButton } from "@scorebrawl/ui/loading-button";
import { useToast } from "@scorebrawl/ui/use-toast";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

type FormValues = {
  name: string;
  startDate: Date;
  endDate?: Date;
};

const schema = createSeasonSchema
  .omit({ userId: true, leagueId: true, kFactor: true, initialScore: true, scoreType: true })
  .refine((data) => data.endDate && data.endDate > data.startDate, {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  });

export const SeasonForm310 = ({ league }: { league: { id: string; slug: string } }) => {
  const { toast } = useToast();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [_scoreType, setScoreType] = useQueryState(
    "scoreType",
    parseAsString.withDefault("").withOptions({
      shallow: false,
      throttleMs: 500,
    }),
  );
  useEffect(() => {
    setScoreType("3-1-0");
  }, [setScoreType]);

  const onSubmit = async (val: FormValues) => {
    setIsLoading(true);
    try {
      await create({
        ...val,
        kFactor: 0,
        initialScore: 0,
        leagueId: league.id,
        scoreType: "3-1-0" as const,
      });
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
      <p className="text-xs text-muted-foreground h-16">
        Create a season using the Standard 3-1-0 Points System, where teams earn 3 points for a win,
        1 point for a draw, and 0 points for a loss. A straightforward scoring system for clear and
        simple match outcomes.
      </p>
      <AutoForm className="flex-1" formSchema={schema} onSubmit={onSubmit}>
        <LoadingButton loading={isLoading} type="submit">
          Create Season
        </LoadingButton>
      </AutoForm>
    </>
  );
};
