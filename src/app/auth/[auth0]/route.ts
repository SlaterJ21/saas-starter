import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';
import {requireAuth} from "@/app/auth/require-auth";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ auth0: string }> }
) {
    const { auth0: action } = await context.params;

    try {
        switch (action) {
            case 'login':
                return await auth0.startInteractiveLogin();

            case 'logout': {
                const domain = process.env.AUTH0_DOMAIN;
                const clientId = process.env.AUTH0_CLIENT_ID;
                const returnTo = process.env.APP_BASE_URL || 'http://localhost:3000';

                const logoutUrl = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`;

                const response = NextResponse.redirect(logoutUrl);
                response.cookies.set('appSession', '', {
                    maxAge: 0,
                    path: '/',
                });

                return response;
            }

            case 'callback': {
                // The middleware should have already processed this
                // Check if we have a session now
                const { session, user } = await requireAuth();

                console.log('Callback - Session check:', session ? 'EXISTS' : 'MISSING');

                if (session) {
                    console.log('Callback - Session user:', user?.email);
                    return NextResponse.redirect(new URL('/', request.url));
                } else {
                    console.error('Callback - No session after middleware!');
                    // Try to get the middleware to process it
                    return await auth0.middleware(request);
                }
            }

            case 'me': {
                const { user } = await requireAuth();
                return NextResponse.json(user || null);
            }

            default:
                return new NextResponse('Not Found', { status: 404 });
        }
    } catch (error) {
        console.error('Auth route error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}