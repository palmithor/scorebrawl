import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export const LayoutActionButton = ({
  text,
  Icon,
  onClick,
  variant = "default",
}: { text: string; Icon?: LucideIcon; onClick?: () => void; variant?: "outline" | "default" }) => (
  <Button size={"sm"} variant={variant} onClick={onClick}>
    {Icon && <Icon className="mr-1 h-4 w-4" />}
    {text}
  </Button>
);
