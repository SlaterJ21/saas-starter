import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTeamMembers(orgId: string | null) {
    return useQuery({
        queryKey: ['team', orgId],
        queryFn: async () => {
            if (!orgId) return [];

            const response = await fetch(`/api/team?orgId=${orgId}`);
            if (!response.ok) throw new Error('Failed to fetch team');
            return response.json();
        },
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateMemberRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const response = await fetch(`/api/team/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) throw new Error('Failed to update role');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team'] });
        },
    });
}