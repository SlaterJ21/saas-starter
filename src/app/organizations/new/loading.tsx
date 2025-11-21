export default function NewOrgLoading() {
    return (
        <main className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>

                    <div className="space-y-6">
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-12 w-48 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-12 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}