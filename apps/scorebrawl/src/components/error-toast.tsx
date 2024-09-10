"use client";
import { clearLastVisitedLeague } from "@/actions/navigationActions";
import { useToast } from "@/hooks/use-toast";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

export const ErrorToast = () => {
  const { toast } = useToast();
  const [errorCode, setErrorCode] = useQueryState("errorCode");

  useEffect(() => {
    if (errorCode) {
      if (errorCode === "LEAGUE_PERMISSION") {
        clearLastVisitedLeague().then(() => {
          toast({
            title: "Access denied",
            description: "Insufficient league permissions",
            variant: "destructive",
            duration: 2000,
          });
        });
      } else if (errorCode === "LEAGUE_NOT_FOUND") {
        clearLastVisitedLeague().then(() => {
          toast({
            title: "Something went wrong",
            description: "League not found",
            variant: "destructive",
            duration: 2000,
          });
        });
      } else if (errorCode === "INVITE_NOT_FOUND") {
        toast({
          title: "Something went wrong",
          description: "Invite not found",
          variant: "destructive",
          duration: 2000,
        });
      } else if (errorCode === "INVITE_ALREADY_CLAIMED") {
        toast({
          title: "Something went wrong",
          description: "Invite already claimed",
          duration: 2000,
        });
      } else {
        toast({
          title: "Something went wrong",
          description: `An error occurred: ${errorCode}`,
          variant: "destructive",
          duration: 2000,
        });
      }
      setErrorCode(null).then();
    }
  }, [errorCode, setErrorCode, toast]);

  return null;
};
