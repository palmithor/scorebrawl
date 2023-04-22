import { Navbar, type NavbarTab } from "~/components/layout/navbar";
import { type ReactNode } from "react";

export const MainLayout = ({
  children,
  currentTab,
}: {
  children: ReactNode;
  currentTab: NavbarTab;
}) => (
  <>
    <Navbar currentTab={currentTab} />
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <main>{children}</main>
    </div>
  </>
);
