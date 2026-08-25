import React, { useState, useEffect } from 'react';
import { vendorOfferService } from '../../services/procurementService.js';
import { VendorOffer } from '../../types/index.js';
import { Tag, Plus, Check, X } from 'lucide-react';
import { CreateOfferModal } from '../../components/modals/CreateOfferModal.js';
import { Skeleton } from '../../components/common/Skeleton.js';
import { Badge } from '../../components/common/Badge.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.js';

export const VendorOffersList: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<VendorOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await vendorOfferService.getOffers();
      if (res.success) setOffers(res.offers);
    } catch (e) {
      console.error('Failed to fetch offers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await vendorOfferService.updateOfferStatus(id, status);
      fetchOffers();
    } catch (err) {
      console.error('Failed to update offer status', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#D4AF37]" /> Vendor Quotation Offers & Bids
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Supplier price quotes, delivery lead times & quotation approvals</p>
        </div>

        {user?.role === 'VENDOR' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Submit Quotation Offer
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EAEAEA]">
              <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">Product SKU</th>
                  <th className="px-5 py-3.5">Quoted Price</th>
                  <th className="px-5 py-3.5">MOQ</th>
                  <th className="px-5 py-3.5">Lead Time</th>
                  <th className="px-5 py-3.5">Valid Until</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262B]">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-[#1C1C21]">
                    <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">{offer.vendorName || 'Vendor Partner'}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#D4AF37]">{offer.productName || offer.productId}</td>
                    <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">{formatCurrency(offer.price)}</td>
                    <td className="px-5 py-3.5 text-[#88888E]">{offer.moq} PCS</td>
                    <td className="px-5 py-3.5 text-[#88888E]">{offer.leadTimeDays} Days</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#66666E]">{formatDate(offer.validUntil)}</td>
                    <td className="px-5 py-3.5">
                      <Badge status={offer.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {offer.status === 'PENDING_APPROVAL' &&
                        (user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(offer.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(offer.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateOfferModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchOffers} />
    </div>
  );
};
