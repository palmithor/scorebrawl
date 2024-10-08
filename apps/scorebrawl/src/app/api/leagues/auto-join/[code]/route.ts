import { auth } from "@clerk/nextjs/server";
import { claim, findByCode } from "@scorebrawl/db/invite";
import { getByIdWhereMember } from "@scorebrawl/db/league";

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
  const league = await getByIdWhereMember({
    leagueId: invite.leagueId,
    userId: auth().userId ?? "",
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
    userId: auth().userId ?? "",
  });
  return Response.redirect(
    `${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/leagues/${leagueSlug}?errorCode=INVITE_ALREADY_CLAIMED`,
    302,
  );
};
