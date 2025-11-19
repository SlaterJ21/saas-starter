import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';

const { logger } = Sentry;

export const dynamic = 'force-dynamic';

export async function GET() {
    return Sentry.startSpan(
        {
            op: 'health.check',
            name: 'System Health Check',
        },
        async () => {
            const startTime = Date.now();
            const headersList = await headers();
            const requestId = headersList.get('x-request-id');

            const health = {
                status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                checks: {
                    server: true,
                    environment: !!process.env.DATABASE_URL,
                },
                version: process.env.npm_package_version || 'unknown',
                environment: process.env.NODE_ENV,
                requestId,
            };

            const responseTime = Date.now() - startTime;

            logger.info('Health check performed', {
                status: health.status,
                responseTime,
                requestId,
            });

            return NextResponse.json(health, {
                status: health.status === 'healthy' ? 200 : 503,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            });
        }
    );
}