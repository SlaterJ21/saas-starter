'use server';

import { db } from '@/lib/db/client';
import { auth0 } from '@/lib/auth0';
import { getCurrentOrgId } from '@/lib/org/current';
import { revalidatePath } from 'next/cache';

export async function inviteMemberByEmail(email: string, role: string) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const currentUser = await db.findUserByAuth0Id(session.user.sub);
    if (!currentUser) {
        throw new Error('User not found');
    }

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        throw new Error('No organization selected');
    }

    // Check if current user has permission (must be owner or admin)
    const currentMembership = await db.getUserOrgMembership(currentUser.id, currentOrgId);
    if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
        throw new Error('You do not have permission to invite members');
    }

    // Find user by email
    const userToInvite = await db.getUserByEmail(email);
    if (!userToInvite) {
        throw new Error('User with this email not found. They must sign up first.');
    }

    // Check if already a member
    const isAlreadyMember = await db.isUserInOrganization(userToInvite.id, currentOrgId);
    if (isAlreadyMember) {
        throw new Error('User is already a member of this organization');
    }

    // Add user to organization
    await db.addUserToOrganization(userToInvite.id, currentOrgId, role as any);

    revalidatePath('/team');
}

export async function updateMemberRole(userId: string, newRole: string) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const currentUser = await db.findUserByAuth0Id(session.user.sub);
    if (!currentUser) {
        throw new Error('User not found');
    }

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        throw new Error('No organization selected');
    }

    // Check if current user has permission
    const currentMembership = await db.getUserOrgMembership(currentUser.id, currentOrgId);
    if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
        throw new Error('You do not have permission to change roles');
    }

    // Can't change own role
    if (currentUser.id === userId) {
        throw new Error('You cannot change your own role');
    }

    // Update role
    await db.updateMemberRole(currentOrgId, userId, newRole);

    revalidatePath('/team');
}

export async function removeMember(userId: string) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const currentUser = await db.findUserByAuth0Id(session.user.sub);
    if (!currentUser) {
        throw new Error('User not found');
    }

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        throw new Error('No organization selected');
    }

    // Check if current user has permission
    const currentMembership = await db.getUserOrgMembership(currentUser.id, currentOrgId);
    if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
        throw new Error('You do not have permission to remove members');
    }

    // Can't remove self
    if (currentUser.id === userId) {
        throw new Error('You cannot remove yourself from the organization');
    }

    // Remove member
    await db.removeMemberFromOrganization(currentOrgId, userId);

    revalidatePath('/team');
}