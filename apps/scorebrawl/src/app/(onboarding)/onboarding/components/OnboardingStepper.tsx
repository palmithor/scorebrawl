"use client";
import { GetStartedStep } from "@/app/(onboarding)/onboarding/components/GetStartedStep";
import { ProfileStep } from "@/app/(onboarding)/onboarding/components/ProfileStep";
import { WelcomeStep } from "@/app/(onboarding)/onboarding/components/WelcomeStep";
import { Card } from "@scorebrawl/ui/card";
import { Step, type StepItem, Stepper } from "@scorebrawl/ui/stepper";
import type { ReactNode } from "react";
import { Footer } from "./Footer";

const steps = [
  { label: "Welcome", component: <WelcomeStep /> },
  { label: "Profile", component: <ProfileStep /> },
  { label: "Get Started", component: <GetStartedStep /> },
] satisfies (StepItem & { component: ReactNode })[];

export const OnboardingStepper = () => {
  return (
    <Stepper initialStep={0} steps={steps}>
      {steps.map(({ label, component }, _index) => {
        return (
          <Step key={label} label={label}>
            <Card>{component}</Card>
          </Step>
        );
      })}
      <Footer />
    </Stepper>
  );
};
