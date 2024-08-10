"use client";
import { Button } from "@scorebrawl/ui/button";
import { Separator } from "@scorebrawl/ui/separator";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Title } from "../title";

export const TitleLayout = ({
  title,
  backLink,
  subtitle,
  children,
}: {
  title: string;
  backLink?: string;
  subtitle?: string;
  children: ReactNode;
}) => {
  const { push } = useRouter();
  return (
    <div className="container pt-4">
      <div className="space-y-0.5 flex items-center">
        {backLink && (
          <Button className="mr-2" variant="ghost" size="sm" onClick={() => void push(backLink)}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        )}
        <Title title={title} subtitle={subtitle} />
      </div>
      <Separator className="my-6" />
      {children}
    </div>
  );
};
