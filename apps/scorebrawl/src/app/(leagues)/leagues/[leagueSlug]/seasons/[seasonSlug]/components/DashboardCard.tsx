import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  Icon: LucideIcon;
  children: ReactNode;
};

export const DashboardCard = ({ title, Icon, children }: Props) => (
  <Card>
    <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-md font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4" />
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
