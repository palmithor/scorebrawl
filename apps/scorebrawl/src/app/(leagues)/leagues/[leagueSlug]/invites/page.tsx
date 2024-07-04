import { getHasEditorAccess, getLeagueOrRedirect } from "@/actions/league";
import { InviteTable } from "@/app/(leagues)/leagues/[leagueSlug]/invites/components/InviteTable";
import { api } from "@/trpc/server";
import { RedirectType, redirect } from "next/navigation";

export default async ({ params }: { params: { leagueSlug: string } }) => {
  const league = await getLeagueOrRedirect(params.leagueSlug);
  const hasEditorAccess = await getHasEditorAccess(league.id);
  if (!hasEditorAccess) {
    redirect(`/leagues/${params.leagueSlug}`, RedirectType.replace);
  }
  const invites = await api.invite.getInvites({ leagueSlug: params.leagueSlug });
  return <InviteTable invites={invites} />;
};
