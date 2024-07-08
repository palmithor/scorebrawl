"use client";
import { CreatedByCell } from "@/app/(leagues)/leagues/[leagueSlug]/invites/components/CreatedByCell";
import { api } from "@/trpc/react";
import { Button } from "@scorebrawl/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { toast } from "@scorebrawl/ui/use-toast";
import { capitalize } from "@scorebrawl/utils/string";
import { Copy } from "lucide-react";

export const InviteTable = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data: invites = [] } = api.invite.getAll.useQuery({ leagueSlug });
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={"text-xs"}>
          {invites.map((invite) => {
            const isExpired = invite.expiresAt !== null && invite.expiresAt < new Date();
            const className = isExpired ? "text-muted-foreground" : "";
            return (
              <TableRow key={invite.id}>
                <TableCell className={className}>{capitalize(invite.role)}</TableCell>
                <TableCell className={className}>
                  {invite.createdAt.toLocaleDateString(window.navigator.language)}
                </TableCell>
                <TableCell className={className}>
                  <CreatedByCell userId={invite.createdBy} />
                </TableCell>
                <TableCell className={className}>
                  {invite.expiresAt?.toLocaleDateString(window.navigator.language)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void navigator.clipboard
                        .writeText(
                          `${window.location.origin.toString()}/leagues/auto-join/${invite.code}`,
                        )
                        .then(() =>
                          toast({
                            description: "Auto join link copied",
                          }),
                        )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
