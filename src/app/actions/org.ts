'use server';

import { setCurrentOrgId } from '@/lib/org/current';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db/client';

export async function switchOrganization(orgId: string) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        throw new Error('User not found');
    }

    // Verify user is member of this org
    const membership = await db.getUserOrgMembership(user.id, orgId);
    if (!membership) {
        throw new Error('Not a member of this organization');
    }

    // Set current org
    await setCurrentOrgId(orgId);

    // Redirect to refresh the page with new context
    redirect('/');
}