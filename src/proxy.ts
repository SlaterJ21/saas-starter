import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Let Auth0 middleware handle auth routes
  if (pathname.startsWith('/auth/')) {
    try {
      return await auth0.middleware(request);
    } catch (error) {
      console.error('Auth0 middleware error:', error);
      return NextResponse.next();
    }
  }
  
  // Pass through everything else
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/:path*',
  ],
};
