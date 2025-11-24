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
                if (!values || values.length === 0) return true;

                const itemValue = item[key as keyof T];
                return values.includes(itemValue as any);
            });
        });
    }, [items, activeFilters]);

    const setFilter = <K extends keyof T>(key: K, values: T[K][]) => {
        setActiveFilters((prev) => ({
            ...prev,
            [key]: values.length > 0 ? values : undefined,
        }));
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
        return Object.values(activeFilters).filter(
            (values) => values && values.length > 0
        ).length;
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