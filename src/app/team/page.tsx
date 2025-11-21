import { db } from '@/lib/db/client';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentOrgId } from '@/lib/org/current';
import Avatar from '@/components/Avatar';
import MemberRoleSelect from '@/components/MemberRoleSelect';
import RemoveMemberButton from '@/components/RemoveMemberButton';
import InviteMemberForm from '@/components/InviteMemberForm';
import {requireAuth} from "@/app/auth/require-auth";

export default async function TeamPage() {
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

    const members = await db.getOrganizationMembers(currentOrgId);
    const currentOrg = await db.getOrganizationById(currentOrgId);
    const currentMembership = await db.getUserOrgMembership(user.id, currentOrgId);

    const canManageTeam = currentMembership && ['owner', 'admin'].includes(currentMembership.role);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Team</h1>
                    <p className="text-gray-600 mt-1">
                        Manage members of {currentOrg?.name}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard label="Total Members" value={members.length} />
                    <StatCard label="Owners" value={members.filter(m => m.role === 'owner').length} />
                    <StatCard label="Admins" value={members.filter(m => m.role === 'admin').length} />
                    <StatCard label="Members" value={members.filter(m => m.role === 'member').length} />
                </div>

                {/* Invite Member Form */}
                {canManageTeam && <InviteMemberForm />}

                {/* Members List */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Team Members ({members.length})
                    </h2>

                    <div className="space-y-3">
                        {members.map((member) => {
                            const isCurrentUser = member.user_id === user.id;

                            return (
                                <div key={member.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition">
                                    <div className="flex items-center gap-4 flex-1">
                                        <Avatar
                                            name={member.name || 'User'}
                                            imageUrl={member.avatar_url}
                                            size="md"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {member.name}
                                                </h3>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            You
                          </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm">{member.email}</p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                Joined {new Date(member.joined_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {canManageTeam && !isCurrentUser ? (
                                            <>
                                                <MemberRoleSelect
                                                    userId={member.user_id}
                                                    currentRole={member.role}
                                                />
                                                <RemoveMemberButton
                                                    userId={member.user_id}
                                                    userName={member.name || 'this user'}
                                                />
                                            </>
                                        ) : (
                                            <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function getRoleColor(role: string) {
    const colors = {
        owner: 'bg-purple-100 text-purple-700',
        admin: 'bg-blue-100 text-blue-700',
        member: 'bg-green-100 text-green-700',
        viewer: 'bg-gray-100 text-gray-700',
    };
    return colors[role as keyof typeof colors] || colors.viewer;
}