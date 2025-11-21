import {db} from '@/lib/db/client';
import {getCurrentOrgId} from '@/lib/org/current';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import * as Sentry from '@sentry/nextjs';
import {requireAuth} from "@/app/auth/require-auth";

const { logger } = Sentry;

export default async function Home() {
    return Sentry.startSpan(
        {
            op: 'page.load',
            name: 'Dashboard Page',
        },
        async (span) => {
            const pageStartTime = Date.now();

            const { user } = await requireAuth();

            // Track database query performance
            const dbStartTime = Date.now();
            const dbDuration = Date.now() - dbStartTime;

            span?.setAttribute('db.user_lookup_ms', dbDuration);

            const userOrgs = await db.getUserOrganizations(user.id);
            const currentOrgId = await getCurrentOrgId();
            const currentOrg = userOrgs.find(org => org.id === currentOrgId) || userOrgs[0];

            // Fetch actual counts with performance tracking
            let projectCount = 0;
            let taskCount = 0;
            let teamMemberCount = 0;
            let recentProjects: any[] = [];
            let recentTasks: any[] = [];

            let projectsLoadTime = 0;
            let tasksLoadTime = 0;
            let teamLoadTime = 0;

            if (currentOrgId) {
                // Track projects query
                const projectsStart = Date.now();
                const projects = await db.getProjectsByOrganization(currentOrgId);
                projectsLoadTime = Date.now() - projectsStart;
                projectCount = projects.length;
                recentProjects = projects.slice(0, 3);

                // Track tasks query
                const tasksStart = Date.now();
                const tasks = await db.getTasksByOrganization(currentOrgId);
                tasksLoadTime = Date.now() - tasksStart;
                taskCount = tasks.length;
                recentTasks = tasks.slice(0, 5);

                // Track team query
                const teamStart = Date.now();
                const members = await db.getOrganizationMembers(currentOrgId);
                teamLoadTime = Date.now() - teamStart;
                teamMemberCount = members.length;

                span?.setAttribute('db.projects_query_ms', projectsLoadTime);
                span?.setAttribute('db.tasks_query_ms', tasksLoadTime);
                span?.setAttribute('db.team_query_ms', teamLoadTime);
            }

            const totalPageLoadTime = Date.now() - pageStartTime;

            logger.info('Dashboard page loaded', {
                userId: user.id,
                orgId: currentOrgId,
                projectCount,
                taskCount,
                teamMemberCount,
                performance: {
                    total: `${totalPageLoadTime}ms`,
                    dbUserLookup: `${dbDuration}ms`,
                    projectsQuery: `${projectsLoadTime}ms`,
                    tasksQuery: `${tasksLoadTime}ms`,
                    teamQuery: `${teamLoadTime}ms`,
                },
            });

            return (
                <DashboardLayout>
                    <div className="space-y-6">
                        {/* Welcome Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user.name?.split(' ')[0] || 'there'}!
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {currentOrg ? `Managing ${currentOrg.name}` : 'Select an organization to get started'}
                            </p>
                        </div>

                        {currentOrgId ? (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Projects"
                                        value={projectCount}
                                        icon="folder"
                                        color="blue"
                                        href="/projects"
                                        loadTime={projectsLoadTime}
                                    />
                                    <StatCard
                                        title="Tasks"
                                        value={taskCount}
                                        icon="check"
                                        color="purple"
                                        href="/tasks"
                                        loadTime={tasksLoadTime}
                                    />
                                    <StatCard
                                        title="Team Members"
                                        value={teamMemberCount}
                                        icon="users"
                                        color="green"
                                        href="/team"
                                        loadTime={teamLoadTime}
                                    />
                                    <StatCard
                                        title="Organizations"
                                        value={userOrgs.length}
                                        icon="building"
                                        color="orange"
                                        href="/organizations/new"
                                    />
                                </div>

                                {/* Recent Activity Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Recent Projects */}
                                    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                                            <Link href="/projects" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                                View all →
                                            </Link>
                                        </div>
                                        {recentProjects.length > 0 ? (
                                            <div className="space-y-3">
                                                {recentProjects.map((project) => (
                                                    <Link
                                                        key={project.id}
                                                        href={`/projects/${project.id}`}
                                                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                                    >
                                                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {project.task_count} tasks • Created {new Date(project.created_at).toLocaleDateString()}
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">No projects yet</p>
                                        )}
                                    </div>

                                    {/* Recent Tasks */}
                                    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
                                            <Link href="/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                                View all →
                                            </Link>
                                        </div>
                                        {recentTasks.length > 0 ? (
                                            <div className="space-y-2">
                                                {recentTasks.map((task) => (
                                                    <Link
                                                        key={task.id}
                                                        href={`/tasks/${task.id}`}
                                                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                task.status === 'done' ? 'bg-green-100 text-green-700' :
                                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                            }`}>
                                {task.status.replace('_', ' ')}
                              </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-1">{task.project_name}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">No tasks yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Performance Metrics (Dev Only) */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-purple-900 mb-3">⚡ Performance Metrics (Dev)</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <Metric label="Total Load" value={`${totalPageLoadTime}ms`} />
                                            <Metric label="User Lookup" value={`${dbDuration}ms`} />
                                            <Metric label="Projects" value={`${projectsLoadTime}ms`} />
                                            <Metric label="Tasks" value={`${tasksLoadTime}ms`} />
                                            <Metric label="Team" value={`${teamLoadTime}ms`} />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-8 text-center">
                                <h2 className="text-2xl font-bold text-yellow-900 mb-2">No Organization Selected</h2>
                                <p className="text-yellow-800 mb-4">Create or select an organization to get started</p>
                                <Link
                                    href="/organizations/new"
                                    className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold"
                                >
                                    Create Organization
                                </Link>
                            </div>
                        )}
                    </div>
                </DashboardLayout>
            );
        }
    );
}

function StatCard({
                      title,
                      value,
                      icon,
                      color,
                      href,
                      loadTime,
                  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    href: string;
    loadTime?: number;
}) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600',
    };

    const icons = {
        folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
        check: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    };

    return (
        <Link href={href} className="block">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-lg flex items-center justify-center`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon as keyof typeof icons]} />
                        </svg>
                    </div>
                    {loadTime !== undefined && process.env.NODE_ENV === 'development' && (
                        <span className="text-xs text-gray-500 font-mono">{loadTime}ms</span>
                    )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                <div className="text-gray-600 font-medium">{title}</div>
            </div>
        </Link>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-gray-600 mb-1">{label}</div>
            <div className="text-lg font-bold text-purple-900 font-mono">{value}</div>
        </div>
    );
}