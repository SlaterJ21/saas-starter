'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    project_name: string;
    assigned_to_name?: string;
}

interface DraggableTaskCardProps {
    task: Task;
    isDragging?: boolean;
}

export default function DraggableTaskCard({ task, isDragging = false }: DraggableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const statusColors = {
        todo: 'bg-gray-100 border-gray-300',
        in_progress: 'bg-blue-50 border-blue-300',
        done: 'bg-green-50 border-green-300',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${statusColors[task.status]} border-2 rounded-lg p-4 hover:shadow-md transition cursor-grab active:cursor-grabbing ${
                isSortableDragging ? 'shadow-lg z-50' : ''
            }`}
            {...attributes}
            {...listeners}
        >
            <Link
                href={`/tasks/${task.id}`}
                className="block"
                onClick={(e) => {
                    // Prevent navigation while dragging
                    if (isSortableDragging) {
                        e.preventDefault();
                    }
                }}
            >
                <h4 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition">
                    {task.title}
                </h4>

                {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">
            {task.project_name}
          </span>

                    {task.assigned_to_name && (
                        <span className="text-gray-700 font-semibold">
              → {task.assigned_to_name}
            </span>
                    )}
                </div>
            </Link>
        </div>
    );
}