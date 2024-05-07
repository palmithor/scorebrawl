import { Title } from "@/components/title";
import { cn } from "@scorebrawl/ui/lib";
import type { ReactNode } from "react";

export const LeagueOverviewTitleSection = ({
  title,
  className,
  children,
}: { title: string; className?: string; children: ReactNode }) => (
  <div className={cn("grid gap-2", className)}>
    <Title titleClassName="text-lg" title={title} />
    {children}
  </div>
);
