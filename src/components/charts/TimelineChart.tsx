'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface TimelineChartProps {
    data: Array<{
        date: string;
        created: number;
        completed: number;
    }>;
}

export default function TimelineChart({ data }: TimelineChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        dateLabel: format(parseISO(item.date), 'MMM d'),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Tasks Created"
                />
                <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Tasks Completed"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}