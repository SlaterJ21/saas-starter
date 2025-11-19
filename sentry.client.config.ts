import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Enable structured logging
    enableLogs: true,

    // Integrations
    integrations: [
        // Send console.log, console.warn, and console.error calls as logs to Sentry
        Sentry.consoleIntegration({ levels: ['log', 'warn', 'error'] }),
    ],

    environment: process.env.NODE_ENV,

    // Ignore common errors
    ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
    ],
});