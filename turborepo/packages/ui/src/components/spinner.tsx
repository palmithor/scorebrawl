import { Loader2 } from "lucide-react";

const Icons = {
  spinner: Loader2,
};

export const Spinner = ({ size }: { size?: string }) => (
  <Icons.spinner size={size} className="animate-spin" />
);
