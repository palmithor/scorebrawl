import type * as React from "react";

import { cn } from "@scorebrawl/ui/lib";
import { ModeToggle } from "@scorebrawl/ui/mode-toggle";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex items-center justify-end py-10">
        <ModeToggle />
      </div>
    </footer>
  );
}
