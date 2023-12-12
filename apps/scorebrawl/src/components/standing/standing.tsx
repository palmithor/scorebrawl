import { TooltipTrigger } from "@radix-ui/react-tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
} from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { type ReactNode } from "react";
import { MultiAvatar } from "~/components/user/multi-avatar";

export const Standing = ({
  className,
  items,
  renderPointDiff,
  renderForm,
}: {
  className?: string;
  items: {
    id: string;
    name: string;
    elo: number;
    matchCount: number;
    avatars: { id: string; name: string; imageUrl: string }[];
  }[];
  renderPointDiff: (id: string) => ReactNode | null;
  renderForm: (id: string) => ReactNode | null;
}) => {
  const sortedItems = items.sort((a, b) => {
    // Objects with matchCount=0 are moved to the end
    if (a.matchCount === 0 && b.matchCount !== 0) {
      return 1; // a should come after b
    }
    if (a.matchCount !== 0 && b.matchCount === 0) {
      return -1; // a should come before b
    }
    return b.elo - a.elo; // Sort by elo in ascending order
  });
  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Matches</TableHead>
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
            {sortedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="relative">
                      <MultiAvatar users={item.avatars} visibleCount={5} />
                    </div>
                    <div className="ml-4">
                      <h2
                        className={cn("text-sm", item.matchCount === 0 && "text-muted-foreground")}
                      >
                        {item.name}
                      </h2>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={cn(item.matchCount === 0 ? "text-muted-foreground" : "font-bold")}
                  >
                    {item.matchCount}
                  </div>
                </TableCell>
                <TableCell>
                  <TableCell>{renderForm(item.id)}</TableCell>
                </TableCell>
                <TableCell>{renderPointDiff(item.id)}</TableCell>
                <TableCell>
                  <div className="font-bold">{item.matchCount < 1 ? "" : item.elo}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
