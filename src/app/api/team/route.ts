import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db/client';

export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const orgId = searchParams.get('orgId');

        if (!orgId) {
            return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
        }

        const user = await db.findUserByAuth0Id(session.user.sub);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const membership = await db.getUserOrgMembership(user.id, orgId);
        if (!membership) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const members = await db.getOrganizationMembers(orgId);

        return NextResponse.json(members, {
            headers: {
                'Cache-Control': 'private, max-age=60',
            },
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}