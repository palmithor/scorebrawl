"use client";

import { type NextPage } from "next";
import { useRouter } from "next/router";
import { type ChangeEvent, useState } from "react";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AvatarName } from "~/components/user/avatar-name";
import { MultiAvatar } from "~/components/user/multi-avatar";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/use-toast";
import { TOAST_ERROR_PARAM } from "~/lib/url";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

const PlayersCell = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data } = api.league.getPlayers.useQuery({ leagueSlug });
  if (!data) {
    return (
      <div className="flex -space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return <MultiAvatar users={data} visibleCount={4} />;
};

const Leagues: NextPage = () => {
  const router = useRouter();
  const { data: allLeagues, isLoading: isLoadingAll } = api.league.getAll.useQuery({
    pageQuery: {},
  });
  const [selectedFilter, setSelectedFilter] = useState<"mine" | "all">("mine");
  const { data: myLeagues, isLoading: isLoadingMine } = api.league.getMine.useQuery({
    pageQuery: {},
  });
  const [filterText, setFilterText] = useState("");
  const { toast } = useToast();
  const [hasShownError, setHasShownError] = useState(false);

  if (isLoadingAll || isLoadingMine) {
    return (
      <div className="grid h-screen place-items-center bg-background">
        <Spinner size="40" />
      </div>
    );
  }

  const filteredData = (selectedFilter === "mine" ? myLeagues : allLeagues)?.data.filter((item) =>
    item.name.toLowerCase().includes(filterText.toLowerCase()),
  );

  if (!hasShownError && router.query[TOAST_ERROR_PARAM]) {
    toast({
      title: "An error occurred",
      description: router.query[TOAST_ERROR_PARAM],
      variant: "destructive",
      duration: 2000,
    });
    setHasShownError(true);
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Filter leagues..."
          className="max-w-sm"
          value={filterText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
        />
        <div className="grow">
          <Select onValueChange={(value: "mine" | "all") => setSelectedFilter(value)}>
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
        <Button className=" text-clip" onClick={() => void router.push("/leagues/create")}>
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
            {filteredData?.map((league) => (
              <TableRow
                key={league.id}
                className="cursor-pointer"
                onClick={() => {
                  void router.push(`/leagues/${league.slug}`);
                }}
              >
                <TableCell>
                  <AvatarName name={league.name} avatarUrl={league.logoUrl || ""}></AvatarName>
                </TableCell>
                <TableCell>
                  <PlayersCell leagueSlug={league.slug} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Leagues;
