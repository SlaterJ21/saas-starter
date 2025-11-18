'use server';

import { db } from '@/lib/db/client';
import { auth0 } from '@/lib/auth0';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateTaskStatus(taskId: string, newStatus: string) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    await db.updateTaskStatus(taskId, newStatus);

    // Revalidate all pages that might show this task
    revalidatePath('/tasks');
    revalidatePath('/projects/[id]', 'page');
    revalidatePath('/');
}

export async function deleteTask(taskId: string, redirectTo?: string) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    await db.deleteTask(taskId);

    revalidatePath('/tasks');
    revalidatePath('/projects/[id]', 'page');
    revalidatePath('/');

    if (redirectTo) {
        redirect(redirectTo);
    }
}

export async function updateTask(taskId: string, formData: FormData) {
    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
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
}