import {auth0} from '@/lib/auth0';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db/client';
import Link from "next/link";
import {requireAuth} from "@/app/auth/require-auth";

async function createOrganization(formData: FormData) {
    'use server';

    const { user } = await requireAuth();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    if (!name || !slug) {
        throw new Error('Name and slug are required');
    }

    // Create organization
    const org = await db.createOrganization(name, slug, user.id);

    // Add user as owner
    await db.addUserToOrganization(user.id, org.id, 'owner');

    redirect('/');
}

export default async function NewOrganizationPage() {
    const session = await auth0.getSession();

    if (!session?.user) {
        redirect('/auth/login');
    }

    return (
        <main className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-2">Create Organization</h1>
                    <p className="text-gray-600 mb-8">
                        Create a new workspace for your team
                    </p>

                    <form action={createOrganization} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Organization Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                placeholder="Acme Inc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                The name of your company or team
                            </p>
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                URL Slug *
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                required
                                placeholder="acme-inc"
                                pattern="[a-z0-9-]+"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Lowercase letters, numbers, and hyphens only
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                            >
                                Create Organization
                            </button>

                            <Link
                                href="/"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}