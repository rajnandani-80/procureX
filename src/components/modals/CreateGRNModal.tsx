import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { goodsReceiptService } from '../../services/procurementService.js';
import { PurchaseOrder } from '../../types/index.js';
import { AlertTriangle } from 'lucide-react';

interface CreateGRNModalProps {
  isOpen: boolean;
  po: PurchaseOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGRNModal: React.FC<CreateGRNModalProps> = ({ isOpen, po, onClose, onSuccess }) => {
  const [items, setItems] = useState<{ productId: string; productName: string; orderedQty: number; receivedQty: number; damagedQty: number }[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (po && isOpen) {
      setItems(
        po.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          orderedQty: it.quantity,
          receivedQty: it.quantity,
          damagedQty: 0
        }))
      );
    }
  }, [po, isOpen]);

  if (!po) return null;

  const handleQtyChange = (idx: number, field: 'receivedQty' | 'damagedQty', val: number) => {
    const updated = [...items];
    updated[idx][field] = Math.max(0, val);
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verification check
    const invalidItem = items.find((i) => i.receivedQty + i.damagedQty > i.orderedQty * 1.5);
    if (invalidItem) {
      setError(`Received quantity for ${invalidItem.productName} significantly exceeds ordered quantity.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await goodsReceiptService.createReceipt({
        poId: po.id,
        items,
        notes
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process Goods Receipt Note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Process GRN for ${po.poNumber}`} subtitle="Verify received quantities & auto-adjust inventory stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">{error}</div>}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
          <div>
            <span className="text-slate-500 font-medium">Vendor: </span>
            <span className="font-semibold text-slate-800">{po.vendorName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Delivery Target: </span>
            <span className="font-semibold text-slate-800">{po.expectedDeliveryDate}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Line Items Verification</label>
          {items.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-900">{item.productName}</div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Ordered</span>
                  <span className="font-bold text-slate-700">{item.orderedQty} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Received Good</span>
                  <input
                    type="number"
                    min="0"
                    value={item.receivedQty}
                    onChange={(e) => handleQtyChange(idx, 'receivedQty', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Damaged / Rejected</span>
                  <input
                    type="number"
                    min="0"
                    value={item.damagedQty}
                    onChange={(e) => handleQtyChange(idx, 'damagedQty', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-rose-700 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {item.damagedQty > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium pt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Damaged units will trigger vendor quality review logging.</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Inspection Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Condition of package, seals verified, quality comments..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20"
          >
            {submitting ? 'Processing GRN...' : 'Confirm GRN & Update Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
