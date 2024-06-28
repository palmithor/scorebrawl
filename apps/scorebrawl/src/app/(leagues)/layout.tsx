import { getAuthenticatedUser, upsertAuthenticatedUser } from "@/actions/user";
import { ErrorToast } from "@/components/error-toast";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { navConfig } from "@/config/nav";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs";
import type { ReactNode } from "react";

export default async function LeaguesLayout({ children }: { children: ReactNode }) {
  const { userId } = auth();
  const user = await getAuthenticatedUser();
  if (!user) {
    await upsertAuthenticatedUser();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar userId={userId} items={navConfig.mainNav} />
      <main className="flex-1 container relative">{children}</main>
      <SiteFooter />
      <ErrorToast />
    </div>
  );
}
