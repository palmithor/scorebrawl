import { auth } from "@/lib/auth";
import { claim, findByCode } from "@scorebrawl/db/invite";
import { getByIdWhereMember } from "@scorebrawl/db/league";
import { headers } from "next/headers";

export const GET = async (
  _request: Request,
  { params: { code } }: { params: { code: string } },
) => {
  const invite = await findByCode(code);
  if (!invite) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/?errorCode=INVITE_NOT_FOUND`,
      302,
    );
  }
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const league = await getByIdWhereMember({
      leagueId: invite.leagueId,
      userId: session?.user.id ?? "",
    });
    if (league) {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/leagues/${league.slug}?errorCode=INVITE_ALREADY_CLAIMED`,
        302,
      );
    }
    const { leagueSlug } = await claim({
      leagueId: invite.leagueId,
      role: invite.role,
      userId: session?.user.id ?? "",
    });

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/leagues/${leagueSlug}?errorCode=INVITE_ALREADY_CLAIMED`,
      302,
    );
  } catch {
    return Response.redirect(`${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`);
  }
};
