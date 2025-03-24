"use client";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { useQueryState } from "nuqs";

export default function SignIn() {
  const [rt] = useQueryState("rt");
  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: rt ?? undefined,
    });
  };

  return (
    <div className="flex h-screen">
      <div className="m-auto w-full">
        <Card className="mx-auto max-w-sm sm:border border-0">
          <CardHeader className="items-center">
            <Image alt="logo" src="/scorebrawl.jpg" width={200} height={200} />
          </CardHeader>
          <CardContent>
            <Button onClick={signInWithGoogle} variant="outline" className="w-full text-lg">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
