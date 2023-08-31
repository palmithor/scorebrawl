import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AvatarName } from "~/components/user/avatar-name";
import { api } from "~/lib/api";

export const LeaguePlayers = ({
  leagueSlug,
  className,
}: {
  leagueSlug: string;
  className?: string;
}) => {
  const { data } = api.league.getPlayers.useQuery({ leagueSlug });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>League Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <AvatarName name={player.name} avatarUrl={player.imageUrl} />{" "}
                  </TableCell>
                  <TableCell>
                    <div>{player.joinedAt.toLocaleDateString(window.navigator.language)}</div>
                  </TableCell>
                  <TableCell>
                    <div>{player.disabled ? "Disabled" : "Active"}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
