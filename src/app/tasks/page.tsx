import { requireAuth } from '@/app/auth/require-auth';
import { getCurrentOrgId } from '@/lib/org/current';
import DashboardLayout from '@/components/DashboardLayout';
import TasksClientPage from './client-page';

export default async function TasksPage() {
    await requireAuth();
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and track your team&apos;s tasks across projects
                    </p>
                </div>

                <TasksClientPage orgId={currentOrgId} />
            </div>
        </DashboardLayout>
    );
}