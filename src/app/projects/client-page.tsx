'use client';

import { useProjects } from '@/lib/hooks/use-projects';
import { usePagination } from '@/lib/hooks/use-pagination';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

export default function ProjectsClientPage({ orgId }: { orgId: string }) {
    const { data: projects = [], isLoading, error } = useProjects(orgId);

    const {
        items: paginatedProjects,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
        totalItems,
        itemsPerPage,
        goToPage,
    } = usePagination(projects, 12);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <p className="text-red-900 font-semibold">Failed to load projects</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {paginatedProjects.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedProjects.map((project: any) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="block bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition group"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                    {project.name}
                                </h3>
                                {project.description && (
                                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                                )}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{project.task_count || 0} tasks</span>
                                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                    />
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">No projects yet</p>
                </div>
            )}
        </div>
    );
}