import DashboardLayout from '@/components/DashboardLayout';

export default function TasksLoading() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                </div>

                {/* Kanban Columns Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['To Do', 'In Progress', 'Done'].map((title) => (
                        <div key={title} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                                <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}