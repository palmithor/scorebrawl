import { AutoForm, LoadingButton } from "@repo/ui/components";
import { type inferRouterOutputs } from "@trpc/server";
import Image from "next/image";
import * as React from "react";
import { TitleLayout } from "~/components/layout/title-layout";
import { UploadButton } from "~/components/uploadthing";
import { DEFAULT_LEAGUE_LOGO } from "~/pages/leagues/create";
import { create } from "~/server/api/league/league.schema";
import { type AppRouter } from "~/server/api/root";

type League = inferRouterOutputs<AppRouter>["league"]["getBySlug"];
type FormValues = {
  name: string;
  visibility: "public" | "private";
  logoUrl: string;
};

export const LeagueForm = ({
  title,
  buttonTitle,
  league,
  isLoading,
  onSubmit,
}: {
  title: string;
  buttonTitle: string;
  league?: League;
  isLoading: boolean;
  onSubmit: (val: FormValues) => void;
}) => {
  const [uploadError, setUploadError] = React.useState<string | undefined>();
  const [uploadInProgress, setUploadInProgress] = React.useState(false);
  const [logo, setLogo] = React.useState<string>(DEFAULT_LEAGUE_LOGO);
  return (
    <TitleLayout title={title}>
      <div className="grid grid-rows-2 gap-8 sm:grid-cols-2">
        <AutoForm
          formSchema={create.omit({ logoUrl: true })}
          fieldConfig={{ visibility: { fieldType: "radio" } }}
          values={league}
          onSubmit={(val) => onSubmit({ ...val, logoUrl: logo })}
        >
          <LoadingButton loading={isLoading} type="submit" disabled={uploadInProgress}>
            {buttonTitle}
          </LoadingButton>
        </AutoForm>
        <div className="flex h-full w-full flex-col items-center justify-start gap-4 sm:justify-end">
          <Image width={160} height={160} src={logo} alt="logo" />
          <UploadButton
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
            onClientUploadComplete={(res) => {
              setUploadInProgress(false);
              const fileUrl = res?.[0]?.fileUrl;
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
