import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProjects(orgId: string | null) {
    return useQuery({
        queryKey: ['projects', orgId],
        queryFn: async () => {
            if (!orgId) return [];

            const response = await fetch(`/api/projects?orgId=${orgId}`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            return response.json();
        },
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProject(projectId: string | null) {
    return useQuery({
        queryKey: ['projects', projectId],
        queryFn: async () => {
            if (!projectId) return null;

            const response = await fetch(`/api/projects/${projectId}`);
            if (!response.ok) throw new Error('Failed to fetch project');
            return response.json();
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}