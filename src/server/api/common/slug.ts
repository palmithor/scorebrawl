import {
  type SQLiteTableWithColumns,
  type SQLiteText,
} from "drizzle-orm/sqlite-core";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import slugify from "@sindresorhus/slugify";

export const slugifyName = async ({
  table,
  name,
}: {
  table: SQLiteTableWithColumns<{
    name: string;
    schema: string | undefined;
    columns: {
      slug: SQLiteText<{
        tableName: "league" | "season";
        enumValues: [string, ...string[]];
        name: "name_slug";
        data: string;
        driverParam: string;
        hasDefault: false;
        notNull: true;
      }>;
    };
  }>;
  name: string;
}) => {
  const doesLeagueSlugExists = async (slug: string) =>
    db.select().from(table).where(eq(table.slug, slug)).limit(1).get();
  const rootSlug = slugify(name, {
    customReplacements: [
      ["þ", "th"],
      ["Þ", "th"],
      ["ð", "d"],
      ["Ð", "d"],
    ],
  });
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
