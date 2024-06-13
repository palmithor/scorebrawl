import { getHasEditorAccess, getTeams } from "@/actions/league";
import { DateCell } from "@/components/players/date-cell";
import { UpdateTeamDialog } from "@/components/players/update-team-dialog";
import { auth } from "@clerk/nextjs";
import { MultiAvatar } from "@scorebrawl/ui/multi-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { EditIcon } from "lucide-react";

export const LeagueTeamsTable = async ({ leagueId }: { leagueId: string }) => {
  const user = auth();
  const teams = await getTeams(leagueId);
  const hasEditorAccess = await getHasEditorAccess(leagueId);
  return (
    <div className="rounded-md border px-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams?.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <div className="grid gap-4 grid-cols-[auto_1fr]">
                  <div className="relative">
                    <MultiAvatar
                      users={team.players.map((p) => ({
                        id: p.leaguePlayer.id,
                        name: p.leaguePlayer.user.name,
                        imageUrl: p.leaguePlayer.user.imageUrl,
                      }))}
                      visibleCount={5}
                    />
                  </div>
                  <p className="text-sm self-center truncate">{team.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <DateCell date={team.createdAt} />
              </TableCell>
              <TableCell>
                {((user?.userId &&
                  team.players.map((p) => p.leaguePlayer.user.id).includes(user.userId)) ||
                  hasEditorAccess) && (
                  <UpdateTeamDialog leagueId={leagueId} team={team}>
                    <EditIcon className="h-4 w-4 grow cursor-pointer text-center" />
                  </UpdateTeamDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
