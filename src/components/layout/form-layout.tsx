import { Separator } from "~/components/ui/separator";
import { type ReactNode } from "react";
import { Title } from "../title";

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
      <Title title={title} subtitle={subtitle} />
    </div>
    <Separator className="my-6" />
    {children}
  </div>
);
