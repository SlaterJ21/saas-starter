'use client';

import { DragOverlay as DndKitDragOverlay } from '@dnd-kit/core';
import DraggableTaskCard from './DraggableTaskCard';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    project_name: string;
    assigned_to_name?: string;
}

interface DragOverlayProps {
    activeId: string | null;
    tasks: Task[];
}

export default function DragOverlay({ activeId, tasks }: DragOverlayProps) {
    const activeTask = tasks.find((t) => t.id === activeId);

    return (
        <DndKitDragOverlay>
            {activeTask ? (
                <div className="rotate-3 scale-105">
                    <DraggableTaskCard task={activeTask} isDragging />
                </div>
            ) : null}
        </DndKitDragOverlay>
    );
}