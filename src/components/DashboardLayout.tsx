import {auth0} from '@/lib/auth0';
import {db} from '@/lib/db/client';
import {getCurrentOrgId} from '@/lib/org/current';
import OrgSwitcher from './OrgSwitcher';
import Avatar from './Avatar';
import Link from 'next/link';

type Props = {
    children: React.ReactNode;
};

export default async function DashboardLayout({children}: Props) {
    const session = await auth0.getSession();

    if (!session?.user) {
        return <>{children}</>;
    }

    const user = await db.findUserByAuth0Id(session.user.sub);
    if (!user) {
        return <>{children}</>;
    }

    const userOrgs = await db.getUserOrganizations(user.id);
    const currentOrgId = await getCurrentOrgId();
    const currentOrg = userOrgs.find(org => org.id === currentOrgId) || userOrgs[0];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo/Brand */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">S</span>
                                </div>
                                <span className="font-bold text-xl text-gray-900">SaaS Starter</span>
                            </Link>

                            {/* Org Switcher */}
                            <div className="hidden md:block w-64">
                                <OrgSwitcher
                                    organizations={userOrgs}
                                    currentOrgId={currentOrg?.id || null}
                                />
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <a
                                href="http://localhost:5001/graphiql"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                                </svg>
                                GraphiQL
                            </a>

                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                                <Avatar name={user.name || 'User'} imageUrl={user.avatar_url} size="sm"/>
                                <div className="hidden md:block">
                                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-600">{user.email}</div>
                                </div>
                            </div>

                            <a
                                href="/auth/logout"
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                Logout
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout with Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <nav className="bg-white rounded-lg border-2 border-gray-200 p-4 sticky top-24">
                            <div className="space-y-1">
                                <NavLink href="/" icon="home" label="Dashboard"/>
                                <NavLink href="/projects" icon="folder" label="Projects"/>
                                <NavLink href="/tasks" icon="check" label="Tasks"/>
                                <NavLink href="/team" icon="users" label="Team"/>
                                <NavLink href="/settings" icon="settings" label="Settings"/>
                            </div>

                            <div className="mt-8 pt-4 border-t-2 border-gray-200">
                                <NavLink href="/organizations/new" icon="plus" label="New Organization"/>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

function NavLink({href, icon, label}: { href: string; icon: string; label: string }) {
    const icons = {
        home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
        check: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        plus: 'M12 4v16m8-8H4',
    };

    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium group"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={icons[icon as keyof typeof icons]}/>
            </svg>
            <span>{label}</span>
        </Link>
    );
}