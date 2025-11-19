import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

const { logger } = Sentry;

export const dynamic = 'force-dynamic';

export async function GET() {
    return Sentry.startSpan(
        {
            op: 'health.check.graphql',
            name: 'GraphQL Health Check',
        },
        async (span) => {
            const startTime = Date.now();
            const graphqlUrl = process.env.GRAPHQL_URL || 'http://localhost:5001/graphql';

            try {
                // Simple introspection query
                const response = await fetch(graphqlUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: '{ __typename }',
                    }),
                });

                const responseTime = Date.now() - startTime;

                if (!response.ok) {
                    throw new Error(`GraphQL returned ${response.status}`);
                }

                const data = await response.json();

                const health = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    graphql: {
                        available: true,
                        responseTime: `${responseTime}ms`,
                        endpoint: graphqlUrl,
                    },
                };

                span?.setAttribute('graphql.available', true);
                span?.setAttribute('graphql.response_time_ms', responseTime);

                logger.info('GraphQL health check passed', {
                    responseTime,
                });

                return NextResponse.json(health, {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0',
                    },
                });
            } catch (error) {
                const responseTime = Date.now() - startTime;

                logger.error('GraphQL health check failed', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    responseTime,
                    endpoint: graphqlUrl,
                });

                Sentry.captureException(error);

                span?.setAttribute('graphql.available', false);

                return NextResponse.json(
                    {
                        status: 'unhealthy',
                        timestamp: new Date().toISOString(),
                        graphql: {
                            available: false,
                            error: error instanceof Error ? error.message : 'GraphQL connection failed',
                            responseTime: `${responseTime}ms`,
                            endpoint: graphqlUrl,
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