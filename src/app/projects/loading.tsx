export default function ProjectsLoading() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-6">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}