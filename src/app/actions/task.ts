'use server';

import { db } from '@/lib/db/client';
import { auth0 } from '@/lib/auth0';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import {getCurrentOrgId} from "@/lib/org/current";
import {requireAuth} from "@/app/auth/require-auth";

export async function createTask(formData: FormData) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'createTask',
        },
        async () => {
            try {
                const { user } = await requireAuth();

                const currentOrgId = await getCurrentOrgId();
                if (!currentOrgId) {
                    return { success: false, message: 'No organization selected' };
                }

                const projectId = formData.get('project_id') as string;
                const title = formData.get('title') as string;
                const description = formData.get('description') as string;
                const status = formData.get('status') as string;

                if (!projectId || !title || !status) {
                    return { success: false, message: 'Project, title, and status are required' };
                }

                await db.createTask(projectId, title, description || null, status, user.id);

                revalidatePath('/tasks');
                revalidatePath('/projects/[id]', 'page');
                revalidatePath('/');

                return { success: true, message: 'Task created successfully' };
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to create task'
                };
            }
        }
    );
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'updateTaskStatus',
        },
        async () => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                await db.updateTaskStatus(taskId, newStatus);

                // Revalidate all pages that might show this task
                revalidatePath('/tasks');
                revalidatePath('/projects/[id]', 'page');
                revalidatePath('/');

                return { success: true, message: 'Task status updated' };
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to update task status'
                };
            }
        }
    );
}

export async function deleteTask(taskId: string, redirectTo?: string) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'deleteTask',
        },
        async () => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                await db.deleteTask(taskId);

                revalidatePath('/tasks');
                revalidatePath('/projects/[id]', 'page');
                revalidatePath('/');

                if (redirectTo) {
                    redirect(redirectTo);
                }

                return { success: true, message: 'Task deleted successfully' };
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to delete task'
                };
            }
        }
    );
}

export async function updateTask(taskId: string, formData: FormData) {
    return Sentry.startSpan(
        {
            op: 'action',
            name: 'updateTask',
        },
        async () => {
            try {
                const session = await auth0.getSession();
                if (!session?.user) {
                    return { success: false, message: 'Not authenticated' };
                }

                const updates: any = {};

                const title = formData.get('title') as string;
                const description = formData.get('description') as string;
                const status = formData.get('status') as string;
                const assignedTo = formData.get('assigned_to') as string;

                if (title) updates.title = title;
                if (description !== null) updates.description = description || null;
                if (status) updates.status = status;
                if (assignedTo !== undefined) updates.assigned_to = assignedTo || null;

                await db.updateTask(taskId, updates);

                revalidatePath('/tasks');
                revalidatePath('/projects/[id]', 'page');
                revalidatePath('/');

                return { success: true, message: 'Task updated successfully' };
            } catch (error) {
                Sentry.captureException(error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to update task'
                };
            }
        }
    );
}