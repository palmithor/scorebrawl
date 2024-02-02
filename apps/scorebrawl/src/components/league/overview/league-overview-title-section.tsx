import { Title } from "@/components/title";

export const LeagueOverviewTitleSection = ({
  title,
  children,
}: { title: string; children: React.ReactNode }) => (
  <div className="grid gap-2">
    <Title titleClassName="text-lg" title={title} />
    {children}
  </div>
);
