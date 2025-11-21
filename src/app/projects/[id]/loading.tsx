import DashboardLayout from '@/components/DashboardLayout';

export default function ProjectDetailLoading() {
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>

                {/* Header Skeleton */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>

                {/* Tasks Skeleton */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border border-gray-200 rounded-lg">
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}