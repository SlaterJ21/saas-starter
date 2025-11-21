import {withSentryConfig} from "@sentry/nextjs";
import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    turbopack: {
        root: process.cwd(),
    },
    // Enable standalone output for Docker
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '**',
            },
            // Add other avatar providers you might use
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 's.gravatar.com',
                pathname: '**',
            },
        ],
    },
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