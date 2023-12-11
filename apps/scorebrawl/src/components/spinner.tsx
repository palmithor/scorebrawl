import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

const Icons = {
  spinner: Loader2,
};

export const Spinner = ({ size }: { size?: string }) => (
  <Icons.spinner size={size} className={cn("animate-spin")} />
);
