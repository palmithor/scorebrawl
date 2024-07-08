import { InviteDialog } from "./components/InviteDialog";
import { InviteTable } from "./components/InviteTable";

export default async ({ params }: { params: { leagueSlug: string } }) => {
  return (
    <div className={"grid"}>
      <div className={"justify-end w-full"}>
        <InviteDialog leagueSlug={params.leagueSlug} />
      </div>
      <InviteTable leagueSlug={params.leagueSlug} />
    </div>
  );
};
