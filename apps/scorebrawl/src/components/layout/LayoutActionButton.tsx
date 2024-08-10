import { Button } from "@scorebrawl/ui/button";
import type { LucideIcon } from "lucide-react";

export const LayoutActionButton = ({
  text,
  Icon,
  onClick,
}: { text: string; Icon?: LucideIcon; onClick?: () => void }) => (
  <Button size={"sm"} variant="outline" onClick={onClick}>
    {Icon && <Icon className="mr-1 h-4 w-4" />}
    {text}
  </Button>
);
