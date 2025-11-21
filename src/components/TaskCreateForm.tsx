'use client';

import { useState, useTransition } from 'react';
import { createTask } from '@/app/actions/task';
import { toast } from '@/lib/toast';

export function TaskCreateForm({
                                   projects,
                                   currentOrgId
                               }: {
    projects: any[];
    currentOrgId: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [status, setStatus] = useState('todo');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createTask(formData);

            if (result.success) {
                toast.success('Task created!', result.message);
                setTitle('');
                setDescription('');
                setProjectId('');
                setStatus('todo');
            } else {
                toast.error('Failed to create task', result.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="organizationId" value={currentOrgId} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="project_id" className="block text-sm font-semibold text-gray-700 mb-2">
                        Project *
                    </label>
                    <select
                        id="project_id"
                        name="project_id"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        required
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                        Status *
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Implement user authentication"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Add more details about this task..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
                {isPending ? 'Creating...' : 'Create Task'}
            </button>
        </form>
    );
}