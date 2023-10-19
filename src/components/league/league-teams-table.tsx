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

export const LeagueTeamsTable = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data } = api.league.getTeams.useQuery({ leagueSlug });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
