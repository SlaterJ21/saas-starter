'use client';

import { deleteOrganization } from '@/app/actions/settings';
import { useState } from 'react';

type Props = {
    orgName: string;
};

export default function DeleteOrgButton({ orgName }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleDelete() {
        if (confirmText !== orgName) {
            alert(`Please type "${orgName}" to confirm deletion`);
            return;
        }

        setIsDeleting(true);
        try {
            await deleteOrganization();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete organization');
            setIsDeleting(false);
        }
    }

    if (!showConfirm) {
        return (
            <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition font-semibold"
            >
                Delete Organization
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type "${orgName}" to confirm`}
                className="px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 w-64"
            />
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || confirmText !== orgName}
                    className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition font-semibold disabled:opacity-50"
                >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setShowConfirm(false);
                        setConfirmText('');
                    }}
                    disabled={isDeleting}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}