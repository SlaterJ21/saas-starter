import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { updateTask, deleteTask } from '@/app/actions/task';
import { getCurrentOrgId } from '@/lib/org/current';
import DeleteTaskButton from '@/components/DeleteTaskButton';


type Props = {
    params: Promise<{ id: string }>;
};

export default async function TaskEditPage({ params }: Props) {
    const { id } = await params;

    const session = await auth0.getSession();
    if (!session?.user) {
        redirect('/auth/login');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        redirect('/auth/login');
    }

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

                    <form action={updateTask.bind(null, id)} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                Task Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                defaultValue={task.title}
                                required
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                defaultValue={task.description || ''}
                                rows={4}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status *
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={task.status}
                                    required
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="assigned_to" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Assign To
                                </label>
                                <select
                                    id="assigned_to"
                                    name="assigned_to"
                                    defaultValue={task.assigned_to || ''}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                >
                                    <option value="">Unassigned</option>
                                    {orgMembers.rows.map((member: any) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                                >
                                    Save Changes
                                </button>
                                <Link
                                    href={`/projects/${task.project_id}`}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                >
                                    Cancel
                                </Link>
                            </div>

                            <DeleteTaskButton
                                taskId={id}
                                redirectTo={`/projects/${task.project_id}`}
                            />
                        </div>
                    </form>
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