export default function TasksLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>

            {/* Create Form Skeleton */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
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
                                <div key={i} className="bg-gray-100 border-2 border-gray-200 rounded-lg p-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}