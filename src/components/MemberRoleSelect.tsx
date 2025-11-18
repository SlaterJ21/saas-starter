'use client';

import { updateMemberRole } from '@/app/actions/team';
import { useState } from 'react';

type Props = {
    userId: string;
    currentRole: string;
};

export default function MemberRoleSelect({ userId, currentRole }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRoleChange(newRole: string) {
        if (newRole === currentRole || isUpdating) return;

        setIsUpdating(true);
        setError(null);

        try {
            await updateMemberRole(userId, newRole);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update role');
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div>
            <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={isUpdating}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-semibold uppercase text-sm disabled:opacity-50"
            >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
            </select>
            {error && (
                <p className="text-red-600 text-xs mt-1">{error}</p>
            )}
        </div>
    );
}