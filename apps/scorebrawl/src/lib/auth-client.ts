import { createAuthClient } from "better-auth/react";

export const getURL = () => {
  const url =
    (process.env.NEXT_PUBLIC_EXPORT
      ? process.env.NEXT_PUBLIC_BASE_URL
      : process.env.NEXT_PUBLIC_SITE_URL || // Set this to your site URL in production env only. (Production)
        process.env.NEXT_PUBLIC_VERCEL_URL) || // Automatically set by Vercel. (Preview)
    "http://localhost:5050"; // Default to localhost. (Development)

  // Make sure to include `https://` when not localhost.
  return url.includes("http") ? url : `https://${url}`;
};

export const authClient = createAuthClient({
  baseURL: getURL(),
});
