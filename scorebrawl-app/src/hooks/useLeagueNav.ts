import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { usePathname } from "next/navigation";

export type NavLink = "overview" | "seasons" | "players" | "statistics" | "feed";

export const useLeagueNav = () => {
  const pathname = usePathname();
  const leagueSlug = useLeagueSlug();
  const leagueHref = `/leagues/${encodeURIComponent(leagueSlug)}`;
  const links: { type: NavLink; name: string; href: string }[] = [
    {
      type: "overview",
      name: "Overview",
      href: `${leagueHref}/overview`,
    },
    { type: "seasons", name: "Seasons", href: `${leagueHref}/seasons` },
    { type: "players", name: "Players", href: `${leagueHref}/players` },
  ];

  return { links, isActive: (type: NavLink) => pathname?.endsWith(type) };
};
