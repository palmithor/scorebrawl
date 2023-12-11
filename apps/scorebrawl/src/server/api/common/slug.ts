import slugify from "@sindresorhus/slugify";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { leagues, seasons } from "~/server/db/schema";

// TODO Refactor to reuse same parts

const slugifyWithCustomReplacement = (text: string) => {
  return slugify(text, {
    customReplacements: [
      ["þ", "th"],
      ["Þ", "th"],
      ["ð", "d"],
      ["Ð", "d"],
    ],
  });
};
export const slugifyLeagueName = async ({ name }: { name: string }) => {
  leagues;
  const doesLeagueSlugExists = async (slug: string) =>
    db.select().from(leagues).where(eq(leagues.slug, slug)).limit(1).get();
  const rootSlug = slugifyWithCustomReplacement(name);
  let slug = rootSlug;
  let slugExists = await doesLeagueSlugExists(slug);
  let counter = 1;
  while (slugExists) {
    slug = `${rootSlug}-${counter}`;
    counter++;
    slugExists = await doesLeagueSlugExists(slug);
  }
  return slug;
};

export const slugifySeasonName = async ({ name }: { name: string }) => {
  leagues;
  const doesLeagueSlugExists = async (slug: string) =>
    db.select().from(seasons).where(eq(seasons.slug, slug)).limit(1).get();

  const rootSlug = slugifyWithCustomReplacement(name);
  let slug = rootSlug;
  let slugExists = await doesLeagueSlugExists(slug);
  let counter = 1;
  while (slugExists) {
    slug = `${rootSlug}-${counter}`;
    counter++;
    slugExists = await doesLeagueSlugExists(slug);
  }
  return slug;
};
