'use server';

import { db } from '@/lib/db/client';
import { auth0 } from '@/lib/auth0';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import {requireAuth} from "@/app/auth/require-auth";
import {notifyTaskCompleted, logActivity, notifyTaskAssigned} from '@/lib/notifications';

export async function updateTaskStatus(taskId: string, status: string) {
    return Sentry.startSpan({ name: 'updateTaskStatus' }, async () => {
        try {
            const {session} = await requireAuth();

            const user = await db.findUserByAuth0Id(session.user.sub);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Get task details before update
            const task = await db.getTaskById(taskId);
            if (!task) {
                return { success: false, message: 'Task not found' };
            }

            const oldStatus = task.status;

            // Update the task
            await db.updateTaskStatus(taskId, status);

            // Log activity
            await logActivity({
                organizationId: task.organization_id,
                userId: user.id,
                actionType: 'task_updated',
                entityType: 'task',
                entityId: taskId,
                description: `moved "${task.title}" to ${status.replace('_', ' ')}`,
                metadata: { oldStatus, newStatus: status },
            });

            // If completed, notify relevant users
            if (status === 'done' && oldStatus !== 'done') {
                // Get project to find owner
                const project = await db.getProjectById(task.project_id);

                if (project && project.created_by && project.created_by !== user.id) {
                    await notifyTaskCompleted({
                        taskId,
                        taskTitle: task.title,
                        completedByUserId: user.id,
                        projectOwnerId: project.created_by,
                        organizationId: task.organization_id,
                    });
                }
            }

            revalidatePath('/tasks');
            return { success: true, message: 'Task status updated' };
        } catch (error: any) {
            console.error('Error updating task status:', error);
            Sentry.captureException(error);
            return { success: false, message: error.message };
        }
    });
}

export async function updateTask(taskId: string, updates: {
    title?: string;
    description?: string;
    status?: string;
    assigned_to?: string | null;
}) {
    return Sentry.startSpan({ name: 'updateTask' }, async () => {
        try {
            const session = await auth0.getSession();
            if (!session?.user) {
                return { success: false, message: 'Not authenticated' };
            }

            const user = await db.findUserByAuth0Id(session.user.sub);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Get task before update
            const task = await db.getTaskById(taskId);
            if (!task) {
                return { success: false, message: 'Task not found' };
            }

            const oldAssignee = task.assigned_to;

            // Update the task
            await db.updateTask(taskId, updates);

            // Log activity
            await logActivity({
                organizationId: task.organization_id,
                userId: user.id,
                actionType: 'task_updated',
                entityType: 'task',
                entityId: taskId,
                description: `updated "${task.title}"`,
                metadata: { updates },
            });

            // If assigned to someone, notify them
            if (updates.assigned_to && updates.assigned_to !== oldAssignee && updates.assigned_to !== user.id) {
                await notifyTaskAssigned({
                    taskId,
                    taskTitle: task.title,
                    assignedToUserId: updates.assigned_to,
                    assignedByUserId: user.id,
                    organizationId: task.organization_id,
                });
            }

            revalidatePath('/tasks');
            revalidatePath(`/tasks/${taskId}`);
            return { success: true, message: 'Task updated successfully' };
        } catch (error: any) {
            console.error('Error updating task:', error);
            Sentry.captureException(error);
            return { success: false, message: error.message };
        }
    });
}

export async function createTask(formData: FormData) {
    return Sentry.startSpan({ name: 'createTask' }, async () => {
        try {
            const session = await auth0.getSession();
            if (!session?.user) {
                return { success: false, message: 'Not authenticated' };
            }

            const user = await db.findUserByAuth0Id(session.user.sub);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const projectId = formData.get('project_id') as string;
            const title = formData.get('title') as string;
            const description = formData.get('description') as string || null;
            const status = formData.get('status') as string;
            const assignedTo = formData.get('assigned_to') as string || null;

            console.log('📝 Creating task with assignedTo:', assignedTo);

            if (!projectId || !title || !status) {
                return { success: false, message: 'Project, title, and status are required' };
            }

            // Get project for organization_id
            const project = await db.getProjectById(projectId);
            if (!project) {
                return { success: false, message: 'Project not found' };
            }

            console.log('📁 Project found:', { id: project.id, organization_id: project.organization_id });

            // Create the task with assigned_to
            const result = await db.query(
                `INSERT INTO tasks (project_id, title, description, status, created_by, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
                [projectId, title, description, status, user.id, assignedTo]
            );

            const task = result.rows[0];
            console.log('✅ Task created:', { id: task.id, title: task.title, assigned_to: task.assigned_to });

            // Log activity
            await logActivity({
                organizationId: project.organization_id,
                userId: user.id,
                actionType: 'task_created',
                entityType: 'task',
                entityId: task.id,
                description: `created task "${title}"`,
                metadata: { projectId, status, assignedTo },
            });

            // If assigned to someone else, notify them
            if (assignedTo && assignedTo !== user.id) {
                console.log('🔔 Calling notifyTaskAssigned...');
                await notifyTaskAssigned({
                    taskId: task.id,
                    taskTitle: title,
                    assignedToUserId: assignedTo,
                    assignedByUserId: user.id,
                    organizationId: project.organization_id,
                });
            } else {
                console.log('⏭️  Not notifying - assigned to self or unassigned');
            }

            revalidatePath('/tasks');
            revalidatePath(`/projects/${projectId}`);
            return { success: true, message: 'Task created successfully' };
        } catch (error: any) {
            console.error('❌ Error creating task:', error);
            Sentry.captureException(error);
            return { success: false, message: error.message };
        }
    });
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