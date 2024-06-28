import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: protectedProcedure.input(z.object({ text: z.string() })).query(({ input, ctx }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),
});
