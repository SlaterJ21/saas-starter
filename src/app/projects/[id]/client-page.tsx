'use client';

import { useState } from 'react';
import Link from 'next/link';
import TaskCreateForm from '@/components/TaskCreateForm';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    assigned_to_name?: string;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    creator_name?: string;
}

interface ProjectClientPageProps {
    project: Project;
    tasks: Task[];
    teamMembers: any[];
}

export default function ProjectClientPage({
                                              project,
                                              tasks,
                                              teamMembers,
                                          }: ProjectClientPageProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Group tasks by status
    const tasksByStatus = {
        todo: tasks.filter((t) => t.status === 'todo'),
        in_progress: tasks.filter((t) => t.status === 'in_progress'),
        done: tasks.filter((t) => t.status === 'done'),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href="/projects"
                        className="text-blue-600 hover:text-blue-700 font-semibold mb-2 inline-block"
                    >
                        ← Back to Projects
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    {project.description && (
                        <p className="text-gray-600 mt-2">{project.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Created by <strong>{project.creator_name}</strong>
            </span>
                        <span>•</span>
                        <span>{tasks.length} tasks</span>
                    </div>
                </div>

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
                        projects={[project]}
                        teamMembers={teamMembers}
                        defaultProjectId={project.id}
                        onSuccess={() => setShowCreateForm(false)}
                    />
                </div>
            )}

            {/* Tasks Board */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* To Do */}
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">To Do</h3>
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                {tasksByStatus.todo.length}
              </span>
                        </div>
                        <div className="space-y-3">
                            {tasksByStatus.todo.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/tasks/${task.id}`}
                                    className="block bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-md transition"
                                >
                                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                    {task.assigned_to_name && (
                                        <div className="text-xs text-gray-500 font-medium">
                                            → {task.assigned_to_name}
                                        </div>
                                    )}
                                </Link>
                            ))}
                            {tasksByStatus.todo.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-8">No tasks</p>
                            )}
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">In Progress</h3>
                            <span className="bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                {tasksByStatus.in_progress.length}
              </span>
                        </div>
                        <div className="space-y-3">
                            {tasksByStatus.in_progress.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/tasks/${task.id}`}
                                    className="block bg-white border-2 border-blue-300 rounded-lg p-4 hover:shadow-md transition"
                                >
                                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                    {task.assigned_to_name && (
                                        <div className="text-xs text-gray-500 font-medium">
                                            → {task.assigned_to_name}
                                        </div>
                                    )}
                                </Link>
                            ))}
                            {tasksByStatus.in_progress.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-8">No tasks</p>
                            )}
                        </div>
                    </div>

                    {/* Done */}
                    <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Done</h3>
                            <span className="bg-green-200 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                {tasksByStatus.done.length}
              </span>
                        </div>
                        <div className="space-y-3">
                            {tasksByStatus.done.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/tasks/${task.id}`}
                                    className="block bg-white border-2 border-green-300 rounded-lg p-4 hover:shadow-md transition"
                                >
                                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                    {task.assigned_to_name && (
                                        <div className="text-xs text-gray-500 font-medium">
                                            → {task.assigned_to_name}
                                        </div>
                                    )}
                                </Link>
                            ))}
                            {tasksByStatus.done.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-8">No tasks</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}