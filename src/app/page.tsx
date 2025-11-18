import {auth0} from '@/lib/auth0';
import {db} from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import {getCurrentOrgId} from '@/lib/org/current';

export default async function Home() {
    const session = await auth0.getSession();
    const auth0User = session?.user;

    if (!auth0User) {
        return (
            <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">Welcome to SaaS Starter</h1>
                    <p className="text-gray-700 mb-6">
                        Multi-tenant platform with GraphQL API
                    </p>
                    <a
                        href="/auth/login"
                        className="block w-full text-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-bold shadow-lg"
                    >
                        Log In to Get Started
                    </a>
                </div>
            </main>
        );
    }

    const user = await db.findOrCreateUser(auth0User);
    const userOrgs = await db.getUserOrganizations(user.id);
    const currentOrgId = await getCurrentOrgId();
    const currentOrg = userOrgs.find(org => org.id === currentOrgId) || userOrgs[0];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user.name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-gray-700">
                        You're viewing <span className="font-semibold text-blue-600">{currentOrg?.name}</span>
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Organizations"
                        value={userOrgs.length}
                        icon="folder"
                        color="blue"
                    />
                    <StatCard
                        title="Projects"
                        value="0"
                        icon="check"
                        color="green"
                    />
                    <StatCard
                        title="Tasks"
                        value="0"
                        icon="list"
                        color="purple"
                    />
                </div>

                {/* Organizations List */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Your Organizations</h2>
                        <a
                            href="/organizations/new"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                        >
                            + New Organization
                        </a>
                    </div>

                    <div className="grid gap-3">
                        {userOrgs.map((org) => (
                            <div key={org.id}
                                 className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{org.name}</h3>
                                        <p className="text-gray-600 text-sm">/{org.slug}</p>
                                    </div>
                                    <span
                                        className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold uppercase">
                    {org.role}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({title, value, icon, color}: { title: string; value: string | number; icon: string; color: string }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
        purple: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div
                    className={`w-12 h-12 rounded-lg ${colors[color as keyof typeof colors]} flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}