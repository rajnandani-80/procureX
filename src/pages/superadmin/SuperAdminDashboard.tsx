import React, { useState, useEffect } from 'react';
import { organizationService } from '../../services/procurementService.js';
import { Organization } from '../../types/index.js';
import { TableSkeleton } from '../../components/common/Skeleton.js';
import { Modal } from '../../components/common/Modal.js';
import { Badge } from '../../components/common/Badge.js';
import { Building2, Plus, Users, Globe, ShieldCheck } from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Create Org Modal state
  const [createOrgOpen, setCreateOrgOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [currency, setCurrency] = useState<string>('INR (₹)');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Admin Invite Modal state
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await organizationService.getSuperAdminStats();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await organizationService.createOrg({ name, code, currency, timezone });
      setCreateOrgOpen(false);
      setName('');
      setCode('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrgAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await organizationService.createOrgAdmin(selectedOrgId, {
        name: adminName,
        email: adminEmail,
        password: 'password123'
      });
      setAdminModalOpen(false);
      setAdminName('');
      setAdminEmail('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <TableSkeleton rows={8} />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#D4AF37]" /> Super Admin Multi-Tenant Portal
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Manage platform organizations, tenant provisioning & global security</p>
        </div>

        <button
          onClick={() => setCreateOrgOpen(true)}
          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Provision New Organization
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs">
          <div className="text-xs font-bold text-[#88888E] uppercase tracking-wider mb-2">Total Organizations</div>
          <div className="text-3xl font-black text-[#EAEAEA]">{stats.totalOrganizations || 0}</div>
        </div>
        <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs">
          <div className="text-xs font-bold text-[#88888E] uppercase tracking-wider mb-2">Active Tenants</div>
          <div className="text-3xl font-black text-emerald-400">{stats.activeOrganizations || 0}</div>
        </div>
        <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs">
          <div className="text-xs font-bold text-[#88888E] uppercase tracking-wider mb-2">Global Platform Users</div>
          <div className="text-3xl font-black text-[#D4AF37]">{stats.totalUsers || 0}</div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#26262B] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#EAEAEA]">Provisioned Organizations</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#EAEAEA]">
            <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Organization</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Currency & Timezone</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262B]">
              {data?.recentOrganizations?.map((org: Organization) => (
                <tr key={org.id} className="hover:bg-[#1C1C21]">
                  <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">{org.name}</td>
                  <td className="px-5 py-3.5 font-mono text-[#D4AF37]">{org.code}</td>
                  <td className="px-5 py-3.5 text-[#88888E]">
                    {org.currency} ({org.timezone})
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={org.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrgId(org.id);
                        setAdminModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#111114] border border-[#26262B] hover:bg-[#1C1C21] text-[#D4AF37] font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      Provision Org Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Organization */}
      <Modal isOpen={createOrgOpen} onClose={() => setCreateOrgOpen(false)} title="Provision New Organization">
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Organization Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nexus Logistics Ltd"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Organization Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="NEXUS"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setCreateOrgOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#88888E] hover:text-[#EAEAEA] cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-black bg-[#D4AF37] hover:bg-[#B89830] rounded-xl cursor-pointer">
              {submitting ? 'Creating...' : 'Provision Organization'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Org Admin */}
      <Modal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} title="Provision Organization Admin">
        <form onSubmit={handleCreateOrgAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Admin Name</label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@tenant.com"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>

          <div className="p-3 bg-[#111114] border border-[#26262B] text-[#88888E] text-xs rounded-xl font-mono">
            Default initial password: <strong className="text-[#D4AF37]">password123</strong>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setAdminModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#88888E] hover:text-[#EAEAEA] cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-black bg-[#D4AF37] hover:bg-[#B89830] rounded-xl cursor-pointer">
              {submitting ? 'Creating...' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
