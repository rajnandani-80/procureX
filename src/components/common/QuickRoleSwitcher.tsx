import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { ShieldAlert, Users, ChevronUp, ChevronDown } from 'lucide-react';

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'ORGANIZATION_ADMIN', label: 'Org Admin', desc: 'Full ERP Control, Setup, Approval Rules' },
  { role: 'PROCUREMENT_MANAGER', label: 'Procurement Mgr', desc: 'Approves PRs, Issues POs, Vendor Offers' },
  { role: 'EMPLOYEE', label: 'Employee', desc: 'Submits PRs, Views Inventory' },
  { role: 'WAREHOUSE_STAFF', label: 'Warehouse Staff', desc: 'GRN Receiving, Inventory Stock Adjustments' },
  { role: 'FINANCE', label: 'Finance', desc: 'Spend Analytics & Purchase Orders' },
  { role: 'VENDOR', label: 'Vendor', desc: 'Submits Price Offers, Dispatches POs' },
  { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Platform Multi-Tenant Portal' }
];

export const QuickRoleSwitcher: React.FC = () => {
  const { user, switchDemoUser } = useAuth();
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-[#111114]/95 text-[#EAEAEA] border border-[#26262B] rounded-xl shadow-2xl backdrop-blur-md transition-all max-w-md">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-[#16161A] rounded-xl select-none"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide text-[#EAEAEA]">
            Active Persona: <span className="text-[#D4AF37] font-bold uppercase">{user.role.replace(/_/g, ' ')}</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#88888E] text-xs">
          <span>Switch</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t border-[#26262B] space-y-1.5 max-h-80 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-[#88888E] tracking-wider mb-2 flex items-center gap-1">
            <Users className="w-3 h-3 text-[#D4AF37]" /> Instant Role Preview Switcher
          </div>
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={async () => {
                await switchDemoUser(r.role);
                setExpanded(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                user.role === r.role
                  ? 'bg-[#D4AF37] text-black font-bold shadow-xs'
                  : 'bg-[#16161A] text-[#88888E] hover:bg-[#1C1C21] hover:text-[#EAEAEA]'
              }`}
            >
              <div>
                <div className="font-semibold">{r.label}</div>
                <div className={`text-[10px] ${user.role === r.role ? 'text-black/70' : 'text-[#66666E]'}`}>{r.desc}</div>
              </div>
              {user.role === r.role && <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">ACTIVE</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
