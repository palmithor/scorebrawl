import type { WebhookEvent } from "@clerk/nextjs/server";
import { Users, db } from "@scorebrawl/db";
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
  //.find(address => address.id === evt.data.primary_email_address_id)
  if (eventType === "user.created" || eventType === "user.updated") {
    const webhookUser = evt.data;
    const email = webhookUser.email_addresses?.find(
      (emailAddressJson) => emailAddressJson.id === webhookUser.primary_email_address_id,
    )?.email_address;
    await db
      .insert(Users)
      .values({
        id: webhookUser.id,
        name: fullName({
          firstName: webhookUser.first_name,
          lastName: webhookUser.last_name,
        }),
        image: webhookUser.image_url,
        imageUrl: webhookUser.image_url,
        email: email,
        emailVerified: true,
        createdAt: new Date(webhookUser.created_at),
        updatedAt: new Date(webhookUser.updated_at),
      })
      .onConflictDoUpdate({
        target: Users.id,
        set: {
          name: fullName({
            firstName: webhookUser.first_name,
            lastName: webhookUser.last_name,
          }),
          imageUrl: webhookUser.image_url,
          updatedAt: new Date(webhookUser.updated_at),
        },
      });
  }
  return new Response("", { status: 200 });
}
