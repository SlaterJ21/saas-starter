import { useMemo } from 'react';

interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    created_at: string;
    updated_at: string;
    project_name: string;
    assigned_to_name?: string;
}

export function useTaskAnalytics(tasks: Task[]) {
    const analytics = useMemo(() => {
        // Status distribution
        const statusCounts = {
            todo: tasks.filter((t) => t.status === 'todo').length,
            in_progress: tasks.filter((t) => t.status === 'in_progress').length,
            done: tasks.filter((t) => t.status === 'done').length,
        };

        // Completion rate
        const totalTasks = tasks.length;
        const completedTasks = statusCounts.done;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Tasks by project
        const tasksByProject = tasks.reduce((acc, task) => {
            const project = task.project_name || 'Unassigned';
            acc[project] = (acc[project] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const projectData = Object.entries(tasksByProject)
            .map(([name, count]) => ({
                name,
                count,
                completed: tasks.filter(
                    (t) => t.project_name === name && t.status === 'done'
                ).length,
            }))
            .sort((a, b) => b.count - a.count);

        // Tasks by assignee
        const tasksByAssignee = tasks.reduce((acc, task) => {
            const assignee = task.assigned_to_name || 'Unassigned';
            acc[assignee] = (acc[assignee] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const assigneeData = Object.entries(tasksByAssignee)
            .map(([name, count]) => ({
                name,
                count,
                completed: tasks.filter(
                    (t) => t.assigned_to_name === name && t.status === 'done'
                ).length,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10

        // Task creation timeline (last 30 days)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().split('T')[0];
        });

        const timelineData = last30Days.map((date) => {
            const tasksOnDate = tasks.filter((t) => {
                const taskDate = new Date(t.created_at).toISOString().split('T')[0];
                return taskDate === date;
            });

            return {
                date,
                created: tasksOnDate.length,
                completed: tasksOnDate.filter((t) => t.status === 'done').length,
            };
        });

        // Average time to completion (mock for now)
        const avgTimeToCompletion = 4.5; // days

        return {
            statusCounts,
            completionRate,
            projectData,
            assigneeData,
            timelineData,
            totalTasks,
            completedTasks,
            avgTimeToCompletion,
        };
    }, [tasks]);

    return analytics;
}

export function useProjectAnalytics(projects: any[]) {
    const analytics = useMemo(() => {
        const totalProjects = projects.length;
        const activeProjects = projects.filter((p) => p.task_count > 0).length;

        const projectsWithMostTasks = projects
            .sort((a, b) => (b.task_count || 0) - (a.task_count || 0))
            .slice(0, 5);

        return {
            totalProjects,
            activeProjects,
            projectsWithMostTasks,
        };
    }, [projects]);

    return analytics;
}