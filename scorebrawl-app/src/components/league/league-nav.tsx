import Link from "next/link";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { useLeagueNav } from "~/hooks/useLeagueNav";
import { cn } from "~/lib/utils";

type NavProps = React.HTMLAttributes<HTMLDivElement>;

export const LeagueNav = ({ className, children, ...props }: NavProps) => {
  const { links, isActive } = useLeagueNav();
  return (
    <div className="flex items-center gap-4 py-2">
      <ScrollArea className="grow lg:max-w-none">
        <div className={cn("flex h-10 items-center", className)} {...props}>
          {links.map((link) => (
            <Link href={link.href} key={link.href} className={cn("cursor-pointer pr-1")}>
              <Badge variant={isActive(link.type) ? "default" : "outline"}>{link.name}</Badge>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
      <div className="flex">{children}</div>
    </div>
  );
};
