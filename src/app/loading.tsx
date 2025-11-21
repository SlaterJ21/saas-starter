import DashboardLayout from '@/components/DashboardLayout';

export default function Loading() {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}