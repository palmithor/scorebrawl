"use client";
import { toast } from "@scorebrawl/ui/use-toast";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";

export const ToastMessageNoOngoing = ({ leagueSlug }: { leagueSlug: string }) => {
  const [message] = useQueryState("message");
  const { replace } = useRouter();
  if (message === "no-active") {
    toast({ title: "No active season", description: "Please create one" });
    replace(`/leagues/${leagueSlug}/seasons/create`);
  }
  return null;
};
