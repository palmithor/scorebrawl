import { type MainNavItem, type SidebarNavItem } from "~/types/nav";

interface MobileNavConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const mobileNavConfig: MobileNavConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Leagues",
      href: "/leagues",
    },
  ],
  sidebarNav: [],
};
