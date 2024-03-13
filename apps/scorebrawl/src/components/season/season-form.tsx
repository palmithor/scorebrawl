"use client";
import { create } from "@/actions/season";
import { ScoreType, createSeasonSchema } from "@scorebrawl/api";
import { LeagueOmitCode, Season } from "@scorebrawl/db/types";
import AutoForm from "@scorebrawl/ui/auto-form";
import { LoadingButton } from "@scorebrawl/ui/loading-button";
import { useToast } from "@scorebrawl/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TitleLayout } from "../layout/title-layout";
import { SeasonList } from "./season-list";

type FormValues = {
  name: string;
  scoreType: ScoreType;
  initialScore: number;
  startDate: Date;
  endDate?: Date;
  kFactor: number;
};

const schema = createSeasonSchema
  .omit({ userId: true, leagueId: true })
  .refine((data) => data.endDate && data.endDate > data.startDate, {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  });

export const SeasonForm = ({ league, seasons }: { league: LeagueOmitCode; seasons: Season[] }) => {
  const { toast } = useToast();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (val: FormValues) => {
    setIsLoading(true);
    try {
      await create({
        ...val,
        leagueId: league.id,
        scoreType: val.scoreType,
        initialScore: val.initialScore,
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
    <TitleLayout
      title="Create a season"
      subtitle={league ? `In league "${league.name}"` : undefined}
      backLink={`/leagues/${league.slug}`}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        <AutoForm className="flex-1" formSchema={schema} onSubmit={onSubmit}>
          <LoadingButton loading={isLoading} type="submit">
            Create Season
          </LoadingButton>
        </AutoForm>
        {seasons.length > 0 && <SeasonList className="flex-1" seasons={seasons} />}
      </div>
    </TitleLayout>
  );
};
