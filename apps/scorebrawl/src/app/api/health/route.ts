import { Leagues, db } from "@scorebrawl/db";

export async function GET(request: Request) {
  const apiKey = "Rosquj-8cozdu-jepwoz-sunwon-0jewjo-Xuxqur";

  if (request.headers.get("x-api-key") !== apiKey) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await db.select().from(Leagues).limit(1);
    return Response.json({ message: "OK" });
  } catch (_error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
