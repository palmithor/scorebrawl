"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { api } from "@/trpc/react";
import { sortSeasons } from "@/utils/seasonUtils";
import { buttonVariants } from "@scorebrawl/ui/button";
import { cn } from "@scorebrawl/ui/lib";
import { Tooltip, TooltipContent, TooltipTrigger } from "@scorebrawl/ui/tooltip";

interface NavProps {
  isCollapsed: boolean;
  leagueSlug: string;
  links: {
    title: string;
    href: string;
    label?: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
  }[];
}

export const Nav = ({ leagueSlug, links, isCollapsed }: NavProps) => {
  const { data } = api.season.getAll.useQuery({ leagueSlug });
  // todo create collapsible seasons menu
  const _sortedSeasons = data ? sortSeasons(data) : [];

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link) =>
          isCollapsed ? (
            <Tooltip key={`tooltip-link-${link.title}`} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: link.variant, size: "icon" }),
                    "h-9 w-9",
                    link.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && <span className="ml-auto text-muted-foreground">{link.label}</span>}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={`link-${link.title}`}
              href={link.href}
              className={cn(
                buttonVariants({ variant: link.variant, size: "sm" }),
                link.variant === "default" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start",
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" && "text-background dark:text-white",
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
};
