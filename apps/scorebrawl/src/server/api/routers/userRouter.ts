import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { UserRepository } from "@scorebrawl/db";

export const userRouter = createTRPCRouter({
  getAvatar: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input, ctx }) => UserRepository.getUserAvatar({ id: input.userId })),
});
