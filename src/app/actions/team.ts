'use server';

import {db} from '@/lib/db/client';
import {auth0} from '@/lib/auth0';
import {getCurrentOrgId} from '@/lib/org/current';
import {revalidatePath} from 'next/cache';
import * as Sentry from '@sentry/nextjs';
import {requireAuth} from "@/app/auth/require-auth";

const {logger} = Sentry;

export async function inviteMemberByEmail(email: string, role: string) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'inviteMemberByEmail',
        },
        async (span) => {
            try {
                const { user } = await requireAuth();

                const currentOrgId = await getCurrentOrgId();
                if (!currentOrgId) {
                    return { success: false, message: 'No organization selected' };
                }

                span?.setAttribute('inviter_email', user.email);
                span?.setAttribute('invitee_email', email);
                span?.setAttribute('role', role);
                span?.setAttribute('organization_id', currentOrgId);

                // Check if current user has permission (must be owner or admin)
                const currentMembership = await db.getUserOrgMembership(user.id, currentOrgId);
                if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
                    logger.warn('User attempted to invite without permission', {
                        userId: user.id,
                        orgId: currentOrgId,
                        role: currentMembership?.role,
                    });
                    return { success: false, message: 'You do not have permission to invite members' };
                }

                // Find user by email
                const userToInvite = await db.getUserByEmail(email);
                if (!userToInvite) {
                    logger.info('Invite attempt for non-existent user', {
                        email,
                        orgId: currentOrgId,
                        invitedBy: user.email,
                    });

                    Sentry.captureMessage(`Invite attempt for unregistered email: ${email}`, {
                        level: 'info',
                        tags: {
                            action: 'invite_member',
                            error_type: 'user_not_found',
                        },
                    });

                    return { success: false, message: `User with email ${email} not found. They must sign up first.` };
                }

                // Check if already a member
                const isAlreadyMember = await db.isUserInOrganization(userToInvite.id, currentOrgId);
                if (isAlreadyMember) {
                    logger.info('Invite attempt for existing member', {
                        email,
                        orgId: currentOrgId,
                    });
                    return { success: false, message: 'User is already a member of this organization' };
                }

                // Add user to organization
                await db.addUserToOrganization(userToInvite.id, currentOrgId, role as any);

                logger.info('User successfully invited', {
                    inviteeId: userToInvite.id,
                    inviteeEmail: email,
                    role,
                    orgId: currentOrgId,
                    invitedBy: user.email,
                });

                span?.setAttribute('success', true);
                revalidatePath('/team');

                return { success: true, message: `Successfully invited ${email}` };
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to invite member'
                };
            }
        }
    );
}

export async function updateMemberRole(userId: string, newRole: string) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'updateMemberRole',
        },
        async (span) => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                const currentUser = await db.findUserByAuth0Id(session.user.sub);
                if (!currentUser) {
                    return { success: false, message: 'User not found' };
                }

                const currentOrgId = await getCurrentOrgId();
                if (!currentOrgId) {
                    return { success: false, message: 'No organization selected' };
                }

                span?.setAttribute('target_user_id', userId);
                span?.setAttribute('new_role', newRole);
                span?.setAttribute('organization_id', currentOrgId);

                // Check if current user has permission
                const currentMembership = await db.getUserOrgMembership(currentUser.id, currentOrgId);
                if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
                    logger.warn('User attempted to change role without permission', {
                        userId: currentUser.id,
                        targetUserId: userId,
                    });
                    return { success: false, message: 'You do not have permission to change roles' };
                }

                // Can't change own role
                if (currentUser.id === userId) {
                    logger.warn('User attempted to change own role', {userId: currentUser.id});
                    return { success: false, message: 'You cannot change your own role' };
                }

                // Update role
                await db.updateMemberRole(currentOrgId, userId, newRole);

                logger.info('Member role updated', {
                    targetUserId: userId,
                    newRole,
                    updatedBy: currentUser.email,
                });

                revalidatePath('/team');

                return { success: true, message: 'Member role updated successfully' };
            } catch (error) {
                logger.error('Failed to update member role', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to update member role'
                };
            }
        }
    );
}

export async function removeMember(userId: string) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'removeMember',
        },
        async (span) => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                const currentUser = await db.findUserByAuth0Id(session.user.sub);
                if (!currentUser) {
                    return { success: false, message: 'User not found' };
                }

                const currentOrgId = await getCurrentOrgId();
                if (!currentOrgId) {
                    return { success: false, message: 'No organization selected' };
                }

                span?.setAttribute('target_user_id', userId);
                span?.setAttribute('organization_id', currentOrgId);

                // Check if current user has permission
                const currentMembership = await db.getUserOrgMembership(currentUser.id, currentOrgId);
                if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
                    logger.warn('User attempted to remove member without permission', {
                        userId: currentUser.id,
                    });
                    return { success: false, message: 'You do not have permission to remove members' };
                }

                // Can't remove self
                if (currentUser.id === userId) {
                    logger.warn('User attempted to remove themselves', {userId: currentUser.id});
                    return { success: false, message: 'You cannot remove yourself from the organization' };
                }

                // Remove member
                await db.removeMemberFromOrganization(currentOrgId, userId);

                logger.warn('Member removed from organization', {
                    removedUserId: userId,
                    removedBy: currentUser.email,
                    orgId: currentOrgId,
                });

                revalidatePath('/team');

                return { success: true, message: 'Member removed from organization' };
            } catch (error) {
                logger.error('Failed to remove member', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to remove member'
                };
            }
        }
    );
}