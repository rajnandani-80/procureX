import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { vendorOfferService, productService } from '../../services/procurementService.js';
import { Product } from '../../types/index.js';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [moq, setMoq] = useState<number>(1);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      productService.getProducts().then((res) => {
        if (res.products && res.products.length > 0) {
          setProducts(res.products);
          setProductId(res.products[0].id);
          setPrice(res.products[0].unitPrice);
        }
      });
    }
  }, [isOpen]);

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) setPrice(prod.unitPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || price <= 0) {
      setError('Product and valid offer price are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await vendorOfferService.createOffer({
        productId,
        price,
        currency: 'INR (₹)',
        moq,
        leadTimeDays
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Quotation Offer" subtitle="Propose vendor pricing and lead times">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">{error}</div>}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Product</label>
          <select
            value={productId}
            onChange={(e) => handleProductSelect(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Price (₹)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order Qty (MOQ)</label>
            <input
              type="number"
              required
              min="1"
              value={moq}
              onChange={(e) => setMoq(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
            <input
              type="number"
              required
              min="1"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
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
            {submitting ? 'Submitting...' : 'Submit Quotation Offer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
