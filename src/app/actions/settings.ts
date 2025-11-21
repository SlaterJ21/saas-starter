'use server';

import { db } from '@/lib/db/client';
import { auth0 } from '@/lib/auth0';
import { getCurrentOrgId, setCurrentOrgId } from '@/lib/org/current';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import {requireAuth} from "@/app/auth/require-auth";

export async function updateProfile(formData: FormData) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'updateProfile',
        },
        async () => {
            try {
                const { user } = await requireAuth();

                const name = formData.get('name') as string;
                await db.updateUser(user.id, { name });

                revalidatePath('/settings');
                revalidatePath('/');

                return { success: true, message: 'Profile updated successfully' };
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to update profile'
                };
            }
        }
    );
}

export async function updateOrganizationSettings(formData: FormData) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'updateOrganizationSettings',
        },
        async () => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                const user = await db.findUserByAuth0Id(session.user.sub);
                if (!user) {
                    return { success: false, message: 'User not found' };
                }

                const currentOrgId = await getCurrentOrgId();
                if (!currentOrgId) {
                    return { success: false, message: 'No organization selected' };
                }

                // Check if user is owner or admin
                const membership = await db.getUserOrgMembership(user.id, currentOrgId);
                if (!membership || !['owner', 'admin'].includes(membership.role)) {
                    return { success: false, message: 'You do not have permission to update organization settings' };
                }

                const name = formData.get('name') as string;
                const slug = formData.get('slug') as string;

                const updates: any = {};
                if (name) updates.name = name;
                if (slug) updates.slug = slug;

                await db.updateOrganization(currentOrgId, updates);

                revalidatePath('/settings');
                revalidatePath('/');

                return { success: true, message: 'Organization settings updated successfully' };
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to update organization settings'
                };
            }
        }
    );
}

export async function leaveOrganization() {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'leaveOrganization',
        },
        async () => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                const user = await db.findUserByAuth0Id(session.user.sub);
                if (!user) {
                    return { success: false, message: 'User not found' };
                }

                const currentOrgId = await getCurrentOrgId();
                if (!currentOrgId) {
                    return { success: false, message: 'No organization selected' };
                }

                // Check if user is owner
                const membership = await db.getUserOrgMembership(user.id, currentOrgId);
                if (membership?.role === 'owner') {
                    const memberCount = await db.getOrganizationMemberCount(currentOrgId);
                    if (memberCount > 1) {
                        return { success: false, message: 'Transfer ownership before leaving. You are the only owner.' };
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
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to leave organization'
                };
            }
        }
    );
}

export async function deleteOrganization() {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'deleteOrganization',
        },
        async () => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                const user = await db.findUserByAuth0Id(session.user.sub);
                if (!user) {
                    return { success: false, message: 'User not found' };
                }

                const currentOrgId = await getCurrentOrgId();
                if (!currentOrgId) {
                    return { success: false, message: 'No organization selected' };
                }

                // Check if user is owner
                const membership = await db.getUserOrgMembership(user.id, currentOrgId);
                if (membership?.role !== 'owner') {
                    return { success: false, message: 'Only the owner can delete the organization' };
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
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to delete organization'
                };
            }
        }
    );
}