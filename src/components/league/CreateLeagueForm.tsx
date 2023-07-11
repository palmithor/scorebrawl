"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { LoadingButton } from "~/components/ui/loading-button";
import { api } from "~/lib/api";
import { useRouter } from "next/router";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

// todo move the schemas to lib and reuse
const leagueFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  logoUrl: z.string().url(),
  visibility: z.enum(["public", "private"]).default("public"),
});

type LeagueFormValues = z.infer<typeof leagueFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<LeagueFormValues> = {
  // name: "Your name",
  // logoUrl: ""
};

export const CreateLeagueForm = () => {
  const { isLoading, mutateAsync } = api.league.create.useMutation();
  const router = useRouter();

  const form = useForm<LeagueFormValues>({
    resolver: zodResolver(leagueFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: LeagueFormValues) => {
    const result = await mutateAsync(data);
    if (result) {
      await router.push("/leagues");
    }
  };

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="League name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <Input placeholder="Logo url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Private</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue="public"
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="public" />
                    </FormControl>
                    <FormLabel className="font-normal">Public</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="private" />
                    </FormControl>
                    <FormLabel className="font-normal">Private</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isLoading} type="submit">
          Create League
        </LoadingButton>
      </form>
    </Form>
  );
};
