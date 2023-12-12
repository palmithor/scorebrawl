"use client";

import { SelectValue } from "@radix-ui/react-select";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "@repo/ui/components";
import { type NextPage } from "next";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import { type ChangeEvent, useEffect, useState } from "react";
import { Spinner } from "~/components/spinner";
import { AvatarName } from "~/components/user/avatar-name";
import { MultiAvatar } from "~/components/user/multi-avatar";
import { api } from "~/lib/api";
import { TOAST_ERROR_PARAM } from "~/lib/url";

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
  useEffect(() => {
    if (!["mine", "all"].includes(router.query.filter as string)) {
      void Router.push({ query: { ...router.query, filter: "mine" } }, undefined, {
        shallow: true,
      });
    }
  }, [router.query]);

  const selectedFilter = (router.query.filter as "mine" | "all" | undefined) ?? "mine";
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
      <Head>
        <title>Scorebrawl - Leagues</title>
      </Head>
      <div className="grid grid-flow-row-dense grid-cols-2 grid-rows-2 items-center gap-2 py-4 sm:grid-cols-3 sm:grid-rows-1">
        <Input
          placeholder="Filter leagues..."
          className="order-2 col-span-2 w-auto sm:order-1 sm:col-span-1"
          value={filterText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
        />
        <div className="order-1 grow">
          <Select
            value={selectedFilter}
            onValueChange={(value: "mine" | "all") =>
              void router.push({ query: { ...router.query, filter: value } }, undefined, {
                shallow: true,
              })
            }
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
          <Button
            size="sm"
            className="text-clip"
            onClick={() => void router.push("/leagues/create")}
          >
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
            {filteredData?.map((league) => (
              <TableRow
                key={league.id}
                className="cursor-pointer"
                onClick={() => {
                  void router.push(`/leagues/${league.slug}`);
                }}
              >
                <TableCell>
                  <AvatarName name={league.name} avatarUrl={league.logoUrl || ""} />
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
