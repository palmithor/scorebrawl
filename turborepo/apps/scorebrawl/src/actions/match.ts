"use server";

import { auth } from "@clerk/nextjs";
import { CreateMatchInput } from "@scorebrawl/api";
import { createMatch } from "@scorebrawl/db";

export const create = async (val: Omit<CreateMatchInput, "userId">) =>
  createMatch({ ...val, userId: auth().userId as string });
