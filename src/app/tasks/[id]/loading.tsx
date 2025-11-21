export default function TaskEditLoading() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2">
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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex gap-3">
                            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Metadata Skeleton */}
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                <div className="h-5 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}