import { useRouter } from "next/router";
import type z from "zod";
import { LeagueForm } from "~/components/league/league-form";
import { useToast } from "~/components/ui/use-toast";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";
import { type create } from "~/server/api/league/league.schema";

const EditLeague = () => {
  const router = useRouter();
  const leagueSlug = useLeagueSlug();
  const { data: league } = api.league.getBySlug.useQuery({ leagueSlug });
  const { isLoading, mutate } = api.league.update.useMutation();
  const { toast } = useToast();

  const onSubmit = (val: z.infer<typeof create>) => {
    mutate(
      { leagueSlug, ...val },
      {
        onSuccess: (result) => void router.push(`/leagues/${result?.slug || ""}`),
        onError: (err) =>
          toast({
            title: "Error editing season",
            description: err.message,
          }),
      },
    );
  };

  return (
    <LeagueForm
      title={"Edit League"}
      buttonTitle={"Edit League"}
      league={league}
      isLoading={isLoading}
      onSubmit={onSubmit}
    />
  );
};

export default EditLeague;
