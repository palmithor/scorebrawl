"use client";

import { ChartNoAxesGantt, Home, Inbox, Settings, User2, UserCog, Users } from "lucide-react";
import * as React from "react";

import { Nav } from "@/components/layout/navbar";

import { LeagueSwitcher } from "@/components/layout/league-switcher";
import { SiteFooter } from "@/components/layout/site-footer";
import { api } from "@/trpc/react";
import type { LucideIcon } from "lucide-react";

import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { cn } from "@scorebrawl/ui/lib";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@scorebrawl/ui/resizable";
import { Separator } from "@scorebrawl/ui/separator";
import { TooltipProvider } from "@scorebrawl/ui/tooltip";
import { useTheme } from "next-themes";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface MailProps {
  leagues: { id: string; slug: string; name: string; logoUrl: string | null }[];
  defaultCollapsed?: boolean;
  defaultLayout?: number[];
  children: React.ReactNode;
}
const constructLinks = ({
  leagueSlug,
  hasEditorAccess,
  activeSeasonSlug,
}: { leagueSlug: string; hasEditorAccess?: boolean; activeSeasonSlug: string }) => [
  {
    name: "Active Season",
    href: `/leagues/${leagueSlug}/seasons/${activeSeasonSlug}`,
    regex: new RegExp(`/leagues/${leagueSlug}/seasons/${activeSeasonSlug}(\\/.*)?`),
    icon: Home,
  },
  {
    name: "Seasons",
    href: `/leagues/${leagueSlug}/seasons`,
    regex: new RegExp(
      `^/leagues/${leagueSlug}/seasons(?!/${activeSeasonSlug}(\\/|$))(?:/(?!${activeSeasonSlug})[^\\s/]+.*)?$`,
    ),
    icon: ChartNoAxesGantt,
  },
  {
    name: "Players",
    href: `/leagues/${leagueSlug}/players`,
    regex: new RegExp(`^/leagues/${leagueSlug}/players`),
    icon: User2,
  },
  {
    name: "Teams",
    href: `/leagues/${leagueSlug}/teams`,
    regex: new RegExp(`^/leagues/${leagueSlug}/teams`),
    icon: Users,
  },
  // add editor access links
  ...(hasEditorAccess
    ? [
        {
          name: "Members",
          href: `/leagues/${leagueSlug}/members`,
          regex: new RegExp(`^/leagues/${leagueSlug}/members`),
          icon: UserCog,
        },
        {
          name: "Invites",
          href: `/leagues/${leagueSlug}/invites`,
          regex: new RegExp(`^/leagues/${leagueSlug}/invites`),
          icon: Inbox,
        },
        {
          name: "Settings",
          href: `/leagues/${leagueSlug}/settings`,
          regex: new RegExp(`^/leagues/${leagueSlug}/settings`),
          icon: Settings,
        },
      ]
    : []),
];

export function NavLayout({
  leagues,
  defaultCollapsed = false,
  defaultLayout = [20, 80],
  children,
}: MailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();
  const themeInUse = theme === "system" ? systemTheme : theme;
  const params = useParams<{ leagueSlug: string }>();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [links, setLinks] = React.useState<
    { name: string; href: string; regex: RegExp; icon: LucideIcon }[]
  >([]);
  const selectedLeague = leagues.find((league) => league.slug === params.leagueSlug) ?? leagues[0];
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery(
    { leagueSlug: selectedLeague?.slug as string },
    { enabled: !!selectedLeague?.slug },
  );
  const { data: activeSeason } = api.season.findActive.useQuery({ leagueSlug: params.leagueSlug });
  useEffect(() => {
    setLinks(
      constructLinks({
        leagueSlug: params.leagueSlug,
        hasEditorAccess,
        activeSeasonSlug: activeSeason?.slug ?? "",
      }),
    );
  }, [activeSeason, hasEditorAccess, params.leagueSlug]);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
        }}
        className="min-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={4}
          collapsible={true}
          minSize={10}
          maxSize={16}
          onExpand={() => {
            setIsCollapsed(false);
            document.cookie = "react-resizable-panels:collapsed=false";
          }}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = "react-resizable-panels:collapsed=true";
          }}
          className={cn(
            "grid grid-cols-1 grid-rows-[auto_auto_1fr] min-h-screen max-h-screen",
            isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2",
            )}
          >
            <LeagueSwitcher
              isCollapsed={isCollapsed}
              leagues={leagues}
              onLeagueSelect={(value) => router.push(`/leagues/${value}`)}
              selectedLeague={selectedLeague}
            />
          </div>
          <Separator />
          <div className="flex flex-col justify-between">
            <Nav
              leagueSlug={selectedLeague?.slug ?? ""}
              isCollapsed={isCollapsed}
              links={links.map((link) => ({
                title: link.name,
                icon: link.icon,
                variant: link.regex.test(pathname) ? "default" : "ghost",
                href: link.href,
              }))}
            />
            <div className="flex p-3">
              <UserButton appearance={{ baseTheme: themeInUse === "dark" ? dark : undefined }} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]}>
          <div className="flex min-h-screen flex-col h-screen overflow-auto">
            <main className="flex-1 container relative flex flex-col">{children}</main>
            <SiteFooter />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
