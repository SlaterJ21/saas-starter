import {auth0} from '@/lib/auth0';
import {db} from '@/lib/db/client';
import OrgSwitcher from '@/components/OrgSwitcher';
import Avatar from '@/components/Avatar';
import {getCurrentOrgId} from '@/lib/org/current';

export default async function Home() {
    const session = await auth0.getSession();
    const auth0User = session?.user;

    let dbUser = null;
    let userOrgs = [];
    let currentOrg = null;

    if (auth0User) {
        try {
            dbUser = await db.findOrCreateUser(auth0User);
            userOrgs = await db.getUserOrganizations(dbUser.id);

            const currentOrgId = await getCurrentOrgId();
            currentOrg = userOrgs.find(org => org.id === currentOrgId) || userOrgs[0];
        } catch (error) {
            console.error('Error syncing user:', error);
        }
    }

    return (
        <main className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">
                        SaaS Starter Kit
                    </h1>
                    <p className="text-gray-700 mb-8 text-lg">
                        Multi-tenant platform with GraphQL API
                    </p>

                    {auth0User && dbUser ? (
                        <div className="space-y-6">
                            {/* User Info */}
                            <div
                                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        name={dbUser.name || 'User'}
                                        imageUrl={dbUser.avatar_url}
                                        size="lg"
                                    />
                                    <div>
                                        <p className="text-green-900 font-bold text-xl">
                                            {dbUser.name}
                                        </p>
                                        <p className="text-green-700 font-medium">{dbUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Organization Switcher */}
                            <div>
                                <h2 className="text-xl font-bold mb-3 text-gray-900">Current Organization</h2>
                                <OrgSwitcher
                                    organizations={userOrgs}
                                    currentOrgId={currentOrg?.id || null}
                                />
                            </div>

                            {/* Current Org Info */}
                            {currentOrg && (
                                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                    <p className="text-blue-900 font-semibold">
                                        You're viewing: {currentOrg.name}
                                    </p>
                                    <p className="text-blue-700 mt-1">
                                        Role: <span className="font-semibold uppercase">{currentOrg.role}</span>
                                    </p>
                                </div>
                            )}

                            {/* Organizations List */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">All Organizations</h2>
                                    <a
                                        href="/organizations/new"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold shadow-md"
                                    >
                                        + Create Organization
                                    </a>
                                </div>

                                <div className="grid gap-4">
                                    {userOrgs.map((org) => (
                                        <div key={org.id}
                                             className="border-2 border-gray-300 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{org.name}</h3>
                                                    <p className="text-gray-700 font-medium">/{org.slug}</p>
                                                </div>
                                                <span
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-bold uppercase">
                          {org.role}
                        </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <a
                                    href="/auth/logout"
                                    className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
                                >
                                    Log Out
                                </a>
                                <a
                                    href="http://localhost:5000/graphiql"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold shadow-md"
                                >
                                    Open GraphiQL →
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                                <p className="text-blue-900 text-lg font-semibold">
                                    🔐 Please log in to access your dashboard
                                </p>
                            </div>

                            <a
                                href="/auth/login"
                                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-bold shadow-lg"
                            >
                                Log In
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}