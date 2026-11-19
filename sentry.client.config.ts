// Sentry Client Configuration (Solo activo en producción con DSN válido)
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProd = process.env.NODE_ENV === "production";

if (isProd && dsn && !dsn.includes("placeholder")) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
      debug: false,
    });
  }).catch(() => {
    // Sentry init fallback
  });
}

export {};
