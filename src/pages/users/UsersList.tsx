import React, { useState, useEffect } from 'react';
import { userService } from '../../services/procurementService.js';
import { User, UserRole } from '../../types/index.js';
import { TableSkeleton } from '../../components/common/Skeleton.js';
import { Badge } from '../../components/common/Badge.js';
import { InviteUserModal } from '../../components/modals/InviteUserModal.js';
import { Users, UserPlus, Search, Shield } from 'lucide-react';

const ROLES_LIST: UserRole[] = [
  'ORGANIZATION_ADMIN',
  'PROCUREMENT_MANAGER',
  'EMPLOYEE',
  'WAREHOUSE_STAFF',
  'FINANCE',
  'VENDOR'
];

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      if (res.users) setUsers(res.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userService.updateRole(userId, newRole);
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userService.updateStatus(userId, nextStatus);
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" /> Organization User Directory
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Manage user roles, access status & send onboarding tokens</p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Invite User / Employee
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#66666E] absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name, email or role..."
          className="w-full pl-10 pr-4 py-2 bg-[#16161A] border border-[#26262B] text-[#EAEAEA] placeholder-[#66666E] rounded-xl text-xs focus:border-[#D4AF37] focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#EAEAEA]">
            <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262B]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#1C1C21]">
                  <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">
                    <div>{u.name}</div>
                    <div className="text-[11px] text-[#66666E] font-normal">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[#88888E]">{u.departmentName || 'General'}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 bg-[#0A0A0C] border border-[#26262B] rounded-lg text-xs font-semibold text-[#D4AF37] focus:border-[#D4AF37] focus:outline-none"
                    >
                      {ROLES_LIST.map((r) => (
                        <option key={r} value={r}>
                          {r.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={u.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InviteUserModal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} onSuccess={loadUsers} />
    </div>
  );
};
