'use server';

import {db} from '@/lib/db/client';
import {auth0} from '@/lib/auth0';
import {getCurrentOrgId} from '@/lib/org/current';
import {revalidatePath} from 'next/cache';
import * as Sentry from '@sentry/nextjs';

const {logger} = Sentry;

// Custom error types
class UserNotFoundError extends Error {
    constructor(email: string) {
        super(`User with email ${email} not found. They must sign up first.`);
        this.name = 'UserNotFoundError';
    }
}

class AlreadyMemberError extends Error {
    constructor() {
        super('User is already a member of this organization');
        this.name = 'AlreadyMemberError';
    }
}

class PermissionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermissionError';
    }
}

export async function inviteMemberByEmail(email: string, role: string) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'inviteMemberByEmail',
        },
        async (span) => {
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

            span?.setAttribute('inviter_email', currentUser.email);
            span?.setAttribute('invitee_email', email);
            span?.setAttribute('role', role);
            span?.setAttribute('organization_id', currentOrgId);

            // Check if current user has permission (must be owner or admin)
            const currentMembership = await db.getUserOrgMembership(currentUser.id, currentOrgId);
            if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
                logger.warn('User attempted to invite without permission', {
                    userId: currentUser.id,
                    orgId: currentOrgId,
                    role: currentMembership?.role,
                });
                throw new PermissionError('You do not have permission to invite members');
            }

            // Find user by email
            const userToInvite = await db.getUserByEmail(email);
            if (!userToInvite) {
                // This is EXPECTED user behavior - log but don't alert
                logger.info('Invite attempt for non-existent user', {
                    email,
                    orgId: currentOrgId,
                    invitedBy: currentUser.email,
                });

                // Track the pattern (useful to see if many users hitting this)
                Sentry.captureMessage(`Invite attempt for unregistered email: ${email}`, {
                    level: 'info',
                    tags: {
                        action: 'invite_member',
                        error_type: 'user_not_found',
                    },
                    extra: {
                        email,
                        orgId: currentOrgId,
                        invitedBy: currentUser.email,
                    },
                });

                throw new UserNotFoundError(email);
            }

            // Check if already a member
            const isAlreadyMember = await db.isUserInOrganization(userToInvite.id, currentOrgId);
            if (isAlreadyMember) {
                logger.info('Invite attempt for existing member', {
                    email,
                    orgId: currentOrgId,
                });

                // Also expected - just log
                throw new AlreadyMemberError();
            }

            // Add user to organization
            try {
                await db.addUserToOrganization(userToInvite.id, currentOrgId, role as any);

                logger.info('User successfully invited', {
                    inviteeId: userToInvite.id,
                    inviteeEmail: email,
                    role,
                    orgId: currentOrgId,
                    invitedBy: currentUser.email,
                });

                span?.setAttribute('success', true);
            } catch (error) {
                // THIS is unexpected - send to Sentry as error
                logger.error('Failed to add user to organization', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    inviteeEmail: email,
                    orgId: currentOrgId,
                });
                Sentry.captureException(error);
                throw error;
            }

            revalidatePath('/team');
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
                throw new PermissionError('You do not have permission to change roles');
            }

            // Can't change own role
            if (currentUser.id === userId) {
                logger.warn('User attempted to change own role', {userId: currentUser.id});
                throw new PermissionError('You cannot change your own role');
            }

            // Update role
            try {
                await db.updateMemberRole(currentOrgId, userId, newRole);

                logger.info('Member role updated', {
                    targetUserId: userId,
                    newRole,
                    updatedBy: currentUser.email,
                });
            } catch (error) {
                logger.error('Failed to update member role', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    userId,
                    newRole,
                });
                Sentry.captureException(error);
                throw error;
            }

            revalidatePath('/team');
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

            span?.setAttribute('target_user_id', userId);
            span?.setAttribute('organization_id', currentOrgId);

            // Check if current user has permission
            const currentMembership = await db.getUserOrgMembership(currentUser.id, currentOrgId);
            if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
                logger.warn('User attempted to remove member without permission', {
                    userId: currentUser.id,
                });
                throw new PermissionError('You do not have permission to remove members');
            }

            // Can't remove self
            if (currentUser.id === userId) {
                logger.warn('User attempted to remove themselves', {userId: currentUser.id});
                throw new PermissionError('You cannot remove yourself from the organization');
            }

            // Remove member
            try {
                await db.removeMemberFromOrganization(currentOrgId, userId);

                logger.warn('Member removed from organization', {
                    removedUserId: userId,
                    removedBy: currentUser.email,
                    orgId: currentOrgId,
                });
            } catch (error) {
                logger.error('Failed to remove member', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    userId,
                });
                Sentry.captureException(error);
                throw error;
            }

            revalidatePath('/team');
        }
    );
}