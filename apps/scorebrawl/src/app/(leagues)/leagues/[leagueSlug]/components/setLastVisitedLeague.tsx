"use client";
import { resetLastVisitedLeague } from "@/actions/navigationActions";
import { useEffect } from "react";

export const SetLastVisitedLeague = ({ leagueSlug }: { leagueSlug: string }) => {
  useEffect(() => {
    resetLastVisitedLeague({ leagueSlug });
  }, [leagueSlug]);

  return null;
};
