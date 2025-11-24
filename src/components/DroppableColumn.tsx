'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableColumnProps {
    id: string;
    title: string;
    count: number;
    children: React.ReactNode;
    taskIds: string[];
    color?: 'gray' | 'blue' | 'green';
}

const colorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
};

export default function DroppableColumn({
                                            id,
                                            title,
                                            count,
                                            children,
                                            taskIds,
                                            color = 'gray',
                                        }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${id}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={`${colorClasses[color]} border-2 rounded-lg p-4 transition-colors ${
                isOver ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
            }`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg capitalize">
                    {title}
                </h3>
                <span className="bg-white border-2 border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
          {count}
        </span>
            </div>

            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 min-h-[200px]">
                    {children}

                    {count === 0 && !isOver && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            Drop tasks here
                        </div>
                    )}

                    {isOver && (
                        <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 bg-blue-50 text-center text-blue-600 font-semibold">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}