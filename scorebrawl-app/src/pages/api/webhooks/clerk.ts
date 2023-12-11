import { type IncomingHttpHeaders } from "http";
import { type WebhookEvent } from "@clerk/backend";
import { type NextApiRequest, type NextApiResponse } from "next";
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { env } from "~/env.mjs";
import { fullName } from "~/lib/string-utils";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};

const secret = env.CLERK_WEBHOOK_SECRET;

const handler = async (req: NextApiRequestWithSvixRequiredHeaders, res: NextApiResponse) => {
  if (!secret) {
    return res.status(501).json({});
  }
  const payload = JSON.stringify(req.body);
  const headers = req.headers;
  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(secret);

  let evt: WebhookEvent;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payload, headers) as WebhookEvent;
  } catch (_) {
    // If the verification fails, return a 400 error
    return res.status(400).json({});
  }

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
      })
      .run();
    return res.status(200).json({});
  }
  return res.status(200).json({});
};

export default handler;
