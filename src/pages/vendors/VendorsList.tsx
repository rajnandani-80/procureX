import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/procurementService.js';
import { Vendor } from '../../types/index.js';
import { Store, Plus, Search, Star, Building, Mail, Phone, ShieldCheck } from 'lucide-react';
import { CreateVendorModal } from '../../components/modals/CreateVendorModal.js';
import { Skeleton } from '../../components/common/Skeleton.js';
import { useAuth } from '../../context/AuthContext.js';

export const VendorsList: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorService.getVendors();
      if (res.success) {
        setVendors(res.vendors);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusToggle = async (vendorId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await vendorService.updateStatus(vendorId, nextStatus);
      fetchVendors();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const filtered = vendors.filter(
    (v) =>
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.contactName.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-[#D4AF37]" /> Verified Vendor & Supplier Directory
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Manage partner compliance, catalog ratings and procurement credentials</p>
        </div>

        {(user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Vendor
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#66666E] absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors by company name or email..."
          className="w-full pl-10 pr-4 py-2 bg-[#16161A] border border-[#26262B] text-[#EAEAEA] placeholder-[#66666E] rounded-xl text-xs focus:border-[#D4AF37] focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-[#16161A] rounded-2xl border border-[#26262B] p-5 space-y-4 hover:border-[#D4AF37]/50 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#EAEAEA] flex items-center gap-1.5">
                    {vendor.companyName}
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  </h3>
                  <div className="text-[11px] text-[#D4AF37] font-semibold mt-0.5">Contact: {vendor.contactName}</div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    vendor.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : vendor.status === 'PENDING'
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {vendor.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#88888E]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#66666E]" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#66666E]" />
                  <span>{vendor.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-[#66666E]" />
                  <span>Tax ID / GST: {vendor.taxId || 'GSTIN-PENDING'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#26262B] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[#D4AF37] font-bold">
                  <Star className="w-4 h-4 fill-[#D4AF37]" />
                  <span>{vendor.rating.toFixed(1)} / 5.0</span>
                </div>

                {(user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
                  <button
                    onClick={() => handleStatusToggle(vendor.id, vendor.status)}
                    className="text-[11px] font-semibold text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    {vendor.status === 'ACTIVE' ? 'Block Partner' : 'Activate Partner'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateVendorModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchVendors} />
    </div>
  );
};
