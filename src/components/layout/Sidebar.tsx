import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { NAVIGATION_ITEMS, canAccessRoute } from '../../utils/permissions.js';
import {
  LayoutDashboard,
  Building2,
  Building,
  Users,
  Store,
  Package,
  Tag,
  FileText,
  ShoppingBag,
  Truck,
  Boxes,
  BarChart3,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Building,
  Users,
  Store,
  Package,
  Tag,
  FileText,
  ShoppingBag,
  Truck,
  Boxes,
  BarChart3,
  ShieldCheck
};

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const accessibleItems = NAVIGATION_ITEMS.filter((item) => canAccessRoute(user.role, item.roles));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#111114] text-[#EAEAEA] flex flex-col border-r border-[#26262B] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#26262B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#EAEAEA] tracking-tight flex items-center gap-1">
                Procure<span className="text-[#D4AF37]">X</span>
              </h1>
              <p className="text-[11px] text-[#88888E] font-medium">Smart Procurement ERP</p>
            </div>
          </div>
        </div>

        {/* Organization Scoping Badge */}
        <div className="mx-4 my-3 px-3 py-2 bg-[#16161A] rounded-xl border border-[#26262B] flex items-center gap-2.5">
          <Building className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <div className="truncate">
            <div className="text-[10px] text-[#88888E] uppercase font-semibold tracking-wider">Organization</div>
            <div className="text-xs font-semibold text-[#EAEAEA] truncate">
              {user.organizationName || 'Apex Global Enterprises'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {accessibleItems.map((item) => {
            const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1C1C21] text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-[#88888E] hover:text-[#EAEAEA] hover:bg-[#16161A]'
                  }`
                }
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Account Footer */}
        <div className="p-3 border-t border-[#26262B] bg-[#0A0A0C]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#16161A] border border-[#26262B]">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                }
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#D4AF37]/30 shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-semibold text-[#EAEAEA] truncate">{user.name}</div>
                <div className="text-[10px] text-[#D4AF37] font-medium uppercase tracking-wider truncate">
                  {user.role.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-[#88888E] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
