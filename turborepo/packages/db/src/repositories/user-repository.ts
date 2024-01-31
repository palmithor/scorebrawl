import { fullName } from "@scorebrawl/utils/string";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { leaguePlayers, users } from "../schema";

export const findUserById = async ({ id }: { id: string }) => {
  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    columns: { id: true },
  });
};

export const upsertUser = async ({
  id,
  firstName,
  lastName,
  imageUrl,
  createdAt,
  updatedAt,
}: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
}) => {
  await db
    .insert(users)
    .values({
      id,
      name: fullName({
        firstName,
        lastName,
      }),
      imageUrl: imageUrl,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: fullName({
          firstName,
          lastName,
        }),
        imageUrl: imageUrl,
        updatedAt: new Date(updatedAt),
      },
    });
};
