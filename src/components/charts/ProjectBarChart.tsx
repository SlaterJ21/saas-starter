'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface ProjectBarChartProps {
    data: Array<{
        name: string;
        count: number;
        completed: number;
    }>;
}

export default function ProjectBarChart({ data }: ProjectBarChartProps) {
    // Take top 8 projects
    const topProjects = data.slice(0, 8);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProjects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Total Tasks" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
            </BarChart>
        </ResponsiveContainer>
    );
}