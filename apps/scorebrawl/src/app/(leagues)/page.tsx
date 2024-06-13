import { getAll, getMine } from "@/actions/league";
import { LeagueList } from "@/components/league/league-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leagues",
};

type PageProps = {
  searchParams: {
    filter?: string;
    page?: number;
    search?: string;
  };
};

export default async function LeagueListPage({ searchParams }: PageProps) {
  const response =
    searchParams.filter === "all"
      ? await getAll(searchParams.search, searchParams.page ?? 0)
      : await getMine(searchParams.search, searchParams.page ?? 0);
  return <LeagueList data={response.data} />;
}
