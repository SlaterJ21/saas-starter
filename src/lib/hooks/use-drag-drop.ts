import { useState } from 'react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

interface UseDragDropProps<T> {
    items: T[];
    onReorder: (items: T[]) => void;
    onMove?: (itemId: string, newStatus: string) => void;
    getItemId: (item: T) => string;
    getItemStatus: (item: T) => string;
}

export function useDragDrop<T>({
                                   items,
                                   onReorder,
                                   onMove,
                                   getItemId,
                                   getItemStatus,
                               }: UseDragDropProps<T>) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Check if dropped on a status column
        if (overId.startsWith('column-')) {
            const newStatus = overId.replace('column-', '');
            const activeItem = items.find((item) => getItemId(item) === activeId);

            if (activeItem && getItemStatus(activeItem) !== newStatus) {
                onMove?.(activeId, newStatus);
            }
            return;
        }

        // Reorder within same column
        if (activeId !== overId) {
            const oldIndex = items.findIndex((item) => getItemId(item) === activeId);
            const newIndex = items.findIndex((item) => getItemId(item) === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = [...items];
                const [removed] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, removed);
                onReorder(newItems);
            }
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    return {
        activeId,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
    };
}