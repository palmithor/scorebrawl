"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons";

export function MainNav() {
  const { pathname } = useRouter();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/leagues" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/leagues"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/leagues") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Leagues
        </Link>
      </nav>
    </div>
  );
}
