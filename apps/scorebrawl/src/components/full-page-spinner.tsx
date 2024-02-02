import { cn } from "@scorebrawl/ui/lib";
import { Spinner } from "@scorebrawl/ui/spinner";

export const FullPageSpinner = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <Spinner />
  </div>
);
