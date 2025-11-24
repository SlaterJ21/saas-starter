import { db } from './db/client';

export const NotificationType = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_COMPLETED: 'task_completed',
    TASK_UPDATED: 'task_updated',
    COMMENT_ADDED: 'comment_added',
    MENTION: 'mention',
    PROJECT_CREATED: 'project_created',
    MEMBER_ADDED: 'member_added',
} as const;

export async function notifyTaskAssigned(params: {
    taskId: string;
    taskTitle: string;
    assignedToUserId: string;
    assignedByUserId: string;
    organizationId: string;
}) {
    console.log('🔔 notifyTaskAssigned called with:', params);

    try {
        const notification = await db.createNotification({
            userId: params.assignedToUserId,
            organizationId: params.organizationId,
            type: NotificationType.TASK_ASSIGNED,
            title: 'New task assigned',
            message: `You were assigned to "${params.taskTitle}"`,
            link: `/tasks/${params.taskId}`,
            createdBy: params.assignedByUserId,
            metadata: { taskId: params.taskId },
        });
        console.log('✅ Notification created:', notification);
    } catch (error) {
        console.error('❌ Error creating task assigned notification:', error);
    }
}

export async function notifyTaskCompleted(params: {
    taskId: string;
    taskTitle: string;
    completedByUserId: string;
    projectOwnerId: string;
    organizationId: string;
}) {
    console.log('🔔 notifyTaskCompleted called with:', params);

    // Don't notify yourself
    if (params.completedByUserId === params.projectOwnerId) {
        console.log('⏭️  Skipping notification - user completed their own task');
        return;
    }

    try {
        const notification = await db.createNotification({
            userId: params.projectOwnerId,
            organizationId: params.organizationId,
            type: NotificationType.TASK_COMPLETED,
            title: 'Task completed',
            message: `"${params.taskTitle}" was marked as complete`,
            link: `/tasks/${params.taskId}`,
            createdBy: params.completedByUserId,
            metadata: { taskId: params.taskId },
        });
        console.log('✅ Notification created:', notification);
    } catch (error) {
        console.error('❌ Error creating task completed notification:', error);
    }
}

export async function logActivity(params: {
    organizationId: string;
    userId: string;
    actionType: string;
    entityType: string;
    entityId?: string;
    description: string;
    metadata?: any;
}) {
    try {
        await db.createActivity(params);
        console.log('✅ Activity logged:', params.description);
    } catch (error) {
        console.error('❌ Error logging activity:', error);
    }
}