import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { dashboardService } from '../../services/procurementService.js';
import { Badge } from '../../components/common/Badge.js';
import { TableSkeleton } from '../../components/common/Skeleton.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  Users,
  Store,
  Package,
  FileText,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { CreatePRModal } from '../../components/modals/CreatePRModal.js';
import { CreateVendorModal } from '../../components/modals/CreateVendorModal.js';
import { CreateProductModal } from '../../components/modals/CreateProductModal.js';
import { CreateOfferModal } from '../../components/modals/CreateOfferModal.js';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [prModalOpen, setPrModalOpen] = useState<boolean>(false);
  const [vendorModalOpen, setVendorModalOpen] = useState<boolean>(false);
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [offerModalOpen, setOfferModalOpen] = useState<boolean>(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  if (loading) {
    return <TableSkeleton rows={8} />;
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Triggers */}
      <div className="bg-[#111114] rounded-2xl p-6 lg:p-8 text-[#EAEAEA] shadow-xl border border-[#26262B] flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> ProcureX Enterprise Workspace
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-xs text-[#88888E] mt-1 max-w-xl">
            Here is your live procurement overview for <span className="text-[#EAEAEA] font-semibold">{user?.organizationName}</span>.
          </p>
        </div>

        {/* Quick Workflow Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {(user?.role === 'EMPLOYEE' || user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
            <button
              onClick={() => setPrModalOpen(true)}
              className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Requisition
            </button>
          )}

          {(user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
            <>
              <button
                onClick={() => setVendorModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#16161A] hover:bg-[#1C1C21] text-[#EAEAEA] rounded-xl text-xs font-semibold border border-[#26262B] flex items-center gap-1.5 cursor-pointer"
              >
                <Store className="w-4 h-4 text-[#D4AF37]" /> Add Vendor
              </button>
              <button
                onClick={() => setProductModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#16161A] hover:bg-[#1C1C21] text-[#EAEAEA] rounded-xl text-xs font-semibold border border-[#26262B] flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4 text-cyan-400" /> Add Product
              </button>
            </>
          )}

          {user?.role === 'VENDOR' && (
            <button
              onClick={() => setOfferModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Tag className="w-4 h-4" /> Submit Quotation Offer
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Alert Header if Low Stock Items exist */}
      {data?.lowStockProducts && data.lowStockProducts.length > 0 && (
        <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl flex items-center justify-between text-[#EAEAEA]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#D4AF37]">Inventory Low Stock Alert ({data.lowStockProducts.length} Items)</div>
              <p className="text-[11px] text-[#88888E]">
                Items like <span className="font-semibold text-[#EAEAEA]">{data.lowStockProducts.map((p: any) => p.name).join(', ')}</span> are below minimum stock thresholds.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="text-xs font-bold text-black hover:bg-[#B89830] px-3 py-1.5 bg-[#D4AF37] rounded-lg shrink-0 cursor-pointer"
          >
            Review Inventory →
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role !== 'VENDOR' && (
          <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-[#88888E]">
              <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
              <div className="p-2 rounded-xl bg-[#1C1C21] text-[#D4AF37] border border-[#26262B]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#EAEAEA]">{metrics.totalUsers || 0}</div>
            <div className="text-[11px] text-[#66666E] font-medium">Active in organization</div>
          </div>
        )}

        <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[#88888E]">
            <span className="text-xs font-bold uppercase tracking-wider">Vendors & Partners</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#EAEAEA]">{metrics.totalVendors || 0}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Verified suppliers</div>
        </div>

        <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[#88888E]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#EAEAEA]">{metrics.pendingRequests || 0}</div>
          <div className="text-[11px] text-[#D4AF37] font-semibold">Awaiting manager approval</div>
        </div>

        <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[#88888E]">
            <span className="text-xs font-bold uppercase tracking-wider">Active PO Orders</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#EAEAEA]">{metrics.activeOrders || 0}</div>
          <div className="text-[11px] text-[#88888E] font-medium">In dispatch & receiving stage</div>
        </div>
      </div>

      {/* Two Column Section: Recent Requests & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Requests */}
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#26262B] pb-3">
            <h3 className="text-sm font-bold text-[#EAEAEA] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4AF37]" /> Recent Purchase Requests
            </h3>
            <button
              onClick={() => navigate('/purchase-requests')}
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {data?.recentRequests && data.recentRequests.length > 0 ? (
              data.recentRequests.map((pr: any) => (
                <div
                  key={pr.id}
                  onClick={() => navigate('/purchase-requests')}
                  className="p-3 bg-[#111114] hover:bg-[#1C1C21] rounded-xl border border-[#26262B] cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#EAEAEA]">{pr.prNumber}</div>
                    <div className="text-[11px] text-[#88888E]">
                      {pr.requestedByName} ({pr.departmentName})
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="font-bold text-[#EAEAEA]">{formatCurrency(pr.totalAmount)}</div>
                    <Badge status={pr.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#66666E]">No recent purchase requests found.</div>
            )}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#26262B] pb-3">
            <h3 className="text-sm font-bold text-[#EAEAEA] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" /> Active Purchase Orders
            </h3>
            <button
              onClick={() => navigate('/purchase-orders')}
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.map((po: any) => (
                <div
                  key={po.id}
                  onClick={() => navigate('/purchase-orders')}
                  className="p-3 bg-[#111114] hover:bg-[#1C1C21] rounded-xl border border-[#26262B] cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#EAEAEA]">{po.poNumber}</div>
                    <div className="text-[11px] text-[#88888E]">Vendor: {po.vendorName}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="font-bold text-[#EAEAEA]">{formatCurrency(po.totalAmount)}</div>
                    <Badge status={po.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#66666E]">No active purchase orders.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log Feed */}
      <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#26262B] pb-3">
          <h3 className="text-sm font-bold text-[#EAEAEA] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Recent Enterprise Audit Activity
          </h3>
          <button
            onClick={() => navigate('/audit-logs')}
            className="text-xs font-semibold text-[#D4AF37] hover:underline cursor-pointer"
          >
            Audit Trail →
          </button>
        </div>

        <div className="divide-y divide-[#26262B] text-xs">
          {data?.activity && data.activity.length > 0 ? (
            data.activity.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#EAEAEA]">{log.performedByName}</span>{' '}
                  <span className="text-[#88888E]">({log.performedByRole.replace(/_/g, ' ')})</span> —{' '}
                  <span className="text-[#EAEAEA]">{log.details}</span>
                </div>
                <span className="text-[11px] text-[#66666E] font-mono">{formatDate(log.timestamp)}</span>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs text-[#66666E]">No recent activity logged.</div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreatePRModal isOpen={prModalOpen} onClose={() => setPrModalOpen(false)} onSuccess={loadDashboard} />
      <CreateVendorModal isOpen={vendorModalOpen} onClose={() => setVendorModalOpen(false)} onSuccess={loadDashboard} />
      <CreateProductModal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} onSuccess={loadDashboard} />
      <CreateOfferModal isOpen={offerModalOpen} onClose={() => setOfferModalOpen(false)} onSuccess={loadDashboard} />
    </div>
  );
};
