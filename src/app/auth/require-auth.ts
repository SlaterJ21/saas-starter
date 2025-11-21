import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';

export async function requireAuth() {
    const session = await auth0.getSession();

    if (!session?.user) {
        redirect('/auth/login');
    }

    // Build auth0User object
    const auth0User = {
        auth0Id: session.user.sub || session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || session.user.email?.split('@')[0] || 'User',
        picture: session.user.picture,
    };

    // Validate we have required data
    if (!auth0User.auth0Id) {
        console.error('Missing auth0Id from session:', session.user);
        throw new Error('Authentication error: Missing user ID');
    }

    const user = await db.findOrCreateUser(auth0User);

    return { session, user };
}