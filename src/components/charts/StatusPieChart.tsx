'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusPieChartProps {
    data: {
        todo: number;
        in_progress: number;
        done: number;
    };
}

const COLORS = {
    todo: '#9CA3AF',
    in_progress: '#3B82F6',
    done: '#10B981',
};

const LABELS = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
};

export default function StatusPieChart({ data }: StatusPieChartProps) {
    const chartData = Object.entries(data).map(([key, value]) => ({
        name: LABELS[key as keyof typeof LABELS],
        value,
        color: COLORS[key as keyof typeof COLORS],
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}