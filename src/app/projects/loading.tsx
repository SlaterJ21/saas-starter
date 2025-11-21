import DashboardLayout from '@/components/DashboardLayout';

export default function ProjectsLoading() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div>
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>

                {/* Projects Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-6">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}