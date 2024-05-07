// @ts-ignore
import tailwindConfig from "@scorebrawl/style-config/tailwind.config.js";
import { useWindowDimensions } from "@scorebrawl/ui/hooks";
import resolveConfig from "tailwindcss/resolveConfig";

export const useBreakpoint = (): "xs" | "sm" | "md" | "lg" | "xl" | "2xl" => {
  const { width } = useWindowDimensions();

  const fullConfig = resolveConfig(tailwindConfig);

  if (width < Number.parseInt(fullConfig.theme.screens.sm)) {
    return "xs";
  }

  if (width < Number.parseInt(fullConfig.theme.screens.md)) {
    return "sm";
  }

  if (width < Number.parseInt(fullConfig.theme.screens.lg)) {
    return "md";
  }

  if (width < Number.parseInt(fullConfig.theme.screens.xl)) {
    return "lg";
  }

  if (width < Number.parseInt(fullConfig.theme.screens["2xl"])) {
    return "xl";
  }

  return "2xl";
};
