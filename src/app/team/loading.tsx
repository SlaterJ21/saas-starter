import DashboardLayout from '@/components/DashboardLayout';

export default function TeamLoading() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div>
                    <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Members List Skeleton */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg">
                                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}