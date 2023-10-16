import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
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
    avatars: { id: string; name: string; imageUrl: string }[];
  }[];
  renderPointDiff: (id: string) => ReactNode | null;
  renderForm: (id: string) => ReactNode | null;
}) => {
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
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="relative">
                      <MultiAvatar users={item.avatars} visibleCount={5} />
                    </div>
                    <div className="ml-4">
                      <h2 className={"text-sm"}>{item.name}</h2>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <TableCell>{renderForm(item.id)}</TableCell>
                </TableCell>
                <TableCell>{renderPointDiff(item.id)}</TableCell>
                <TableCell>
                  <div className="font-bold">{item.elo}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
