import DashboardLayout from '@/components/DashboardLayout';

export default function TaskEditLoading() {
    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>

                {/* Edit Form Skeleton */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>

                    <div className="space-y-6">
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}