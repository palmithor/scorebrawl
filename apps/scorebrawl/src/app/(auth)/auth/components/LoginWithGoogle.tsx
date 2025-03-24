import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useQueryState } from "nuqs";

export const LoginWithGoogle = () => {
  const [rt] = useQueryState("rt", { defaultValue: "" });
  console.log(rt);
  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: rt ?? undefined,
    });
  };
  return (
    <Button onClick={signInWithGoogle} variant="outline" className="w-full text-lg">
      Continue with Google
    </Button>
  );
};
