import { Separator } from "~/components/ui/separator";
import { CreateLeagueForm } from "~/components/league/CreateLeagueForm";
import { type ReactNode } from "react";

export const FormLayout = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <div className="space-y-6 p-10 pb-16 md:block">
    <div className="space-y-0.5">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
    </div>
    <Separator className="my-6" />
    {children}
  </div>
);
