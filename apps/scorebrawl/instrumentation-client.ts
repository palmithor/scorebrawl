import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://bd5c70d5d45a563e21e1a932ead036c3@o4507701845032960.ingest.de.sentry.io/4507701848375376",
  tracesSampleRate: 1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  environment: process.env.SENTRY_ENV,
});

// Add the onRequestError hook for RSC error capturing

export function onRequestError(error: unknown, req: Request) {
  Sentry.captureRequestError(
    error,
    {
      path: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    },
    {
      routerKind: "app",
      routePath: req.url,
      routeType: "app-route",
    },
  );
}
