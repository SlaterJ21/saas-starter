import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import * as Sentry from '@sentry/nextjs';

const { logger } = Sentry;

export const dynamic = 'force-dynamic';

export async function GET() {
    return Sentry.startSpan(
        {
            op: 'health.check.database',
            name: 'Database Health Check',
        },
        async (span) => {
            const startTime = Date.now();

            try {
                // Simple query to check connectivity
                const result = await db.query('SELECT NOW() as current_time, version() as version');
                const responseTime = Date.now() - startTime;

                const health = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    database: {
                        connected: true,
                        responseTime: `${responseTime}ms`,
                        serverTime: result.rows[0].current_time,
                        version: result.rows[0].version.split(' ')[0], // PostgreSQL version
                    },
                };

                span?.setAttribute('db.connected', true);
                span?.setAttribute('db.response_time_ms', responseTime);

                logger.info('Database health check passed', {
                    responseTime,
                });

                return NextResponse.json(health, {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0',
                    },
                });
            } catch (error) {
                const responseTime = Date.now() - startTime;

                logger.error('Database health check failed', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    responseTime,
                });

                Sentry.captureException(error);

                span?.setAttribute('db.connected', false);

                return NextResponse.json(
                    {
                        status: 'unhealthy',
                        timestamp: new Date().toISOString(),
                        database: {
                            connected: false,
                            error: error instanceof Error ? error.message : 'Database connection failed',
                            responseTime: `${responseTime}ms`,
                        },
                    },
                    {
                        status: 503,
                        headers: {
                            'Cache-Control': 'no-store, max-age=0',
                        },
                    }
                );
            }
        }
    );
}