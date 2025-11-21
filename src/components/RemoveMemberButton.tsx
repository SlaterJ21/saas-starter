'use client';

import { useTransition } from 'react';
import { removeMember } from '@/app/actions/team';
import { toast } from '@/lib/toast';

export default function RemoveMemberButton({
                                               userId,
                                               userName,
                                           }: {
    userId: string;
    userName: string;
}) {
    const [isPending, startTransition] = useTransition();

    const handleRemove = () => {
        if (!confirm(`Remove ${userName} from this organization?`)) {
            return;
        }

        startTransition(async () => {
            const result = await removeMember(userId);

            if (result.success) {
                toast.success('Member removed', result.message);
            } else {
                toast.error('Failed to remove member', result.message);
            }
        });
    };

    return (
        <button
            onClick={handleRemove}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50"
        >
            {isPending ? 'Removing...' : 'Remove'}
        </button>
    );
}