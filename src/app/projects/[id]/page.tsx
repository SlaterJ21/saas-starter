import {auth0} from '@/lib/auth0';
import {db} from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import {redirect, notFound} from 'next/navigation';
import Link from 'next/link';
import TaskStatusButtons from '@/components/TaskStatusButtons';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({params}: Props) {
    const {id} = await params;

    const session = await auth0.getSession();
    if (!session?.user) {
        redirect('/auth/login');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        redirect('/auth/login');
    }

    // Get project
    const project = await db.getProjectById(id);
    if (!project) {
        notFound();
    }

    // Get tasks for this project
    const tasks = await db.getTasksByProject(id);

    const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'todo'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        done: tasks.filter(t => t.status === 'done'),
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/projects" className="hover:text-blue-600 transition">
                        Projects
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{project.name}</span>
                </div>

                {/* Project Header */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {project.name}
                            </h1>
                            {project.description && (
                                <p className="text-gray-700 text-lg">
                                    {project.description}
                                </p>
                            )}
                        </div>
                        <Link
                            href={`/projects/${id}/edit`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                            Edit Project
                        </Link>
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <span>{project.organization_name}</span>
                        </div>
                        {project.creator_name && (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span>Created by {project.creator_name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Tasks"
                        value={tasks.length}
                        color="gray"
                    />
                    <StatCard
                        label="To Do"
                        value={tasksByStatus.todo.length}
                        color="gray"
                    />
                    <StatCard
                        label="In Progress"
                        value={tasksByStatus.in_progress.length}
                        color="blue"
                    />
                    <StatCard
                        label="Done"
                        value={tasksByStatus.done.length}
                        color="green"
                    />
                </div>

                {/* Add Task Button */}
                <div className="flex justify-end">
                    <Link
                        href="/tasks"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        + Add Task
                    </Link>
                </div>

                {/* Tasks by Status (Kanban) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TaskColumn
                        title="To Do"
                        tasks={tasksByStatus.todo}
                        color="gray"
                        projectId={id}
                    />
                    <TaskColumn
                        title="In Progress"
                        tasks={tasksByStatus.in_progress}
                        color="blue"
                        projectId={id}
                    />
                    <TaskColumn
                        title="Done"
                        tasks={tasksByStatus.done}
                        color="green"
                        projectId={id}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({label, value, color}: { label: string; value: number; color: string }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-700',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
    };

    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function TaskColumn({title, tasks, color, projectId}: {
    title: string;
    tasks: any[];
    color: string;
    projectId: string
}) {
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
                             className={`${colors[color as keyof typeof colors]} border-2 rounded-lg p-3 hover:shadow-md transition`}>
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm flex-1">
                                    {task.title}
                                </h4>
                                <Link
                                    href={`/tasks/${task.id}`}
                                    className="text-gray-500 hover:text-blue-600 transition ml-2"
                                    title="Edit task"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </Link>
                            </div>

                            {task.description && (
                                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                    {task.description}
                                </p>
                            )}

                            <div className="space-y-2">
                                <TaskStatusButtons taskId={task.id} currentStatus={task.status}/>

                                {task.assigned_to_name ? (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                        {task.assigned_to_name}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-xs">Unassigned</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}