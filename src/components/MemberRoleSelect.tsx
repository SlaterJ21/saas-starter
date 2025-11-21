'use client';

import { useState, useTransition } from 'react';
import { updateMemberRole } from '@/app/actions/team';
import { toast } from '@/lib/toast';

export default function MemberRoleSelect({
                                             userId,
                                             currentRole,
                                         }: {
    userId: string;
    currentRole: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [optimisticRole, setOptimisticRole] = useState(currentRole);

    const handleRoleChange = (newRole: string) => {
        // Optimistic update
        const previousRole = optimisticRole;
        setOptimisticRole(newRole);

        startTransition(async () => {
            const result = await updateMemberRole(userId, newRole);

            if (result.success) {
                toast.success('Role updated!', result.message);
            } else {
                // Revert on error
                setOptimisticRole(previousRole);
                toast.error('Failed to update role', result.message);
            }
        });
    };

    const getRoleColor = (role: string) => {
        const colors = {
            owner: 'border-purple-300 bg-purple-50',
            admin: 'border-blue-300 bg-blue-50',
            member: 'border-green-300 bg-green-50',
            viewer: 'border-gray-300 bg-gray-50',
        };
        return colors[role as keyof typeof colors] || colors.viewer;
    };

    return (
        <select
            value={optimisticRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={isPending}
            className={`px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold disabled:opacity-50 transition-colors ${getRoleColor(optimisticRole)}`}
        >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
        </select>
    );
}