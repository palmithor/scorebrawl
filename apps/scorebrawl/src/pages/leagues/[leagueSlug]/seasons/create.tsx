"use client";
import { AutoForm, LoadingButton, useToast } from "@repo/ui/components";
import { useRouter } from "next/router";
import { TitleLayout } from "~/components/layout/title-layout";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";
import { SeasonList } from "~/components/league/season-list";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";
import { create } from "~/server/api/season/season.schema";

export const SeasonForm = () => {
  const leagueSlug = useLeagueSlug();
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading, mutate } = api.season.create.useMutation();
  const { data: league } = api.league.getBySlug.useQuery({ leagueSlug });
  // todo check editor access and redirect

  return (
    <LeagueDetailsLayout hideJoinButton>
      <TitleLayout
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
                },
              )
            }
          >
            <LoadingButton loading={isLoading} type="submit">
              Create Season
            </LoadingButton>
          </AutoForm>
          <SeasonList className="flex-1" leagueSlug={leagueSlug} />
        </div>
      </TitleLayout>
    </LeagueDetailsLayout>
  );
};

export default SeasonForm;
