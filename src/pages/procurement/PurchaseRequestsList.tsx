import React, { useState, useEffect } from 'react';
import { purchaseRequestService } from '../../services/procurementService.js';
import { PurchaseRequest } from '../../types/index.js';
import { FileText, Plus, Check, X, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { CreatePRModal } from '../../components/modals/CreatePRModal.js';
import { CreatePOModal } from '../../components/modals/CreatePOModal.js';
import { Skeleton } from '../../components/common/Skeleton.js';
import { Badge } from '../../components/common/Badge.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.js';

export const PurchaseRequestsList: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [selectedPRForPO, setSelectedPRForPO] = useState<PurchaseRequest | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await purchaseRequestService.getRequests();
      if (res.success) setRequests(res.purchaseRequests);
    } catch (e) {
      console.error('Failed to load PRs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await purchaseRequestService.approveRequest(id);
      fetchRequests();
    } catch (err) {
      console.error('Failed to approve PR', err);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection justification reason:');
    if (!reason) return;
    try {
      await purchaseRequestService.rejectRequest(id, reason);
      fetchRequests();
    } catch (err) {
      console.error('Failed to reject PR', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" /> Internal Requisitions & Purchase Requests
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Departmental material requests & multi-stage approval authorization</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Raise Purchase Requisition
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {requests.map((pr) => (
            <div
              key={pr.id}
              className="bg-[#16161A] rounded-2xl border border-[#26262B] p-5 space-y-4 hover:border-[#D4AF37]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26262B] pb-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#111114] border border-[#26262B] rounded-xl font-mono text-xs font-bold text-[#D4AF37]">
                    {pr.prNumber}
                  </div>
                  <span className="text-xs text-[#88888E]">Requested by <strong className="text-[#EAEAEA]">{pr.requestedByName}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={pr.status} />
                  <span className="text-xs font-bold text-[#EAEAEA] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" /> Total: {formatCurrency(pr.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pr.items?.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-[#111114] border border-[#26262B] rounded-xl text-xs space-y-1">
                    <div className="font-bold text-[#EAEAEA] truncate">{item.productName}</div>
                    <div className="flex items-center justify-between text-[#88888E] text-[11px]">
                      <span>Qty: <strong className="text-[#EAEAEA]">{item.quantity}</strong></span>
                      <span>Unit: {formatCurrency(item.estimatedPrice)}</span>
                      <span className="font-bold text-[#D4AF37]">{formatCurrency(item.quantity * item.estimatedPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#88888E] pt-2 gap-2">
                <div className="space-y-0.5">
                  <div>Justification: <span className="text-[#EAEAEA] italic">"{pr.justification}"</span></div>
                  {pr.rejectionReason && (
                    <div className="text-rose-400 font-semibold">Rejection reason: {pr.rejectionReason}</div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#66666E]" /> {formatDate(pr.createdAt)}
                  </span>

                  {(pr.status === 'PENDING_APPROVAL' || pr.status === 'CREATED') &&
                    (user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER' || user?.role === 'FINANCE') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(pr.id)}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve PR
                        </button>
                        <button
                          onClick={() => handleReject(pr.id)}
                          className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}

                  {pr.status === 'APPROVED' && (user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
                    <button
                      onClick={() => setSelectedPRForPO(pr)}
                      className="px-3 py-1 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Issue PO
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreatePRModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchRequests} />

      {selectedPRForPO && (
        <CreatePOModal
          isOpen={!!selectedPRForPO}
          pr={selectedPRForPO}
          onClose={() => setSelectedPRForPO(null)}
          onSuccess={fetchRequests}
        />
      )}
    </div>
  );
};
