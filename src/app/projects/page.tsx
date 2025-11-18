import {auth0} from '@/lib/auth0';
import {db} from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import {getCurrentOrgId} from '@/lib/org/current';
import {redirect} from 'next/navigation';
import Link from 'next/link';

async function createProject(formData: FormData) {
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

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) {
        throw new Error('Name is required');
    }

    await db.createProject(currentOrgId, name, description || null, user.id);

    redirect('/projects');
}

export default async function ProjectsPage() {
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

    const projects = await db.getProjectsByOrganization(currentOrgId);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                        <p className="text-gray-600 mt-1">Manage your organization's projects</p>
                    </div>
                </div>

                {/* Create Project Form */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
                    <form action={createProject} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                placeholder="Website Redesign"
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
                                rows={3}
                                placeholder="Describe the project goals and scope..."
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            Create Project
                        </button>
                    </form>
                </div>

                {/* Projects List */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        All Projects ({projects.length})
                    </h2>

                    {projects.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                            <p className="text-gray-600 font-medium">No projects yet</p>
                            <p className="text-gray-500 text-sm mt-1">Create your first project above</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {projects.map((project) => (
                                <div key={project.id}
                                     className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                                                {project.name}
                                            </h3>
                                            {project.description && (
                                                <p className="text-gray-600 text-sm mb-3">
                                                    {project.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                            {project.task_count} tasks
                        </span>
                                                {project.creator_name && (
                                                    <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Created by {project.creator_name}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                                        >
                                            View →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}