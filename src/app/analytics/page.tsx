import { requireAuth } from '@/app/auth/require-auth';
import { getCurrentOrgId } from '@/lib/org/current';
import DashboardLayout from '@/components/DashboardLayout';
import AnalyticsClientPage from './client-page';

export default async function AnalyticsPage() {
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
            <AnalyticsClientPage orgId={currentOrgId} />
        </DashboardLayout>
    );
}