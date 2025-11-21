'use client';

import { useState, useTransition } from 'react';
import { updateProfile } from '@/app/actions/settings';
import { toast } from '@/lib/toast';

export function SettingsProfileForm({ userName }: { userName: string | null }) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(userName || '');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await updateProfile(formData);

            if (result.success) {
                toast.success('Profile updated!', result.message);
            } else {
                toast.error('Failed to update profile', result.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
                {isPending ? 'Saving...' : 'Save Profile'}
            </button>
        </form>
    );
}