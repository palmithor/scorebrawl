"use client";
import { api } from "@/trpc/react";
import { AvatarName } from "@scorebrawl/ui/avatar-name";

export const CreatedByCell = ({ userId }: { userId: string }) => {
  const { data } = api.avatar.getByUserId.useQuery({ userId });
  if (!data) {
    return null;
  }
  return <AvatarName name={data.name} imageUrl={data.imageUrl} />;
};
