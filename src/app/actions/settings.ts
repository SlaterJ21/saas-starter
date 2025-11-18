'use server';

import { db } from '@/lib/db/client';
import { auth0 } from '@/lib/auth0';
import { getCurrentOrgId, setCurrentOrgId } from '@/lib/org/current';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        throw new Error('User not found');
    }

    const name = formData.get('name') as string;

    await db.updateUser(user.id, { name });

    revalidatePath('/settings');
    revalidatePath('/');
}

export async function updateOrganizationSettings(formData: FormData) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        throw new Error('User not found');
    }

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        throw new Error('No organization selected');
    }

    // Check if user is owner or admin
    const membership = await db.getUserOrgMembership(user.id, currentOrgId);
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
        throw new Error('You do not have permission to update organization settings');
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const updates: any = {};
    if (name) updates.name = name;
    if (slug) updates.slug = slug;

    await db.updateOrganization(currentOrgId, updates);

    revalidatePath('/settings');
    revalidatePath('/');
}

export async function leaveOrganization() {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        throw new Error('User not found');
    }

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        throw new Error('No organization selected');
    }

    // Check if user is owner
    const membership = await db.getUserOrgMembership(user.id, currentOrgId);
    if (membership?.role === 'owner') {
        const memberCount = await db.getOrganizationMemberCount(currentOrgId);
        if (memberCount > 1) {
            throw new Error('Transfer ownership before leaving. You are the only owner.');
        }
    }

    // Remove user from organization
    await db.removeMemberFromOrganization(currentOrgId, user.id);

    // Switch to another org
    const userOrgs = await db.getUserOrganizations(user.id);
    if (userOrgs.length > 0) {
        await setCurrentOrgId(userOrgs[0].id);
    }

    revalidatePath('/settings');
    revalidatePath('/');
    redirect('/');
}

export async function deleteOrganization() {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        throw new Error('User not found');
    }

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        throw new Error('No organization selected');
    }

    // Check if user is owner
    const membership = await db.getUserOrgMembership(user.id, currentOrgId);
    if (membership?.role !== 'owner') {
        throw new Error('Only the owner can delete the organization');
    }

    // Delete organization (cascade will remove members, projects, tasks)
    await db.deleteOrganization(currentOrgId);

    // Switch to another org
    const userOrgs = await db.getUserOrganizations(user.id);
    if (userOrgs.length > 0) {
        await setCurrentOrgId(userOrgs[0].id);
    }

    revalidatePath('/settings');
    revalidatePath('/');
    redirect('/');
}