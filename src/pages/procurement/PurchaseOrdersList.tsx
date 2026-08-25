import React, { useState, useEffect } from 'react';
import { purchaseOrderService } from '../../services/procurementService.js';
import { PurchaseOrder, POStatus } from '../../types/index.js';
import { ShoppingBag, Plus, Store, Calendar, Truck } from 'lucide-react';
import { CreatePOModal } from '../../components/modals/CreatePOModal.js';
import { CreateGRNModal } from '../../components/modals/CreateGRNModal.js';
import { Skeleton } from '../../components/common/Skeleton.js';
import { Badge } from '../../components/common/Badge.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.js';

export const PurchaseOrdersList: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [selectedPOForGRN, setSelectedPOForGRN] = useState<PurchaseOrder | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await purchaseOrderService.getOrders();
      if (res.success) setOrders(res.purchaseOrders);
    } catch (e) {
      console.error('Failed to load POs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await purchaseOrderService.updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update PO status', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" /> Vendor Purchase Orders (PO)
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Binding vendor procurement commitments, delivery schedules & PO tracking</p>
        </div>

        {(user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Generate Purchase Order
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {orders.map((po) => (
            <div
              key={po.id}
              className="bg-[#16161A] rounded-2xl border border-[#26262B] p-5 space-y-4 hover:border-[#D4AF37]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26262B] pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#111114] border border-[#26262B] rounded-xl font-mono text-xs font-bold text-[#D4AF37]">
                    {po.poNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#EAEAEA] font-bold">
                    <Store className="w-4 h-4 text-[#D4AF37]" /> {po.vendorName}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge status={po.status} />
                  <span className="text-xs font-extrabold text-[#EAEAEA] bg-[#111114] px-3 py-1 border border-[#26262B] rounded-xl">
                    {formatCurrency(po.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#EAEAEA]">
                  <thead className="bg-[#111114] text-[#66666E] uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="px-3 py-2">Item Description</th>
                      <th className="px-3 py-2">Ordered Qty</th>
                      <th className="px-3 py-2">Unit Price</th>
                      <th className="px-3 py-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26262B]">
                    {po.items?.map((item, idx) => (
                      <tr key={item.productId || idx}>
                        <td className="px-3 py-2 font-bold text-[#EAEAEA]">{item.productName}</td>
                        <td className="px-3 py-2 text-[#88888E]">{item.quantity}</td>
                        <td className="px-3 py-2 text-[#88888E]">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-bold text-[#D4AF37]">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#88888E] pt-2 border-t border-[#26262B] gap-3">
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#66666E]" /> Issued: {formatDate(po.createdAt)}
                  </span>
                  {po.expectedDeliveryDate && (
                    <span className="text-[#D4AF37]">Expected: {formatDate(po.expectedDeliveryDate)}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {(user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'WAREHOUSE_STAFF' || user?.role === 'PROCUREMENT_MANAGER') && po.status !== 'RECEIVED' && (
                    <button
                      onClick={() => setSelectedPOForGRN(po)}
                      className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" /> Record Inward GRN
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] text-[#88888E]">Status:</label>
                    <select
                      value={po.status}
                      onChange={(e) => handleStatusChange(po.id, e.target.value)}
                      className="px-2.5 py-1 bg-[#111114] border border-[#26262B] text-[#EAEAEA] rounded-lg text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="CREATED">CREATED</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="DISPATCHED">DISPATCHED</option>
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPOForGRN && (
        <CreateGRNModal
          isOpen={!!selectedPOForGRN}
          po={selectedPOForGRN}
          onClose={() => setSelectedPOForGRN(null)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
};
