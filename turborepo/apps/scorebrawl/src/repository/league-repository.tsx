import { getLeagueBySlug as getLeagueBySlugImpl } from "@scorebrawl/db";
import { cache } from "react";

export const getLeagueBySlug = cache((params: { userId: string; slug: string }) =>
  getLeagueBySlugImpl(params),
);
