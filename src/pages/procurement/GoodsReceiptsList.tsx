import React, { useState, useEffect } from 'react';
import { goodsReceiptService } from '../../services/procurementService.js';
import { GoodsReceipt } from '../../types/index.js';
import { Truck, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton.js';
import { formatDate } from '../../utils/formatters.js';

export const GoodsReceiptsList: React.FC = () => {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await goodsReceiptService.getReceipts();
      if (res.success) setReceipts(res.goodsReceipts);
    } catch (e) {
      console.error('Failed to load GRNs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#D4AF37]" /> Goods Receipt Notes (GRN) & Inward Inspections
        </h1>
        <p className="text-xs text-[#88888E] mt-0.5">Warehouse dock inward verification, damaged stock logging & PO fulfillment history</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {receipts.map((grn) => (
            <div
              key={grn.id}
              className="bg-[#16161A] rounded-2xl border border-[#26262B] p-5 space-y-4 hover:border-[#D4AF37]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26262B] pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#111114] border border-[#26262B] rounded-xl font-mono text-xs font-bold text-[#D4AF37]">
                    {grn.grnNumber}
                  </span>
                  <span className="text-xs text-[#88888E]">PO Ref: <strong className="text-[#EAEAEA]">{grn.poNumber}</strong></span>
                  <span className="text-xs text-[#88888E]">Received by: <strong className="text-[#EAEAEA]">{grn.receivedByName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#88888E] font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#66666E]" /> Received: {formatDate(grn.receivedAt)}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#EAEAEA]">
                  <thead className="bg-[#111114] text-[#66666E] uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="px-3 py-2">Product Name</th>
                      <th className="px-3 py-2">Ordered Qty</th>
                      <th className="px-3 py-2">Accepted Qty</th>
                      <th className="px-3 py-2">Damaged Qty</th>
                      <th className="px-3 py-2">Inspection Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26262B]">
                    {grn.items?.map((item, idx) => (
                      <tr key={item.productId || idx}>
                        <td className="px-3 py-2 font-bold text-[#EAEAEA]">{item.productName}</td>
                        <td className="px-3 py-2 text-[#88888E]">{item.orderedQty}</td>
                        <td className="px-3 py-2 text-emerald-400 font-bold">{item.receivedQty}</td>
                        <td className="px-3 py-2 text-rose-400 font-bold">{item.damagedQty || 0}</td>
                        <td className="px-3 py-2">
                          {item.damagedQty > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy Recorded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Quality Passed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {grn.notes && (
                <div className="text-xs text-[#88888E] bg-[#111114] p-3 border border-[#26262B] rounded-xl font-mono">
                  Inspector Notes: <span className="text-[#EAEAEA]">{grn.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
