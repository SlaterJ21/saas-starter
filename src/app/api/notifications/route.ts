import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db/client';

export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.findUserByAuth0Id(session.user.sub);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const notifications = await db.getUserNotifications(user.id, 50);

        return NextResponse.json(notifications, {
            headers: {
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}