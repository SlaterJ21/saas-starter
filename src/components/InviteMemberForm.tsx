'use client';

import { inviteMemberByEmail } from '@/app/actions/team';
import { useState } from 'react';

export default function InviteMemberForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const email = formData.get('email') as string;
        const role = formData.get('role') as string;

        try {
            await inviteMemberByEmail(email, role);
            setSuccess(`Successfully invited ${email} as ${role}`);

            // Reset form
            const form = document.getElementById('invite-form') as HTMLFormElement;
            if (form) form.reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to invite member');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite Team Member</h2>

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <p className="text-green-800 font-semibold">✓ {success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="text-red-800 font-semibold">✕ {error}</p>
                    {error.includes('not found') && (
                        <p className="text-red-700 text-sm mt-2">
                            The user must create an account first before they can be invited.
                        </p>
                    )}
                </div>
            )}

            <form id="invite-form" action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="colleague@example.com"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            User must have an account already
                        </p>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                            Role *
                        </label>
                        <select
                            id="role"
                            name="role"
                            required
                            defaultValue="member"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:opacity-50"
                        >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                >
                    {isSubmitting ? 'Sending Invite...' : 'Send Invite'}
                </button>
            </form>
        </div>
    );
}