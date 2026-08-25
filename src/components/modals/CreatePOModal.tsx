import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { vendorService, purchaseOrderService } from '../../services/procurementService.js';
import { Vendor, PurchaseRequest } from '../../types/index.js';
import { formatCurrency } from '../../utils/formatters.js';

interface CreatePOModalProps {
  isOpen: boolean;
  pr: PurchaseRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({ isOpen, pr, onClose, onSuccess }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<string>('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      vendorService.getVendors().then((res) => {
        if (res.vendors) {
          const activeVendors = res.vendors.filter((v) => v.status === 'ACTIVE');
          setVendors(activeVendors);
          if (activeVendors.length > 0) setVendorId(activeVendors[0].id);
        }
      });
      // Default delivery date 14 days in future
      const defaultDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0];
      setExpectedDeliveryDate(defaultDate);
    }
  }, [isOpen]);

  if (!pr) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      setError('Please select a vendor.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await purchaseOrderService.createOrder({
        prId: pr.id,
        vendorId,
        expectedDeliveryDate,
        notes
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate Purchase Order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generate PO for ${pr.prNumber}`} subtitle="Select vendor & specify procurement terms">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">{error}</div>}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Requested By:</span>
            <span className="font-semibold text-slate-800">{pr.requestedByName} ({pr.departmentName})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">PR Amount:</span>
            <span className="font-bold text-indigo-600">{formatCurrency(pr.totalAmount)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Fulfilling Vendor</label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.companyName} (Rating: {v.rating}★) — {v.taxId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
          <input
            type="date"
            required
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Dispatch / Quality Instructions</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special delivery notes, packaging instructions..."
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
            {submitting ? 'Generating PO...' : 'Generate Purchase Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
