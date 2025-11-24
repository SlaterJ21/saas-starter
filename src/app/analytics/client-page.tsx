'use client';

import { useTasks } from '@/lib/hooks/use-tasks';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTaskAnalytics, useProjectAnalytics } from '@/lib/hooks/use-analytics';
import StatCard from '@/components/StatCard';
import StatusPieChart from '@/components/charts/StatusPieChart';
import TimelineChart from '@/components/charts/TimelineChart';
import ProjectBarChart from '@/components/charts/ProjectBarChart';

export default function AnalyticsClientPage({ orgId }: { orgId: string }) {
    const { data: tasks = [], isLoading: tasksLoading } = useTasks(orgId);
    const { data: projects = [], isLoading: projectsLoading } = useProjects(orgId);

    const taskAnalytics = useTaskAnalytics(tasks as any[]);
    const projectAnalytics = useProjectAnalytics(projects);

    const isLoading = tasksLoading || projectsLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">
                    Track your team's performance and productivity metrics
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tasks"
                    value={taskAnalytics.totalTasks}
                    subtitle="Across all projects"
                    color="blue"
                    icon="📋"
                />

                <StatCard
                    title="Completion Rate"
                    value={`${taskAnalytics.completionRate.toFixed(1)}%`}
                    subtitle={`${taskAnalytics.completedTasks} of ${taskAnalytics.totalTasks} completed`}
                    color="green"
                    icon="✅"
                />

                <StatCard
                    title="Active Projects"
                    value={projectAnalytics.activeProjects}
                    subtitle={`${projectAnalytics.totalProjects} total projects`}
                    color="purple"
                    icon="📁"
                />

                <StatCard
                    title="In Progress"
                    value={taskAnalytics.statusCounts.in_progress}
                    subtitle="Currently active tasks"
                    color="orange"
                    icon="🔄"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Status Distribution */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Task Status Distribution
                    </h3>
                    <StatusPieChart data={taskAnalytics.statusCounts} />
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Task Activity (Last 30 Days)
                    </h3>
                    <TimelineChart data={taskAnalytics.timelineData} />
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
                {/* Tasks by Project */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Tasks by Project
                    </h3>
                    <ProjectBarChart data={taskAnalytics.projectData} />
                </div>
            </div>

            {/* Top Performers */}
            {taskAnalytics.assigneeData.length > 0 && (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Team Performance
                    </h3>
                    <div className="space-y-3">
                        {taskAnalytics.assigneeData.map((assignee, index) => {
                            const completionRate =
                                (assignee.completed / assignee.count) * 100;

                            return (
                                <div
                                    key={assignee.name}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {assignee.name}
                      </span>
                                            <span className="text-sm text-gray-600">
                        {assignee.completed} / {assignee.count} completed
                      </span>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all"
                                                style={{ width: `${completionRate}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <span className="text-lg font-bold text-green-600">
                    {completionRate.toFixed(0)}%
                  </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}