'use client';

import { removeMember } from '@/app/actions/team';
import { useState } from 'react';

type Props = {
    userId: string;
    userName: string;
};

export default function RemoveMemberButton({ userId, userName }: Props) {
    const [isRemoving, setIsRemoving] = useState(false);

    async function handleRemove() {
        if (!confirm(`Are you sure you want to remove ${userName} from this organization?`)) {
            return;
        }

        setIsRemoving(true);
        try {
            await removeMember(userId);
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert(error instanceof Error ? error.message : 'Failed to remove member');
            setIsRemoving(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50"
        >
            {isRemoving ? 'Removing...' : 'Remove'}
        </button>
    );
}