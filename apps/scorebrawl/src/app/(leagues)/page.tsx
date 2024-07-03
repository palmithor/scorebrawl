import { LeagueList } from "@/components/league/league-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leagues",
};
export default async function LeagueListPage() {
  return <LeagueList />;
}
