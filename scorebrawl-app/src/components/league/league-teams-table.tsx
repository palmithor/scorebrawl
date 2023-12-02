/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/lib/api";
import { MultiAvatar } from "~/components/user/multi-avatar";
import { useUser } from "@clerk/nextjs";
import { UpdateTeamDialog } from "~/components/team/update-team-dialog";
import { EditIcon } from "lucide-react";

export const LeagueTeamsTable = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data } = api.league.getTeams.useQuery({ leagueSlug });
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery({ leagueSlug });
  const { user } = useUser();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <div className="flex items-center">
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
                  <div className="ml-4">
                    <h2 className={"text-sm"}>{team.name}</h2>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>{team.createdAt.toLocaleDateString(window.navigator.language)}</div>
              </TableCell>
              <TableCell>
                {((user && team.players.map((p) => p.leaguePlayer.user.id).includes(user?.id)) ||
                  hasEditorAccess) && (
                  <div className="flex">
                    <UpdateTeamDialog leagueSlug={leagueSlug} team={team}>
                      <EditIcon className="h-4 w-4 grow cursor-pointer text-center" />
                    </UpdateTeamDialog>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
