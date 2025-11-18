import {auth0} from '@/lib/auth0';

export default async function Home() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <main className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">
                    SaaS Starter Kit
                </h1>

                {user ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 font-semibold">
                                ✅ Logged in as: {user.name}
                            </p>
                            <p className="text-sm text-green-600">{user.email}</p>
                        </div>

                        <a
                            href="/auth/logout"
                            className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                        >
                            Log Out
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800">
                                🔐 Please log in to access your dashboard
                            </p>
                        </div>

                        <a
                            href="/auth/login"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                        >
                            Log In
                        </a>
                    </div>
                )}
            </div>
        </main>
    );
}