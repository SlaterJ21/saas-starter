import { requireAuth } from '@/app/auth/require-auth';
import { db } from '@/lib/db/client';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectClientPage from './client-page';

export default async function ProjectPage({
                                              params,
                                          }: {
    params: Promise<{ id: string }>;
}) {
    const { user } = await requireAuth();
    const { id } = await params;

    // Get project
    const project = await db.getProjectById(id);
    if (!project) {
        notFound();
    }

    // Get tasks for this project
    const tasks = await db.getTasksByProject(id);

    // Get team members
    const teamMembers = await db.getOrganizationMembers(project.organization_id);

    return (
        <DashboardLayout>
            <ProjectClientPage
                project={project}
                tasks={tasks}
                teamMembers={teamMembers}
            />
        </DashboardLayout>
    );
}