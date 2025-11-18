import {auth0} from '@/lib/auth0';
import {db} from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import {getCurrentOrgId} from '@/lib/org/current';
import {redirect} from 'next/navigation';

async function createTask(formData: FormData) {
    'use server';

    const session = await auth0.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        throw new Error('User not found');
    }

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        throw new Error('No organization selected');
    }

    const projectId = formData.get('project_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;

    if (!projectId || !title || !status) {
        throw new Error('Project, title, and status are required');
    }

    await db.createTask(projectId, title, description || null, status, user.id);

    redirect('/tasks');
}

export default async function TasksPage() {
    const session = await auth0.getSession();

    if (!session?.user) {
        redirect('/auth/login');
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        redirect('/auth/login');
    }

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
                        <form action={createTask} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="project_id"
                                           className="block text-sm font-semibold text-gray-700 mb-2">
                                        Project *
                                    </label>
                                    <select
                                        id="project_id"
                                        name="project_id"
                                        required
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    >
                                        <option value="">Select a project</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        required
                                        defaultValue="todo"
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Task Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="Implement user authentication"
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
                                    rows={2}
                                    placeholder="Add more details about this task..."
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                Create Task
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                        <p className="text-yellow-900 font-semibold mb-2">
                            No projects found
                        </p>
                        <p className="text-yellow-700 text-sm">
                            <a href="/projects" className="underline font-medium">Create a project</a> first before
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