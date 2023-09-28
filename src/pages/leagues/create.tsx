"use client";
import * as React from "react";
import { useRouter } from "next/router";
import { TitleLayout } from "~/components/layout/title-layout";
import AutoForm from "~/components/ui/auto-form";
import { LoadingButton } from "~/components/ui/loading-button";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/lib/api";
import { create } from "~/server/api/league/league.schema";
import { UploadButton } from "~/components/uploadthing";
import Image from "next/image";

const DEFAULT_LOGO = "https://utfs.io/f/c5562abd-47aa-46de-b6a9-936b4cef1875_mascot.png";

const LeagueForm = () => {
  const router = useRouter();
  const [uploadError, setUploadError] = React.useState<string | undefined>();
  const [logo, setLogo] = React.useState<string>(DEFAULT_LOGO);
  const { isLoading, mutate } = api.league.create.useMutation();
  const { toast } = useToast();
  return (
    <TitleLayout title={"Create League"}>
      <div className="grid grid-rows-2 gap-8 sm:grid-cols-2">
        <AutoForm
          formSchema={create.omit({ logoUrl: true })}
          fieldConfig={{ visibility: { fieldType: "radio" } }}
          onSubmit={(val) =>
            mutate(
              { ...val, logoUrl: logo },
              {
                onSuccess: (result) => void router.push(`/leagues/${result?.slug || ""}`),
                onError: (err) =>
                  toast({
                    title: "Error creating season",
                    description: err.message,
                  }),
              },
            )
          }
        >
          <LoadingButton loading={isLoading} type="submit">
            Create League
          </LoadingButton>
        </AutoForm>
        <div className="flex h-full w-full flex-col items-center justify-start gap-4 sm:justify-end">
          <Image width={160} height={160} src={logo} alt="logo" />
          <UploadButton
            className="ut-button:h-10 ut-button:items-center ut-button:justify-center ut-button:rounded-md ut-button:bg-primary ut-button:px-4 ut-button:py-2 ut-button:text-sm ut-button:font-medium ut-button:text-primary-foreground ut-button:ring-offset-background ut-button:transition-colors ut-button:hover:bg-primary/90 ut-button:focus-visible:outline-none ut-button:focus-visible:ring-2 ut-button:focus-visible:ring-ring ut-button:focus-visible:ring-offset-2 ut-button:disabled:pointer-events-none ut-button:disabled:opacity-50"
            endpoint="leagueLogo"
            onUploadProgress={() => {
              setUploadError(undefined);
            }}
            content={{
              allowedContent: ({ isUploading, uploadProgress }) => {
                if (uploadError) {
                  return <p className="text-destructive">{uploadError}</p>;
                }
                return isUploading ? (
                  <p>{`Uploading ${uploadProgress}%...`}</p>
                ) : (
                  <p>Square images recommended (Max 2MB)</p>
                );
              },
            }}
            onClientUploadComplete={(res) => {
              const fileUrl = res?.[0]?.fileUrl;
              if (fileUrl) {
                setLogo(fileUrl);
              }
            }}
            onUploadError={(error: Error) => {
              setUploadError(error.message);
            }}
          />
        </div>
      </div>
    </TitleLayout>
  );
};

export default LeagueForm;
