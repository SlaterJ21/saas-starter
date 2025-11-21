'use client';

import { useState, useTransition } from 'react';
import { inviteMemberByEmail } from '@/app/actions/team';
import { toast } from '@/lib/toast';

export default function InviteMemberForm() {
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await inviteMemberByEmail(email, role);

            if (result.success) {
                toast.success('Member invited!', result.message);
                setEmail('');
                setRole('member');
                setShowForm(false);
            } else {
                toast.error('Failed to invite member', result.message);
            }
        });
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
                + Invite Member
            </button>
        );
    }

    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite New Member</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="colleague@example.com"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        User must already have an account
                    </p>
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                        Role *
                    </label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                    >
                        {isPending ? 'Inviting...' : 'Send Invite'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}