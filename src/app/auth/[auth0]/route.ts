import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';

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
                const returnTo = process.env.APP_BASE_URL;

                const logoutUrl = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo || 'http://localhost:3000')}`;

                const response = NextResponse.redirect(logoutUrl);
                response.cookies.set('appSession', '', {
                    maxAge: 0,
                    path: '/',
                });

                return response;
            }

            case 'callback':
                // Middleware already handled the OAuth exchange
                // Just redirect to home
                return NextResponse.redirect(new URL('/', request.url));

            case 'me': {
                const session = await auth0.getSession();
                return NextResponse.json(session?.user || null);
            }

            default:
                return new NextResponse('Not Found', { status: 404 });
        }
    } catch (error) {
        console.error('Auth route error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}