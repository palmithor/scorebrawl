import type { WebhookEvent } from "@clerk/nextjs/server";
import { db, users } from "@scorebrawl/db";
import { fullName } from "@scorebrawl/utils/string";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }
  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  // const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    await db
      .insert(users)
      .values({
        id: evt.data.id,
        name: fullName({
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
        }),
        imageUrl: evt.data.image_url,
        createdAt: new Date(evt.data.created_at),
        updatedAt: new Date(evt.data.updated_at),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: fullName({
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
          }),
          imageUrl: evt.data.image_url,
          updatedAt: new Date(evt.data.updated_at),
        },
      });
  }
  return new Response("", { status: 200 });
}
