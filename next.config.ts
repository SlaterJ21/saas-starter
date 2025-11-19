import {withSentryConfig} from "@sentry/nextjs";
import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    turbopack: {
        root: process.cwd(),
    },
    // Enable standalone output for Docker
    output: 'standalone',
};

export default withSentryConfig(nextConfig, {
    org: "jslaterdev",
    project: "javascript-nextjs",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true,
    tunnelRoute: "/monitoring",
    reactComponentAnnotation: {
        enabled: true,
    },
});