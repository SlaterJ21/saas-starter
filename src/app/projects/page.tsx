import { requireAuth } from '@/app/auth/require-auth';
import { getCurrentOrgId } from '@/lib/org/current';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProjectsClientPage from './client-page';

export default async function ProjectsPage() {
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                        <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
                    </div>
                    <Link
                        href="/projects/new"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        + New Project
                    </Link>
                </div>

                <ProjectsClientPage orgId={currentOrgId} />
            </div>
        </DashboardLayout>
    );
}