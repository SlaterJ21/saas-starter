import DashboardLayout from '@/components/DashboardLayout';

export default function SettingsLoading() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div>
                    <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>

                {/* Profile Section Skeleton */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-24 mb-6 animate-pulse"></div>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Organization Section Skeleton */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}