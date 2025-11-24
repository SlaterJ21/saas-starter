'use client';

import { useState, useTransition, useEffect } from 'react';
import { createTask } from '@/app/actions/task';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface TaskCreateFormProps {
    projects: any[];
    teamMembers?: any[];
    defaultProjectId?: string; // Add this prop
    onSuccess?: () => void;
}

export default function TaskCreateForm({
                                           projects,
                                           teamMembers = [],
                                           defaultProjectId,
                                           onSuccess
                                       }: TaskCreateFormProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedProject, setSelectedProject] = useState(defaultProjectId || '');
    const [selectedStatus, setSelectedStatus] = useState('todo');
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();

    // Update selected project when defaultProjectId changes
    useEffect(() => {
        if (defaultProjectId) {
            setSelectedProject(defaultProjectId);
        }
    }, [defaultProjectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('project_id', selectedProject);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('status', selectedStatus);
        if (selectedAssignee) {
            formData.append('assigned_to', selectedAssignee);
        }

        startTransition(async () => {
            const result = await createTask(formData);

            if (result.success) {
                toast.success('Task created!', result.message);
                // Reset form
                setTitle('');
                setDescription('');
                setSelectedProject(defaultProjectId || '');
                setSelectedStatus('todo');
                setSelectedAssignee('');

                // Force router refresh to get new data
                router.refresh();

                // Call success callback
                onSuccess?.();
            } else {
                toast.error('Failed to create task', result.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="project" className="block text-sm font-bold text-gray-900 mb-2">
                    Project *
                </label>
                <select
                    id="project"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    required
                    disabled={!!defaultProjectId}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="" className="text-gray-500">Select a project</option>
                    {projects.map((project) => (
                        <option key={project.id} value={project.id} className="text-gray-900">
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
                    Task Title *
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium placeholder:text-gray-400"
                    placeholder="Enter task title"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium placeholder:text-gray-400"
                    placeholder="Enter task description"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-bold text-gray-900 mb-2">
                        Status *
                    </label>
                    <select
                        id="status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                    >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="assignee" className="block text-sm font-bold text-gray-900 mb-2">
                        Assign To
                    </label>
                    <select
                        id="assignee"
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                    >
                        <option value="" className="text-gray-500">Unassigned</option>
                        {teamMembers.map((member) => (
                            <option key={member.user_id} value={member.user_id} className="text-gray-900">
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-md hover:shadow-lg"
                >
                    {isPending ? (
                        <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
                    ) : (
                        'Create Task'
                    )}
                </button>
            </div>
        </form>
    );
}