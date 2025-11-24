'use client';

import { useTasks } from '@/lib/hooks/use-tasks';
import { useSearch } from '@/lib/hooks/use-search';
import { useFilters } from '@/lib/hooks/use-filters';
import { usePagination } from '@/lib/hooks/use-pagination';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import FilterDropdown from '@/components/FilterDropdown';
import Pagination from '@/components/Pagination';
import { TaskCard } from '@/components/TaskCard';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    project_id: string;
    project_name: string;
    assigned_to?: string;
    assigned_to_name?: string;
    created_at: string;
    updated_at: string;
}

export default function TasksClientPage({ orgId }: { orgId: string }) {
    const { data: tasks = [], isLoading } = useTasks(orgId);

    // Cast to Task[] for type safety
    const typedTasks = tasks as Task[];

    // Search
    const {
        searchTerm,
        setSearchTerm,
        filteredItems: searchedTasks,
        isSearching,
    } = useSearch<Task>(typedTasks, ['title', 'description', 'project_name']);

    // Filters
    const {
        activeFilters,
        filteredItems: filteredTasks,
        setFilter,
        clearAllFilters,
        getActiveFilterCount,
    } = useFilters<Task>(searchedTasks);

    // Pagination
    const {
        items: paginatedTasks,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
        totalItems,
        itemsPerPage,
        goToPage,
    } = usePagination<Task>(filteredTasks, 12);

    // Group tasks by status
    const tasksByStatus = {
        todo: paginatedTasks.filter((t) => t.status === 'todo'),
        in_progress: paginatedTasks.filter((t) => t.status === 'in_progress'),
        done: paginatedTasks.filter((t) => t.status === 'done'),
    };

    // Get unique values for filters
    const projectOptions = Array.from(
        new Set(typedTasks.map((t) => t.project_name))
    ).map((name) => ({
        value: name,
        label: name,
        count: typedTasks.filter((t) => t.project_name === name).length,
    }));

    const assigneeOptions = Array.from(
        new Set(
            typedTasks
                .filter((t) => t.assigned_to_name)
                .map((t) => t.assigned_to_name as string)
        )
    ).map((name) => ({
        value: name,
        label: name,
        count: typedTasks.filter((t) => t.assigned_to_name === name).length,
    }));

    const statusOptions = [
        {
            value: 'todo',
            label: 'To Do',
            count: typedTasks.filter((t) => t.status === 'todo').length
        },
        {
            value: 'in_progress',
            label: 'In Progress',
            count: typedTasks.filter((t) => t.status === 'in_progress').length
        },
        {
            value: 'done',
            label: 'Done',
            count: typedTasks.filter((t) => t.status === 'done').length
        },
    ];

    // Get current filter values
    const selectedStatuses = (activeFilters.status as string[]) || [];
    const selectedProjects = (activeFilters.project_name as string[]) || [];
    const selectedAssignees = (activeFilters.assigned_to_name as string[]) || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search tasks by title, description, or project..."
                isSearching={isSearching}
            />

            {/* Filters */}
            <FilterBar
                activeCount={getActiveFilterCount()}
                onClearAll={clearAllFilters}
            >
                <FilterDropdown
                    label="Status"
                    options={statusOptions}
                    selectedValues={selectedStatuses}
                    onChange={(values) => setFilter('status', values as Task['status'][])}
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                />

                <FilterDropdown
                    label="Project"
                    options={projectOptions}
                    selectedValues={selectedProjects}
                    onChange={(values) => setFilter('project_name', values as string[])}
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    }
                />

                {assigneeOptions.length > 0 && (
                    <FilterDropdown
                        label="Assignee"
                        options={assigneeOptions}
                        selectedValues={selectedAssignees}
                        onChange={(values) => setFilter('assigned_to_name', values as string[])}
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    />
                )}
            </FilterBar>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {paginatedTasks.length} of {filteredTasks.length} tasks
            {searchTerm && ` matching "${searchTerm}"`}
        </span>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                    <div key={status} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 capitalize">
                                {status.replace('_', ' ')}
                            </h3>
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                {statusTasks.length}
              </span>
                        </div>

                        <div className="space-y-3">
                            {statusTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}

                            {statusTasks.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    No tasks
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    hasNextPage={hasNextPage}
                    hasPrevPage={hasPrevPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
}