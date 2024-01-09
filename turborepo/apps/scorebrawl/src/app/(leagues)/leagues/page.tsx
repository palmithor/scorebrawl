import { getAll, getMine } from "@/actions/league";
import { LeagueList } from "@/app/(leagues)/leagues/league-list";
import { Metadata } from "next";

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
      ? await getAll({ search: searchParams.search, page: searchParams.page ?? 0 })
      : await getMine({ search: searchParams.search, page: searchParams.page ?? 0 });

  return <LeagueList data={response.data} />;
}
