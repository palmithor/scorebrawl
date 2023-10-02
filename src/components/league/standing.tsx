import { AvatarName } from "~/components/user/avatar-name";
import { api } from "~/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FormDots } from "./form-dots";
import { cn } from "~/lib/utils";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";

const PointsDiff = ({ playerId }: { playerId: string }) => {
  const { data } = api.season.pointsDiff.useQuery({ seasonPlayerId: playerId });

  if (!data) {
    return null;
  }
  const colorClass =
    data.diff > 0
      ? "dark:text-green-500 text-green-700"
      : data.diff < 0
      ? "text-red-600 dark:text-red-400"
      : "";
  return <div className={cn(colorClass)}>{Math.abs(data.diff)}</div>;
};

export const SeasonStanding = ({
  className,
  seasonId,
}: {
  className?: string;
  seasonId: string;
}) => {
  const { data } = api.season.getPlayers.useQuery({ seasonId });
  const { data: playerForm } = api.season.playerForm.useQuery({ seasonId });

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger>
                    <div>+/-</div>
                  </TooltipTrigger>
                  <TooltipContent>+/- points today</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((player) => (
              <TableRow key={player.id}>
                <TableCell>
                  <AvatarName name={player.name} avatarUrl={player.imageUrl} />
                </TableCell>
                <TableCell>
                  <FormDots
                    form={playerForm?.find((pf) => pf.seasonPlayerId === player.id)?.form ?? []}
                  />
                </TableCell>
                <TableCell>
                  <PointsDiff playerId={player.id} />
                </TableCell>
                <TableCell>
                  <div className="font-bold">{player.elo}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
