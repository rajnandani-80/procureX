import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { inventoryService } from '../../services/procurementService.js';
import { InventoryItem } from '../../types/index.js';

interface AdjustInventoryModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdjustInventoryModal: React.FC<AdjustInventoryModalProps> = ({ isOpen, item, onClose, onSuccess }) => {
  const [newQuantity, setNewQuantity] = useState<number>(item ? item.currentStock : 0);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await inventoryService.adjustStock({
        productId: item.productId,
        newQuantity,
        reason
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manual Stock Adjustment — ${item.productName}`} subtitle="Log physical audit count correction or stock write-off">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">{error}</div>}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
          <div>
            <span className="text-slate-500">Current System Stock:</span>
            <span className="font-bold text-slate-800 ml-1.5">{item.currentStock} {item.unitName}</span>
          </div>
          <div>
            <span className="text-slate-500">Min Threshold:</span>
            <span className="font-semibold text-rose-600 ml-1.5">{item.minStockLevel} {item.unitName}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">New Verified Physical Quantity</label>
          <input
            type="number"
            required
            min="0"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Reason & Audit Note</label>
          <textarea
            required
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Physical inventory count correction, damaged goods write-off..."
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
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20"
          >
            {submitting ? 'Updating...' : 'Confirm Stock Correction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
