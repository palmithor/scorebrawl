"use client";
import { useToast } from "@scorebrawl/ui/use-toast";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

export const ErrorToast = () => {
  const { toast } = useToast();
  const [errorCode, setErrorCode] = useQueryState("errorCode");

  useEffect(() => {
    if (errorCode) {
      toast({
        title: "Something went wrong",
        description: `An error occurred: ${errorCode}`,
        variant: "destructive",
        duration: 2000,
      });
      setErrorCode(null).then();
    }
  }, [errorCode, setErrorCode, toast]);

  return null;
};
