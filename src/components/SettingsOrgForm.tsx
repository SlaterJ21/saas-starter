'use client';

import { useState, useTransition } from 'react';
import { updateOrganizationSettings } from '@/app/actions/settings';
import { toast } from '@/lib/toast';

export function SettingsOrgForm({
                                    orgName,
                                    orgSlug
                                }: {
    orgName: string;
    orgSlug: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(orgName);
    const [slug, setSlug] = useState(orgSlug);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await updateOrganizationSettings(formData);

            if (result.success) {
                toast.success('Organization updated!', result.message);
            } else {
                toast.error('Failed to update organization', result.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="org-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Name
                </label>
                <input
                    type="text"
                    id="org-name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
            </div>

            <div>
                <label htmlFor="org-slug" className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Slug
                </label>
                <input
                    type="text"
                    id="org-slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    pattern="[a-z0-9-]+"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Lowercase letters, numbers, and hyphens only
                </p>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
                {isPending ? 'Saving...' : 'Save Organization'}
            </button>
        </form>
    );
}