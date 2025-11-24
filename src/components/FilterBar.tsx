'use client';

interface FilterBarProps {
    children: React.ReactNode;
    activeCount: number;
    onClearAll: () => void;
}

export default function FilterBar({
                                      children,
                                      activeCount,
                                      onClearAll,
                                  }: FilterBarProps) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            {children}

            {activeCount > 0 && (
                <button
                    onClick={onClearAll}
                    className="text-sm text-gray-600 hover:text-gray-900 font-semibold underline"
                >
                    Clear all filters
                </button>
            )}
        </div>
    );
}