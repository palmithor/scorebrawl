import { fullName } from "@scorebrawl/utils/string";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";

const getUserAvatar = async ({ userId }: { userId: string }) => {
  const [userAvatar] = await db
    .select({ name: users.name, imageUrl: users.imageUrl })
    .from(users)
    .where(eq(users.id, userId));
  return userAvatar;
};

const findUserById = async ({ id }: { id: string }) =>
  db.select().from(users).where(eq(users.id, id));

const setDefaultLeague = async ({ leagueId, userId }: { leagueId: string; userId: string }) => {
  const [user] = await db
    .update(users)
    .set({ defaultLeagueId: leagueId })
    .where(eq(users.id, userId))
    .returning();
  return user;
};

const upsertUser = async ({
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

export const UserRepository = {
  findUserById,
  getUserAvatar,
  setDefaultLeague,
  upsertUser,
};
