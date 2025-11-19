import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';
import * as Sentry from '@sentry/nextjs';

const { logger } = Sentry;

export default async function proxy(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // Create a unique request ID
  const requestId = crypto.randomUUID();

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  let response: NextResponse;

  // Let Auth0 middleware handle auth routes
  if (pathname.startsWith('/auth/')) {
    try {
      response = await auth0.middleware(request);
    } catch (error) {
      console.error('Auth0 middleware error:', error);
      Sentry.captureException(error);
      response = NextResponse.next();
    }
  } else {
    // Pass through everything else with request ID
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Add request ID to response headers
  response.headers.set('x-request-id', requestId);

  // Log the request
  const duration = Date.now() - startTime;

  // Only log API routes and important pages
  const shouldLog =
      pathname.startsWith('/api/') ||
      pathname.startsWith('/auth/') ||
      pathname === '/';

  if (shouldLog) {
    const logData = {
      requestId,
      method: request.method,
      path: pathname,
      query: request.nextUrl.search,
      userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...',
      duration: `${duration}ms`,
    };

    // Log to console (always works)
    console.log('🔵 HTTP Request:', JSON.stringify(logData, null, 2));

    // Also log to Sentry
    logger.info('HTTP Request', logData);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};