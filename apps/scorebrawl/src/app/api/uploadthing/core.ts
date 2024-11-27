import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUploadthing } from "uploadthing/next";
import type { FileRouter as UploadthingFileRouter } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
// ts-ignore
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  leagueLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      // If you throw, the user will not be able to upload
      if (!session) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies UploadthingFileRouter;

export type FileRouter = typeof ourFileRouter;
