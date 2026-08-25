import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { inviteService, departmentService } from '../../services/procurementService.js';
import { Department, UserRole } from '../../types/index.js';
import { Copy, Check } from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES: { role: UserRole; label: string }[] = [
  { role: 'EMPLOYEE', label: 'Employee (Standard Requisitioner)' },
  { role: 'PROCUREMENT_MANAGER', label: 'Procurement Manager' },
  { role: 'WAREHOUSE_STAFF', label: 'Warehouse Staff' },
  { role: 'FINANCE', label: 'Finance' },
  { role: 'ORGANIZATION_ADMIN', label: 'Organization Admin' },
  { role: 'VENDOR', label: 'Vendor Portal Account' }
];

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      departmentService.getDepartments().then((res) => {
        if (res.departments && res.departments.length > 0) {
          setDepartments(res.departments);
          setDepartmentId(res.departments[0].id);
        }
      });
      setInviteLink(null);
      setEmail('');
      setName('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError('Email and name are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await inviteService.sendInvite({
        email,
        name,
        role,
        departmentId
      });

      const fullUrl = `${window.location.origin}${res.inviteUrl}`;
      setInviteLink(fullUrl);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to generate invitation link');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite New User" subtitle="Generate account invitation token link">
      {inviteLink ? (
        <div className="space-y-4 py-2">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            <div className="font-bold text-sm mb-1 text-emerald-400">Invitation Token Generated!</div>
            <p>Send this secure onboarding link to <strong>{name}</strong> ({email}):</p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 px-3 py-2 text-xs bg-[#0A0A0C] border border-[#26262B] rounded-xl font-mono text-[#EAEAEA]"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="flex justify-end pt-3">
            <button onClick={onClose} className="px-5 py-2 text-xs font-bold text-[#EAEAEA] bg-[#1C1C21] border border-[#26262B] rounded-xl cursor-pointer">
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/30">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Deshmukh"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] placeholder-[#66666E] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@apexcorp.com"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] placeholder-[#66666E] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1">Assign System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26262B]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[#88888E] hover:text-[#EAEAEA] rounded-xl cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-black bg-[#D4AF37] hover:bg-[#B89830] rounded-xl shadow-md cursor-pointer"
            >
              {submitting ? 'Generating...' : 'Generate Onboarding Token'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
