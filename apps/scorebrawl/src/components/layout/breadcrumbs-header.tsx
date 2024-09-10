"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import type { ReactNode } from "react";

export const BreadcrumbsHeader = ({
  breadcrumbs,
  children,
}: {
  breadcrumbs: {
    name: string;
    href?: string;
  }[];
  children?: ReactNode;
}) => (
  <header className="sticky top-0 z-30 grid grid-cols-2 grid-rows-1 min-h-[3.5rem] h-14 items-center gap-4 border-l-amber-50 bg-background py-2 px-4 truncate">
    <Breadcrumb className="flex trunctate">
      <BreadcrumbList className="flex-nowrap">
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={`item-${crumb.name}-${crumb.href}`}>
            {crumb.href ? (
              <>
                <BreadcrumbLink asChild>
                  <Link href={crumb.href} prefetch={false}>
                    {crumb.name}
                  </Link>
                </BreadcrumbLink>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </>
            ) : (
              <BreadcrumbPage className="truncate">{crumb.name}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
    <div className="ml-auto flex items-center gap-2">{children}</div>
  </header>
);
