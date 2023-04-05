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
    <main>{children}</main>
  </>
);
