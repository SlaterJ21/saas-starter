import {db} from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import {getCurrentOrgId} from '@/lib/org/current';
import Link from "next/link";
import { TaskCreateForm } from '@/components/TaskCreateForm';
import {requireAuth} from "@/app/auth/require-auth";

export default async function TasksPage() {
    const { user } = await requireAuth();

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        return (
            <DashboardLayout>
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                    <p className="text-yellow-900 font-semibold">
                        Please select an organization first
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const tasks = await db.getTasksByOrganization(currentOrgId);
    const projects = await db.getProjectsByOrganization(currentOrgId);

    const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'todo'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        done: tasks.filter(t => t.status === 'done'),
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                        <p className="text-gray-600 mt-1">Track and manage your tasks</p>
                    </div>
                </div>

                {/* Create Task Form */}
                {projects.length > 0 ? (
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
                        <TaskCreateForm projects={projects} currentOrgId={currentOrgId} />
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                        <p className="text-yellow-900 font-semibold mb-2">
                            No projects found
                        </p>
                        <p className="text-yellow-700 text-sm">
                            <Link href="/projects" className="underline font-medium">Create a project</Link> first before
                            adding tasks
                        </p>
                    </div>
                )}

                {/* Tasks by Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TaskColumn
                        title="To Do"
                        tasks={tasksByStatus.todo}
                        color="gray"
                    />
                    <TaskColumn
                        title="In Progress"
                        tasks={tasksByStatus.in_progress}
                        color="blue"
                    />
                    <TaskColumn
                        title="Done"
                        tasks={tasksByStatus.done}
                        color="green"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

function TaskColumn({title, tasks, color}: { title: string; tasks: any[]; color: string }) {
    const colors = {
        gray: 'bg-gray-100 border-gray-300',
        blue: 'bg-blue-100 border-blue-300',
        green: 'bg-green-100 border-green-300',
    };

    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">{title}</h3>
                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm font-semibold">
          {tasks.length}
        </span>
            </div>

            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No tasks</p>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id}
                             className={`${colors[color as keyof typeof colors]} border-2 rounded-lg p-3`}>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                {task.title}
                            </h4>
                            {task.description && (
                                <p className="text-gray-600 text-xs mb-2">
                                    {task.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="font-medium">{task.project_name}</span>
                                {task.assigned_to_name && (
                                    <span>• {task.assigned_to_name}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}