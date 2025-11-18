'use client';

import { leaveOrganization } from '@/app/actions/settings';
import { useState } from 'react';

type Props = {
    orgName: string;
    isOwner: boolean;
    hasMultipleMembers: boolean;
};

export default function LeaveOrgButton({ orgName, isOwner, hasMultipleMembers }: Props) {
    const [isLeaving, setIsLeaving] = useState(false);

    async function handleLeave() {
        if (isOwner && hasMultipleMembers) {
            alert('You must transfer ownership or remove all other members before leaving.');
            return;
        }

        if (!confirm(`Are you sure you want to leave ${orgName}? You will need to be re-invited to rejoin.`)) {
            return;
        }

        setIsLeaving(true);
        try {
            await leaveOrganization();
        } catch (error) {
            console.error('Failed to leave:', error);
            alert(error instanceof Error ? error.message : 'Failed to leave organization');
            setIsLeaving(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleLeave}
            disabled={isLeaving || (isOwner && hasMultipleMembers)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLeaving ? 'Leaving...' : 'Leave'}
        </button>
    );
}