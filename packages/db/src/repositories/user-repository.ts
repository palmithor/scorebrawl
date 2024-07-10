import { fullName } from "@scorebrawl/utils/string";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";

const getUserAvatar = async ({ id }: { id: string }) => {
  const [userAvatar] = await db
    .select({ name: users.name, imageUrl: users.imageUrl })
    .from(users)
    .where(eq(users.id, id));
  return userAvatar;
};

const findUserById = async ({ id }: { id: string }) =>
  db.select({ id: users.id }).from(users).where(eq(users.id, id));

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

export const UserRepository = { findUserById, upsertUser, getUserAvatar };
