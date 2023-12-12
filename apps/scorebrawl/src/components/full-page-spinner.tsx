import { cn } from "@repo/ui/lib";
import * as React from "react";
import { Spinner } from "~/components/spinner";

export const FullPageSpinner = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <Spinner />
  </div>
);
