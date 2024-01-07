"use server";

import { auth } from "@clerk/nextjs";
import { CreateLeagueInput } from "@scorebrawl/api";
import { createLeague } from "@scorebrawl/db";

export const create = async (val: Omit<CreateLeagueInput, "userId">) => {
  "use server";
  const { userId } = auth();
  return createLeague({ ...val, userId: userId as string });
};
