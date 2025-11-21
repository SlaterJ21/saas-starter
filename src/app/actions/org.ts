'use server';

import { setCurrentOrgId } from '@/lib/org/current';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import * as Sentry from '@sentry/nextjs';
import {requireAuth} from "@/app/auth/require-auth";

export async function switchOrganization(orgId: string) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'switchOrganization',
        },
        async () => {
            try {
                const { user } = await requireAuth();

                // Verify user is member of this org
                const membership = await db.getUserOrgMembership(user.id, orgId);
                if (!membership) {
                    return { success: false, message: 'Not a member of this organization' };
                }

                // Set current org
                await setCurrentOrgId(orgId);

                // Redirect to refresh the page with new context
                redirect('/');
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to switch organization'
                };
            }
        }
    );
}