import { Card, CardContent, CardHeader, CardTitle } from "@scorebrawl/ui/card";
import type { ReactNode } from "react";

export const OverviewCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle> {title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
