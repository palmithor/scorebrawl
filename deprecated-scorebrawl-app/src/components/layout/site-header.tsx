import { UserButton } from "@clerk/nextjs";
import { MainNav } from "~/components/layout/main-nav";
import { MobileNav } from "~/components/layout/mobile-nav";
import { ModeToggle } from "~/components/mode-toggle";

export function SiteHeader() {
  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <ModeToggle />
            <UserButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
