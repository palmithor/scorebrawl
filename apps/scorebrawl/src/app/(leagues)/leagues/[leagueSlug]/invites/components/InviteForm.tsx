"use client";

import { api } from "@/trpc/react";
import { type LeagueMemberRole, createInviteSchema } from "@scorebrawl/api";
import AutoForm from "@scorebrawl/ui/auto-form";
import { LoadingButton } from "@scorebrawl/ui/loading-button";

type FormValues = {
  role: LeagueMemberRole;
  expiresAt?: Date;
};

export const InviteForm = ({
  leagueSlug,
  onSuccess,
}: { leagueSlug: string; onSuccess?: () => void }) => {
  const { invite } = api.useUtils();
  const { mutate, isPending } = api.invite.create.useMutation();
  const onSubmit = async (val: FormValues) => {
    mutate(
      { ...val, leagueSlug },
      {
        onSuccess: () => {
          invite.getAll.invalidate({ leagueSlug });
          onSuccess?.();
        },
      },
    );
  };

  return (
    <AutoForm formSchema={createInviteSchema.omit({ leagueSlug: true })} onSubmit={onSubmit}>
      <LoadingButton loading={isPending} type="submit">
        Create Invite
      </LoadingButton>
    </AutoForm>
  );
};
