import type { ReactNode } from "react";

export const CardContentText = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-medium text-gray-800 dark:text-white">{children}</p>
);
