import { generateComponents } from "@uploadthing/react";

import type { OurFileRouter } from "~/server/uploadthing";

export const { UploadButton } = generateComponents<OurFileRouter>();
