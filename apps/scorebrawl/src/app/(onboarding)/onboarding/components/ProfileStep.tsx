"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { getInitialsFromString } from "@scorebrawl/utils/string";
import { type ChangeEvent, useCallback, useRef, useState } from "react";

export const ProfileStep = () => {
  const { user } = useUser();
  const [first, setFirst] = useState(user?.firstName ?? "");
  const [last, setLast] = useState(user?.lastName ?? "");
  const timerRef = useRef<null | Timer>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClickProfile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({ title: "Uploading profile image" });
      await user?.setProfileImage({ file });
    }
  };

  const debouncedUpdate = useCallback(
    ({ firstName, lastName }: { firstName: string; lastName: string }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(async () => {
        if (user) {
          await user.update({ firstName, lastName });
          toast({ title: "Updated profile" });
        }
      }, 300);
    },
    [user, toast],
  );

  return (
    <>
      <CardHeader>
        <CardTitle>Who are you?</CardTitle>
        <CardDescription>Customize your profile</CardDescription>
      </CardHeader>
      <CardContent className={"flex flex-col items-center gap-3"}>
        <Input
          ref={fileInputRef}
          id="picture"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Avatar className={"h-32 w-32"} onClick={onClickProfile}>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{getInitialsFromString(`${first} ${last}`)}</AvatarFallback>
        </Avatar>
        <div className="w-full max-w-sm  md:max-w-2xl xl:max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <Label htmlFor="firstName">First name</Label>
              <Input
                type="text"
                id="firstName"
                value={first}
                onChange={(e) => {
                  const updatedFirstName = e.target.value;
                  setFirst(updatedFirstName);
                  debouncedUpdate({ firstName: updatedFirstName, lastName: last });
                }}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                value={last}
                onChange={(e) => {
                  const updatedLastName = e.target.value;
                  setLast(updatedLastName);
                  debouncedUpdate({ lastName: updatedLastName, firstName: first });
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};
