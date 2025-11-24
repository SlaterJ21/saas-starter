'use client';

import { useState } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTasks, useUpdateTaskStatusMutation } from '@/lib/hooks/use-tasks';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTeamMembers } from '@/lib/hooks/use-team';
import { useSearch } from '@/lib/hooks/use-search';
import { useFilters } from '@/lib/hooks/use-filters';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useDragDrop } from '@/lib/hooks/use-drag-drop';
import { toast } from '@/lib/toast';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import FilterDropdown from '@/components/FilterDropdown';
import Pagination from '@/components/Pagination';
import DroppableColumn from '@/components/DroppableColumn';
import DraggableTaskCard from '@/components/DraggableTaskCard';
import DragOverlay from '@/components/DragOverlay';
import TaskCreateForm from '@/components/TaskCreateForm';

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
    const { data: tasks = [], isLoading: tasksLoading } = useTasks(orgId);
    const { data: projects = [], isLoading: projectsLoading } = useProjects(orgId);
    const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers(orgId);
    const updateTaskMutation = useUpdateTaskStatusMutation(orgId);
    const [showCreateForm, setShowCreateForm] = useState(false);

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
    } = usePagination<Task>(filteredTasks, 50);

    // Drag sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Drag & Drop
    const { activeId, handleDragStart, handleDragEnd, handleDragCancel } = useDragDrop({
        items: paginatedTasks,
        onReorder: (newItems) => {
            console.log('Reordered:', newItems);
        },
        onMove: async (taskId, newStatus) => {
            updateTaskMutation.mutate(
                { taskId, status: newStatus },
                {
                    onSuccess: () => {
                        toast.success('Task moved!', `Moved to ${newStatus.replace('_', ' ')}`);
                    },
                    onError: (error) => {
                        toast.error('Failed to move task', error.message);
                    },
                }
            );
        },
        getItemId: (item) => item.id,
        getItemStatus: (item) => item.status,
    });

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

    const selectedStatuses = (activeFilters.status as string[]) || [];
    const selectedProjects = (activeFilters.project_name as string[]) || [];
    const selectedAssignees = (activeFilters.assigned_to_name as string[]) || [];

    const isLoading = tasksLoading || projectsLoading || teamLoading;

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
            {/* Create Task Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showCreateForm ? 'Hide Form' : 'New Task'}
                </button>
            </div>

            {/* Create Task Form */}
            {showCreateForm && (
                <div className="bg-white rounded-lg border-2 border-blue-200 shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h3>
                    <TaskCreateForm
                        projects={projects}
                        teamMembers={teamMembers}
                        onSuccess={() => setShowCreateForm(false)}
                    />
                </div>
            )}

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

            {/* Help Text */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> Drag and drop tasks between columns to change their status!
                </p>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {paginatedTasks.length} of {filteredTasks.length} tasks
            {searchTerm && ` matching "${searchTerm}"`}
        </span>
            </div>

            {/* Drag & Drop Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DroppableColumn
                        id="todo"
                        title="To Do"
                        count={tasksByStatus.todo.length}
                        taskIds={tasksByStatus.todo.map((t) => t.id)}
                        color="gray"
                    >
                        {tasksByStatus.todo.map((task) => (
                            <DraggableTaskCard key={task.id} task={task} />
                        ))}
                    </DroppableColumn>

                    <DroppableColumn
                        id="in_progress"
                        title="In Progress"
                        count={tasksByStatus.in_progress.length}
                        taskIds={tasksByStatus.in_progress.map((t) => t.id)}
                        color="blue"
                    >
                        {tasksByStatus.in_progress.map((task) => (
                            <DraggableTaskCard key={task.id} task={task} />
                        ))}
                    </DroppableColumn>

                    <DroppableColumn
                        id="done"
                        title="Done"
                        count={tasksByStatus.done.length}
                        taskIds={tasksByStatus.done.map((t) => t.id)}
                        color="green"
                    >
                        {tasksByStatus.done.map((task) => (
                            <DraggableTaskCard key={task.id} task={task} />
                        ))}
                    </DroppableColumn>
                </div>

                <DragOverlay activeId={activeId} tasks={paginatedTasks} />
            </DndContext>

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