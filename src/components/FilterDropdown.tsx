'use client';

import {useState, useRef, useEffect} from 'react';

interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface FilterDropdownProps {
    label: string;
    options: FilterOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    icon?: React.ReactNode;
}

export default function FilterDropdown({
                                           label,
                                           options,
                                           selectedValues,
                                           onChange,
                                           icon,
                                       }: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const clearAll = () => {
        onChange([]);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-semibold transition ${
                    selectedValues.length > 0
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
                {icon}
                <span>{label}</span>
                {selectedValues.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            {selectedValues.length}
          </span>
                )}
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{label}</span>
                            {selectedValues.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2">
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);

                            return (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleOption(option.value)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="flex-1 text-sm text-gray-700">
                    {option.label}
                  </span>
                                    {option.count !== undefined && (
                                        <span className="text-xs text-gray-500 font-medium">
                      {option.count}
                    </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}