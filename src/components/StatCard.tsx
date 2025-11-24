interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
};

export default function StatCard({
                                     title,
                                     value,
                                     subtitle,
                                     icon,
                                     trend,
                                     color = 'blue',
                                 }: StatCardProps) {
    return (
        <div className={`${colorClasses[color]} border-2 rounded-lg p-6`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                {icon && <div className="text-4xl opacity-50">{icon}</div>}
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
          <span
              className={`font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
                    <span className="text-gray-600 ml-2">vs last period</span>
                </div>
            )}
        </div>
    );
}