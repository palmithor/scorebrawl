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
      nameSlug: SQLiteText<{
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
  const doesLeagueSlugExists = async (nameSlug: string) =>
    db.select().from(table).where(eq(table.nameSlug, nameSlug)).limit(1).get();
  const rootNameSlug = slugify(name, {
    customReplacements: [
      ["þ", "th"],
      ["Þ", "th"],
      ["ð", "d"],
      ["Ð", "d"],
    ],
  });
  let nameSlug = rootNameSlug;
  let slugExists = await doesLeagueSlugExists(nameSlug);
  let counter = 1;
  while (slugExists) {
    nameSlug = `${rootNameSlug}-${counter}`;
    counter++;
    slugExists = await doesLeagueSlugExists(nameSlug);
  }
  return nameSlug;
};
