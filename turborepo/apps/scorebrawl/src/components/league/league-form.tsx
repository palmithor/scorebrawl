"use client";

import { create } from "@/actions/league";
import { TitleLayout } from "@/components/layout/title-layout";
import { UploadButton } from "@/components/uploadthing";
import { createLeagueSchema } from "@scorebrawl/api";
import AutoForm from "@scorebrawl/ui/auto-form";
import { LoadingButton } from "@scorebrawl/ui/loading-button";
import { useToast } from "@scorebrawl/ui/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const DEFAULT_LEAGUE_LOGO =
  "https://utfs.io/f/c5562abd-47aa-46de-b6a9-936b4cef1875_mascot.png";

type FormValues = {
  name: string;
};

export const LeagueForm = ({
  title,
  buttonTitle,
  league,
}: {
  title: string;
  buttonTitle: string;
  league?: { name: string; visibility: "public" | "private"; logoUrl: string };
}) => {
  const { toast } = useToast();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [logo, setLogo] = useState<string>(DEFAULT_LEAGUE_LOGO);

  const onSubmit = async (val: FormValues) => {
    setIsLoading(true);
    try {
      const league = await create({ ...val, logoUrl: logo, visibility: "private" });
      push(`/leagues/${league.slug}`);
    } catch (err) {
      toast({
        title: "Error creating league",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <TitleLayout title={title}>
      <div className="grid grid-rows-2 gap-8 sm:grid-cols-2">
        <AutoForm
          formSchema={createLeagueSchema.omit({ logoUrl: true, userId: true })}
          fieldConfig={{ visibility: { fieldType: "radio" } }}
          values={league}
          onSubmit={onSubmit}
        >
          <LoadingButton loading={isLoading} type="submit" disabled={uploadInProgress}>
            {buttonTitle}
          </LoadingButton>
        </AutoForm>
        <div className="flex h-full w-full flex-col items-center justify-start gap-4 sm:justify-end">
          <Image width={160} height={160} src={logo} alt="logo" priority />
          <UploadButton
            /*
            // @ts-ignore */
            className="ut-button:h-10 ut-button:items-center ut-button:justify-center ut-button:rounded-md ut-button:bg-primary ut-button:px-4 ut-button:py-2 ut-button:text-sm ut-button:font-medium ut-button:text-primary-foreground ut-button:ring-offset-background ut-button:transition-colors ut-button:hover:bg-primary/90 ut-button:focus-visible:outline-none ut-button:focus-visible:ring-2 ut-button:focus-visible:ring-ring ut-button:focus-visible:ring-offset-2 ut-button:disabled:pointer-events-none ut-button:disabled:opacity-50"
            endpoint="leagueLogo"
            onUploadBegin={() => setUploadInProgress(true)}
            onUploadProgress={() => {
              setUploadError(undefined);
            }}
            content={{
              allowedContent: ({
                isUploading,
                uploadProgress,
              }: {
                isUploading: boolean;
                uploadProgress: number;
              }) => {
                if (uploadError) {
                  return <p className="text-destructive">{uploadError}</p>;
                }
                return isUploading ? (
                  <p>{`Uploading ${uploadProgress}%...`}</p>
                ) : (
                  <p>Square images recommended (Max 4MB)</p>
                );
              },
            }}
            onClientUploadComplete={(res: { url: string }[]) => {
              setUploadInProgress(false);
              const fileUrl = res?.[0]?.url;
              if (fileUrl) {
                setLogo(fileUrl);
              }
            }}
            onUploadError={(error: Error) => {
              setUploadInProgress(false);
              setUploadError(error.message);
            }}
          />
        </div>
      </div>
    </TitleLayout>
  );
};
