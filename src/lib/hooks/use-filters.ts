import { useState, useMemo } from 'react';

export type FilterConfig<T> = {
    [K in keyof T]?: T[K][];
};

export function useFilters<T>(items: T[]) {
    const [activeFilters, setActiveFilters] = useState<FilterConfig<T>>({});

    const filteredItems = useMemo(() => {
        if (Object.keys(activeFilters).length === 0) return items;

        return items.filter((item) => {
            return Object.entries(activeFilters).every(([key, values]) => {
                // Type guard to ensure values is an array
                if (!values || !Array.isArray(values) || values.length === 0) {
                    return true;
                }

                const itemValue = item[key as keyof T];
                return (values as any[]).includes(itemValue);
            });
        });
    }, [items, activeFilters]);

    const setFilter = <K extends keyof T>(key: K, values: T[K][]) => {
        setActiveFilters((prev) => {
            if (values.length === 0) {
                // Remove filter if empty
                const newFilters = { ...prev };
                delete newFilters[key];
                return newFilters;
            }

            return {
                ...prev,
                [key]: values,
            };
        });
    };

    const clearFilter = (key: keyof T) => {
        setActiveFilters((prev) => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setActiveFilters({});
    };

    const getActiveFilterCount = () => {
        return Object.values(activeFilters).filter((values) => {
            // Type guard to ensure values is an array with length
            return Array.isArray(values) && values.length > 0;
        }).length;
    };

    return {
        activeFilters,
        filteredItems,
        setFilter,
        clearFilter,
        clearAllFilters,
        getActiveFilterCount,
    };
}