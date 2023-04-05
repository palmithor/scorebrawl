import z from "zod";
import { pageQuerySchema } from "../pagination/schema";

export const leaguesByUserIdSchema = z.object({
  userId: z.string(),
  pageQuery: pageQuerySchema,
});
