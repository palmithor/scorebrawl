import { Spinner } from "~/components/spinner";
import * as React from "react";
import { cn } from "~/lib/utils";

export const FullPageSpinner = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <Spinner />
  </div>
);
