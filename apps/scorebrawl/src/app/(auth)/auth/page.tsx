"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Suspense } from "react";
import { LoginWithGoogle } from "./components/LoginWithGoogle";

export default function SignIn() {
  return (
    <div className="flex h-screen">
      <div className="m-auto w-full">
        <Card className="mx-auto max-w-sm sm:border border-0">
          <CardHeader className="items-center">
            <Image alt="logo" src="/scorebrawl.jpg" width={200} height={200} />
          </CardHeader>
          <CardContent>
            <Suspense>
              <LoginWithGoogle />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
