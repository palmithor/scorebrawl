"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import * as React from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { MainNavItem } from "@/components/layout/types";
import { siteConfig } from "@/config/site";
import { fontHeading } from "@scorebrawl/ui/fonts";
import { Icons } from "@scorebrawl/ui/icons";
import { cn } from "@scorebrawl/ui/lib";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
}

export function MainNav({ items, children }: MainNavProps) {
  const segment = useSelectedLayoutSegment();
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  React.useEffect(() => {
    const closeMobileMenuOnClickOutside = () => {
      if (showMobileMenu) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("click", closeMobileMenuOnClickOutside);

    return () => {
      document.removeEventListener("click", closeMobileMenuOnClickOutside);
    };
  }, [showMobileMenu]);

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <Icons.logo />
        <span className={cn("hidden text-lg font-bold sm:inline-block", fontHeading.className)}>
          {siteConfig.name}
        </span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item) => (
            <Link
              key={item.title}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                item.href.startsWith(`/${segment}`) ? "text-foreground" : "text-foreground/60",
                item.disabled && "cursor-not-allowed opacity-80",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <button
        type="button"
        className="flex items-center space-x-2 md:hidden"
        onClick={toggleMobileMenu}
      >
        {showMobileMenu ? <Icons.close /> : <Icons.logo />}
      </button>
      {showMobileMenu && items && <MobileNav items={items}>{children}</MobileNav>}
    </div>
  );
}
