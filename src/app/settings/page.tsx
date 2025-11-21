import { db } from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentOrgId } from '@/lib/org/current';
import Avatar from '@/components/Avatar';
import LeaveOrgButton from '@/components/LeaveOrgButton';
import DeleteOrgButton from '@/components/DeleteOrgButton';
import { SettingsProfileForm } from '@/components/SettingsProfileForm';
import { SettingsOrgForm } from '@/components/SettingsOrgForm';
import {requireAuth} from "@/app/auth/require-auth";

export default async function SettingsPage() {
    const { user } = await requireAuth();

    const currentOrgId = await getCurrentOrgId();
    if (!currentOrgId) {
        return (
            <DashboardLayout>
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                    <p className="text-yellow-900 font-semibold">
                        Please select an organization first
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const currentOrg = await db.getOrganizationById(currentOrgId);
    const membership = await db.getUserOrgMembership(user.id, currentOrgId);
    const memberCount = await db.getOrganizationMemberCount(currentOrgId);

    const canEditOrg = membership && ['owner', 'admin'].includes(membership.role);
    const isOwner = membership?.role === 'owner';

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account and organization</p>
                </div>

                {/* User Profile Section */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>

                    <div className="flex items-center gap-6 mb-6">
                        <Avatar
                            name={user.name || 'User'}
                            imageUrl={user.avatar_url}
                            size="lg"
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>

                    <SettingsProfileForm userName={user.name} />

                    <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Email is managed by your authentication provider
                        </p>
                    </div>
                </div>

                {/* Organization Settings */}
                {currentOrg && (
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Organization Settings</h2>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                membership?.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                                    membership?.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                            }`}>
                {membership?.role}
              </span>
                        </div>

                        {canEditOrg ? (
                            <SettingsOrgForm orgName={currentOrg.name} orgSlug={currentOrg.slug} />
                        ) : (
                            <div className="text-gray-600">
                                <p className="mb-2"><strong>Name:</strong> {currentOrg.name}</p>
                                <p className="mb-4"><strong>Slug:</strong> /{currentOrg.slug}</p>
                                <p className="text-sm text-gray-500">
                                    Only owners and admins can edit organization settings
                                </p>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                            <p className="text-sm text-gray-600 mb-4">
                                <strong>Members:</strong> {memberCount} member{memberCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h2>

                    <div className="space-y-4">
                        {/* Leave Organization */}
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-red-200 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-gray-900">Leave Organization</h3>
                                <p className="text-sm text-gray-600">
                                    Remove yourself from {currentOrg?.name}
                                </p>
                                {membership?.role === 'owner' && memberCount > 1 && (
                                    <p className="text-sm text-red-600 mt-1">
                                        Transfer ownership before leaving
                                    </p>
                                )}
                            </div>
                            <LeaveOrgButton
                                orgName={currentOrg?.name || 'this organization'}
                                isOwner={isOwner}
                                hasMultipleMembers={memberCount > 1}
                            />
                        </div>

                        {/* Delete Organization */}
                        {isOwner && (
                            <div className="flex items-center justify-between p-4 bg-white border-2 border-red-300 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-red-900">Delete Organization</h3>
                                    <p className="text-sm text-gray-600">
                                        Permanently delete {currentOrg?.name} and all its data
                                    </p>
                                    <p className="text-sm text-red-600 mt-1">
                                        This action cannot be undone!
                                    </p>
                                </div>
                                <DeleteOrgButton orgName={currentOrg?.name || 'organization'} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}