"use client";
import { useRouter } from "next/router";
import { FormLayout } from "~/components/layout/form-layout";
import AutoForm from "~/components/ui/auto-form";
import { LoadingButton } from "~/components/ui/loading-button";
import { api } from "~/lib/api";
import { create } from "~/server/api/league/league.schema";
import { useToast } from "~/components/ui/use-toast";

const LeagueForm = () => {
  const router = useRouter();
  const { isLoading, mutate } = api.league.create.useMutation();
  const { toast } = useToast();

  return (
    <FormLayout title={"Create League"}>
      <AutoForm
        formSchema={create}
        fieldConfig={{ visibility: { fieldType: "radio" } }}
        onSubmit={(val) =>
          mutate(val, {
            onSuccess: (result) => void router.push(`/leagues/${result.slug}`),
            onError: (err) =>
              toast({
                title: "Error creating season",
                description: err.message,
              }),
          })
        }
      >
        <LoadingButton loading={isLoading} type="submit">
          Create League
        </LoadingButton>
      </AutoForm>
    </FormLayout>
  );
};

export default LeagueForm;
