"use client";
import { useToast } from "@repo/ui/components";
import { useRouter } from "next/router";
import type z from "zod";
import { LeagueForm } from "~/components/league/league-form";
import { api } from "~/lib/api";
import { type create } from "~/server/api/league/league.schema";

export const DEFAULT_LEAGUE_LOGO =
  "https://utfs.io/f/c5562abd-47aa-46de-b6a9-936b4cef1875_mascot.png";

const CreateLeague = () => {
  const router = useRouter();
  const { isLoading, mutate } = api.league.create.useMutation();
  const { toast } = useToast();

  const onSubmit = (val: z.infer<typeof create>) => {
    mutate(
      { ...val },
      {
        onSuccess: (result) => void router.push(`/leagues/${result?.slug || ""}`),
        onError: (err) =>
          toast({
            title: "Error creating season",
            description: err.message,
          }),
      },
    );
  };

  return (
    <LeagueForm
      title={"Create League"}
      buttonTitle={"Create League"}
      isLoading={isLoading}
      onSubmit={onSubmit}
    />
  );
};

export default CreateLeague;
