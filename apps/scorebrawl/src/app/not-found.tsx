"use client";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default () => {
  const { push } = useRouter();

  toast({
    title: "Not found",
    description: "Page not found, redirecting...",
    variant: "destructive",
  });
  push("/");

  return null;
};
