"use client";
import { useRouter } from "next/router";
import type * as z from "zod";
import { FormLayout } from "~/components/layout/form-layout";
import AutoForm from "~/components/ui/auto-form";
import { LoadingButton } from "~/components/ui/loading-button";
import { api } from "~/lib/api";
import { create } from "~/server/api/league/league.schema";

const LeagueFormAuto = () => {
  const router = useRouter();
  const { isLoading, mutateAsync } = api.league.create.useMutation();

  const onSubmit = async (data: z.infer<typeof create>) => {
    const result = await mutateAsync(data);
    if (result) {
      await router.push(`/leagues/${result.slug}`);
    }
  };

  return (
    <FormLayout title={"Create League"}>
      <AutoForm formSchema={create} onSubmit={(val) => void onSubmit(val)}>
        <LoadingButton loading={isLoading} type="submit">
          Create League
        </LoadingButton>
      </AutoForm>
    </FormLayout>
  );
};

export default LeagueFormAuto;
