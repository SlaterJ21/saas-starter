import Link from 'next/link';

export const dynamic = 'force-dynamic';

type HealthCheck = {
    name: string;
    endpoint: string;
    status: 'checking' | 'healthy' | 'unhealthy';
    responseTime?: string;
    error?: string;
    details?: any;
};

async function checkHealth(endpoint: string): Promise<any> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}${endpoint}`, {
            cache: 'no-store',
        });
        const data = await response.json();
        return { ok: response.ok, data };
    } catch (error) {
        return {
            ok: false,
            data: {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Failed to connect'
            }
        };
    }
}

export default async function StatusPage() {
    // Run all health checks in parallel
    const [systemCheck, dbCheck, graphqlCheck] = await Promise.all([
        checkHealth('/api/health'),
        checkHealth('/api/health/db'),
        checkHealth('/api/health/graphql'),
    ]);

    const checks: HealthCheck[] = [
        {
            name: 'System',
            endpoint: '/api/health',
            status: systemCheck.ok ? 'healthy' : 'unhealthy',
            details: systemCheck.data,
        },
        {
            name: 'Database',
            endpoint: '/api/health/db',
            status: dbCheck.ok ? 'healthy' : 'unhealthy',
            details: dbCheck.data,
            responseTime: dbCheck.data?.database?.responseTime,
            error: dbCheck.data?.database?.error,
        },
        {
            name: 'GraphQL API',
            endpoint: '/api/health/graphql',
            status: graphqlCheck.ok ? 'healthy' : 'unhealthy',
            details: graphqlCheck.data,
            responseTime: graphqlCheck.data?.graphql?.responseTime,
            error: graphqlCheck.data?.graphql?.error,
        },
    ];

    const allHealthy = checks.every(check => check.status === 'healthy');

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">System Status</h1>
                    <p className="text-gray-700 text-lg">Real-time health monitoring</p>
                </div>

                {/* Overall Status */}
                <div className={`rounded-lg border-2 p-8 mb-8 ${
                    allHealthy
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400'
                        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400'
                }`}>
                    <div className="flex items-center justify-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                            allHealthy ? 'bg-green-600 animate-pulse' : 'bg-red-600'
                        }`} />
                        <h2 className={`text-2xl font-bold ${
                            allHealthy ? 'text-green-900' : 'text-red-900'
                        }`}>
                            {allHealthy ? 'All Systems Operational' : 'System Issues Detected'}
                        </h2>
                    </div>
                    <p className="text-center text-sm mt-2 text-gray-700 font-medium">
                        Last updated: {new Date().toLocaleString()}
                    </p>
                </div>

                {/* Individual Checks */}
                <div className="space-y-4">
                    {checks.map((check) => (
                        <div key={check.name} className="bg-white rounded-lg border-2 border-gray-300 p-6 hover:border-gray-400 transition shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${
                                        check.status === 'healthy' ? 'bg-green-600' :
                                            check.status === 'unhealthy' ? 'bg-red-600' :
                                                'bg-yellow-600 animate-pulse'
                                    }`} />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{check.name}</h3>
                                        <p className="text-sm text-gray-600 font-medium">{check.endpoint}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${
                      check.status === 'healthy' ? 'bg-green-600 text-white' :
                          check.status === 'unhealthy' ? 'bg-red-600 text-white' :
                              'bg-yellow-600 text-white'
                  }`}>
                    {check.status}
                  </span>
                                    {check.responseTime && (
                                        <p className="text-xs text-gray-600 mt-1 font-semibold">
                                            {check.responseTime}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {check.error && (
                                <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 rounded text-sm text-red-900 font-medium">
                                    <strong className="font-bold">Error:</strong> {check.error}
                                </div>
                            )}

                            {check.details && process.env.NODE_ENV === 'development' && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 font-semibold">
                                        View Details
                                    </summary>
                                    <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto text-gray-900 border border-gray-300">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                                </details>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center space-y-4">
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
                    >
                        ← Back to Dashboard
                    </Link>

                    <p className="text-gray-600 text-sm">
                        Monitoring powered by Sentry • Health checks every page load
                    </p>
                </div>
            </div>
        </div>
    );
}