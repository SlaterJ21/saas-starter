import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentOrgId } from '@/lib/org/current';
import DeleteTaskButton from '@/components/DeleteTaskButton';
import { TaskEditForm } from '@/components/TaskEditForm';
import {requireAuth} from "@/app/auth/require-auth";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function TaskEditPage({ params }: Props) {
    const { id } = await params;

    const { user } = await requireAuth();

    const task = await db.getTaskById(id);
    if (!task) {
        notFound();
    }

    const currentOrgId = await getCurrentOrgId();
    const orgMembers = currentOrgId ? await db.query(
        `SELECT u.id, u.name, u.email 
     FROM users u
     JOIN organization_members om ON u.id = om.user_id
     WHERE om.organization_id = $1
     ORDER BY u.name`,
        [currentOrgId]
    ) : { rows: [] };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/tasks" className="hover:text-blue-600 transition">
                        Tasks
                    </Link>
                    <span>/</span>
                    <Link href={`/projects/${task.project_id}`} className="hover:text-blue-600 transition">
                        {task.project_name}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Edit Task</span>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h1>
                    <TaskEditForm
                        task={task}
                        orgMembers={orgMembers.rows}
                        projectId={task.project_id}
                    />

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <DeleteTaskButton
                            taskId={id}
                            redirectTo={`/projects/${task.project_id}`}
                        />
                    </div>
                </div>

                {/* Task Metadata */}
                <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Task Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Project:</span> {task.project_name}
                        </div>
                        {task.created_by_name && (
                            <div>
                                <span className="font-medium">Created by:</span> {task.created_by_name}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Created:</span> {new Date(task.created_at).toLocaleString()}
                        </div>
                        <div>
                            <span className="font-medium">Last updated:</span> {new Date(task.updated_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}