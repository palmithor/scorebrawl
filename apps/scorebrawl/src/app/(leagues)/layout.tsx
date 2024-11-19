import { upsertAuthenticatedUser } from "@/actions/user";
import { AppSidebar } from "@/components/app-sidebar";
import { ErrorToast } from "@/components/error-toast";
import { SiteFooter } from "@/components/layout/site-footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { findUserById } from "@scorebrawl/db/user";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const { userId } = auth();
  if (userId) {
    const user = await findUserById({ id: userId });
    if (!user) {
      await upsertAuthenticatedUser();
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar leagues={await api.league.getAll({})} />
      <SidebarInset className="h-full">
        <main className="flex-1 container relative flex flex-col">{children}</main>
        <SiteFooter />
        <ErrorToast />
      </SidebarInset>
    </SidebarProvider>
  );
}
