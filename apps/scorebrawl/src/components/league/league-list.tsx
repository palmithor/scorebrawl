"use client";

import { LeaguePlayerMultiAvatar } from "@/components/user/league-player-multi-avatar";
import { AvatarName } from "@scorebrawl/ui/avatar-name";
import { Button } from "@scorebrawl/ui/button";
import { Input } from "@scorebrawl/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import type { ChangeEvent } from "react";

export const LeagueList = ({
  data,
}: {
  data: { id: string; slug: string; name: string; logoUrl: string | null }[];
}) => {
  const { push } = useRouter();
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      shallow: false,
      throttleMs: 500,
    }),
  );

  return (
    <div className="w-full">
      <div className="flex gap-4 py-4 justify-between">
        <Input
          placeholder="Filter leagues..."
          className="w-96"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <Button size="sm" className="text-clip justify-end" onClick={() => push("/leagues/create")}>
          Create League
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Players</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((league) => (
              <TableRow
                key={league.id}
                className="cursor-pointer"
                onClick={() => {
                  push(`/leagues/${league.slug}`);
                }}
              >
                <TableCell>
                  <AvatarName name={league.name} avatarUrl={league.logoUrl || ""} />
                </TableCell>
                <TableCell>
                  <LeaguePlayerMultiAvatar leagueSlug={league.slug} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
