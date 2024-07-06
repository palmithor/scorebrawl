"use client";
import type { LeagueMember } from "@scorebrawl/db/types";
import { AvatarName } from "@scorebrawl/ui/avatar-name";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { capitalize } from "@scorebrawl/utils/string";

export const LeagueMemberTable = ({ members }: { members: LeagueMember[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader className="text-xs">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className={"text-sm"}>
        {members.map((member) => (
          <TableRow key={member.memberId}>
            <TableCell>
              <AvatarName
                textClassName="text-sm"
                avatarClassName={"h-8 w-8"}
                name={member.name}
                imageUrl={member.imageUrl}
              />
            </TableCell>
            <TableCell>{capitalize(member.role)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
