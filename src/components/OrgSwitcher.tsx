'use client';

import {useState} from 'react';
import {switchOrganization} from '@/app/actions/org';

type Organization = {
    id: string;
    name: string;
    slug: string;
    role: string;
};

type Props = {
    organizations: Organization[];
    currentOrgId: string | null;
};

export default function OrgSwitcher({organizations, currentOrgId}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const currentOrg = organizations.find(org => org.id === currentOrgId) || organizations[0];

    if (!currentOrg) return null;

    async function handleSwitch(orgId: string) {
        setIsPending(true);
        try {
            await switchOrganization(orgId);
        } catch (error) {
            console.error('Failed to switch org:', error);
            setIsPending(false);
        }
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{currentOrg.name}</div>
                    <div className="text-sm text-gray-600">/{currentOrg.slug}</div>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            {isOpen && (
                <>
                {/* Backdrop to close dropdown */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                {/* Dropdown menu */}
                    <div
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                        <div className="p-2">
                            {organizations.map((org) => (
                                <button
                                    key={org.id}
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        if (org.id !== currentOrg.id) {
                                            handleSwitch(org.id);
                                        }
                                    }}
                                    disabled={isPending}
                                    className={`w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition ${
                                        org.id === currentOrg.id ? 'bg-blue-100 border-2 border-blue-400' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{org.name}</div>
                                            <div className="text-sm text-gray-600">/{org.slug}</div>
                                        </div>
                                        {org.id === currentOrg.id && (
                                            <svg className="w-5 h-5 text-blue-600" fill="currentColor"
                                                 viewBox="0 0 20 20">
                                                <path fillRule="evenodd"
                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 uppercase font-medium">{org.role}</div>
                                </button>
                            ))}
                        </div>

                        <div className="border-t-2 border-gray-200 p-2">
                            <a
                                href="/organizations/new"
                                className="flex items-center gap-2 w-full px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 4v16m8-8H4"/>
                                </svg>
                                Create Organization
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}