import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { productService, purchaseRequestService, departmentService } from '../../services/procurementService.js';
import { Product, Department } from '../../types/index.js';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

interface CreatePRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePRModal: React.FC<CreatePRModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 }
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      productService.getProducts().then((res) => {
        if (res.products) {
          setProducts(res.products);
          if (res.products.length > 0) {
            setItems([{ productId: res.products[0].id, quantity: 1 }]);
          }
        }
      });
      departmentService.getDepartments().then((res) => {
        if (res.departments && res.departments.length > 0) {
          setDepartments(res.departments);
          setDepartmentId(res.departments[0].id);
        }
      });
    }
  }, [isOpen]);

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const updated = [...items];
    updated[index].productId = productId;
    setItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, quantity);
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return sum + (prod ? prod.unitPrice : 0) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('Please provide a justification for this purchase request.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await purchaseRequestService.createRequest({
        departmentId,
        justification,
        items
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit purchase request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Purchase Request" subtitle="Submit item requisition for approval">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">{error}</div>}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">Requested Items</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add Line Item
            </button>
          </div>

          {items.map((item, idx) => {
            const selectedProd = products.find((p) => p.id === item.productId);
            return (
              <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="flex-1">
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — {formatCurrency(p.unitPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-center focus:ring-2 focus:ring-indigo-500"
                    placeholder="Qty"
                  />
                </div>

                <div className="w-28 text-right font-semibold text-xs text-slate-700">
                  {formatCurrency((selectedProd ? selectedProd.unitPrice : 0) * item.quantity)}
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
          <span className="text-xs font-semibold text-indigo-900">Total Estimated Spend</span>
          <span className="text-base font-bold text-indigo-700">{formatCurrency(calculateTotal())}</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Business Justification</label>
          <textarea
            required
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explain the requirement, urgency, and operational purpose..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
