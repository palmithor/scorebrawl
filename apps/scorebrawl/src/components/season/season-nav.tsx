import {
  Badge,
  Button,
  ScrollArea,
  ScrollBar,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";

type NavProps = React.HTMLAttributes<HTMLDivElement>;
export type NavLink = "players" | "teams" | "matches";

export const SeasonNav = ({ className, ...props }: NavProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const leagueSlug = useLeagueSlug();
  const seasonId = router.query.seasonId as string;
  const leagueHref = `/leagues/${encodeURIComponent(leagueSlug)}`;
  const seasonHref = `${leagueHref}/seasons/${seasonId}`;

  const links: { type: NavLink; name: string; href: string }[] = [
    {
      type: "players",
      name: "Player Standing",
      href: `${seasonHref}/players`,
    },
    { type: "teams", name: "Team Standing", href: `${seasonHref}/teams` },
    { type: "matches", name: "Matches", href: `${seasonHref}/matches` },
  ];

  const isActive = (type: NavLink) => pathname?.endsWith(type);

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("flex h-10 items-center", className)} {...props}>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" className="mr-1" onClick={() => void router.push(leagueHref)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to league</TooltipContent>
          </Tooltip>
          {links.map((link) => (
            <Link href={link.href} key={link.href} className={cn("cursor-pointer pr-1")}>
              <Badge variant={isActive(link.type) ? "default" : "outline"}>{link.name}</Badge>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};
