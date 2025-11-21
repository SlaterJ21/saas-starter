'use client';

import { useTransition } from 'react';
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

    const handleRoleChange = (newRole: string) => {
        startTransition(async () => {
            const result = await updateMemberRole(userId, newRole);

            if (result.success) {
                toast.success('Role updated!', result.message);
            } else {
                toast.error('Failed to update role', result.message);
            }
        });
    };

    return (
        <select
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={isPending}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold disabled:opacity-50"
        >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
        </select>
    );
}