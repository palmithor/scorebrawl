"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SubNavProps = {
  seasonName?: string;
  children: ReactNode;
};

export const SubNav = ({ seasonName, children }: SubNavProps) => (
  <div className="flex items-center sm:gap-4 py-2 sticky top-0 bg-background/80 backdrop-blur-md z-20 justify-between">
    <h1 className={cn("text-xl font-bold tracking-tight")}>
      {seasonName ?? "No season for league"}
    </h1>
    <div className="flex">{children}</div>
  </div>
);
