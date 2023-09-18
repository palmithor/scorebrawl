import { generateComponents } from "@uploadthing/react";

import type { OurFileRouter } from "~/server/uploadthing";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const { UploadButton } = generateComponents<OurFileRouter>();
