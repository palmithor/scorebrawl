import { auth } from "@/lib/auth";
import { findBySlug } from "@scorebrawl/db/league";
import { getLeaguePlayers } from "@scorebrawl/db/player";
import { headers } from "next/headers";

export async function GET(_request: Request, { params }: { params: { leagueSlug: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const league = await findBySlug({
      userId: session?.user.id ?? "",
      leagueSlug: params.leagueSlug,
    });
    if (!league) {
      return Response.json({ error: "League not found" }, { status: 404 });
    }
    const leaguePlayers = await getLeaguePlayers({ leagueId: league.id });

    return Response.json(leaguePlayers);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
