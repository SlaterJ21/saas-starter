import { useState, useMemo } from 'react';
import { useDebounce } from './use-debounce';

export function useSearch<T>(
    items: T[],
    searchKeys: (keyof T)[],
    debounceMs: number = 300
) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, debounceMs);

    const filteredItems = useMemo(() => {
        if (!debouncedSearch.trim()) return items;

        const lowerSearch = debouncedSearch.toLowerCase();

        return items.filter((item) => {
            return searchKeys.some((key) => {
                const value = item[key];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowerSearch);
                }
                return false;
            });
        });
    }, [items, debouncedSearch, searchKeys]);

    return {
        searchTerm,
        setSearchTerm,
        filteredItems,
        isSearching: searchTerm !== debouncedSearch,
    };
}