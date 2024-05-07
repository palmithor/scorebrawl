"use client";

import { LeaguePlayerMultiAvatar } from "@/components/user/league-player-multi-avatar";
import { AvatarName } from "@scorebrawl/ui/avatar-name";
import { Button } from "@scorebrawl/ui/button";
import { Input } from "@scorebrawl/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@scorebrawl/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { useRouter } from "next/navigation";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { type ChangeEvent, useTransition } from "react";

export const LeagueList = ({
  data,
}: {
  data: { id: string; slug: string; name: string; logoUrl: string | null }[];
}) => {
  const [_, startTransition] = useTransition();
  const { push, refresh } = useRouter();
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      shallow: false,
      throttleMs: 500,
    }),
  );
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringEnum(["mine", "all"]).withDefault("mine").withOptions({
      startTransition,
    }),
  );

  return (
    <div className="w-full">
      <div className="grid grid-flow-row-dense grid-cols-2 grid-rows-2 items-center gap-2 py-4 sm:grid-cols-3 sm:grid-rows-1">
        <Input
          placeholder="Filter leagues..."
          className="order-2 col-span-2 w-auto sm:order-1 sm:col-span-1"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <div className="order-1 grow">
          <Select
            value={filter}
            onValueChange={(value: "mine" | "all") => setFilter(value).then(() => refresh())}
          >
            <SelectTrigger defaultValue="mine" className="w-[180px]">
              <SelectValue placeholder="My leagues" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="mine">My leagues</SelectItem>
                <SelectItem value="all">All Leagues</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="order-1 flex justify-end">
          <Button size="sm" className="text-clip" onClick={() => push("/leagues/create")}>
            Create League
          </Button>
        </div>
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
