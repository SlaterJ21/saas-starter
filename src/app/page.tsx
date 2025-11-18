import {auth0} from '@/lib/auth0';
import {db} from '@/lib/db/client';

export default async function Home() {
    const session = await auth0.getSession();
    const auth0User = session?.user;

    let dbUser = null;
    if (auth0User) {
        try {
            dbUser = await db.findOrCreateUser(auth0User);
        } catch (error) {
            console.error('Error syncing user:', error);
        }
    }

    return (
        <main className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-4xl font-bold mb-2">
                        SaaS Starter Kit
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Multi-tenant platform with GraphQL API
                    </p>

                    {auth0User && dbUser ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="flex items-center gap-4">
                                    {dbUser.avatar_url && (
                                        <img
                                            src={dbUser.avatar_url}
                                            alt={dbUser.name || 'User'}
                                            className="w-16 h-16 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <p className="text-green-800 font-semibold text-lg">
                                            ✅ {dbUser.name}
                                        </p>
                                        <p className="text-sm text-green-600">{dbUser.email}</p>
                                        <p className="text-xs text-green-500 mt-1 font-mono">
                                            ID: {dbUser.id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href="/auth/logout"
                                    className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                                >
                                    Log Out
                                </a>
                                <a
                                    href="http://localhost:5000/graphiql"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition"
                                >
                                    Open GraphiQL →
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <p className="text-blue-800 text-lg">
                                    🔐 Please log in to access your dashboard
                                </p>
                            </div>
                            <a

                                href="/auth/login"
                                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition text-lg"
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