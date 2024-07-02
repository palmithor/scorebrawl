import { getAll } from "@/actions/league";
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
  const response = await getAll(searchParams.search, searchParams.page ?? 0);
  return <LeagueList data={response.data} />;
}
