"use client";
import { useRouter } from "next/router";
import { FormLayout } from "~/components/layout/form-layout";
import AutoForm from "~/components/ui/auto-form";
import { LoadingButton } from "~/components/ui/loading-button";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/lib/api";
import { create } from "~/server/api/season/season.schema";
import { SeasonList } from "~/components/league/list";
import React from "react";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";

export const SeasonForm = () => {
  const router = useRouter();
  const leagueSlug = router.query.leagueSlug as string;
  const { toast } = useToast();
  const { isLoading, mutate } = api.season.create.useMutation();
  const { data: league } = api.league.getBySlug.useQuery({ leagueSlug });
  // todo check editor access and redirect

  return (
    <LeagueDetailsLayout activeTab={"seasons"} hideJoinButton>
      <FormLayout
        title="Create a season"
        subtitle={league ? `In league "${league.name}"` : undefined}
      >
        <div className="flex flex-col gap-6 md:flex-row">
          <AutoForm
            className="flex-1"
            formSchema={create.omit({ leagueSlug: true })}
            onSubmit={(val) =>
              mutate(
                { ...val, leagueSlug },
                {
                  onSuccess: () => void router.push(`/leagues/${leagueSlug}`),
                  onError: (err) =>
                    toast({
                      variant: "destructive",
                      title: "Error creating season",
                      description: err.message,
                    }),
                }
              )
            }
          >
            <LoadingButton loading={isLoading} type="submit">
              Create Season
            </LoadingButton>
          </AutoForm>
          <SeasonList className="flex-1" leagueSlug={leagueSlug} />
        </div>
      </FormLayout>
    </LeagueDetailsLayout>
  );
};

export default SeasonForm;
