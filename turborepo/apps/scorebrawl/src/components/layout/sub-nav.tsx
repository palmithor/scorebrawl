"use client";

import { cn } from "@scorebrawl/ui/lib";
import { ScrollArea, ScrollBar } from "@scorebrawl/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SubNavProps = React.HTMLAttributes<HTMLDivElement> & {
  links: { name: string; href: string }[];
};

export function SubNav({ links, children, className, ...props }: SubNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4 py-2">
      <ScrollArea className="grow lg:max-w-none">
        <div className={cn("flex items-center", className)} {...props}>
          {links.map((link, index) => (
            <Link
              href={link.href}
              key={link.href}
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                pathname?.startsWith(link.href) || (index === 0 && pathname === "/")
                  ? "bg-muted font-medium text-primary"
                  : "text-muted-foreground",
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
      <div className="flex">{children}</div>
    </div>
  );
}
