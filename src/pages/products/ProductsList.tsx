import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services/procurementService.js';
import { Product, Category } from '../../types/index.js';
import { Package, Plus, Search, Tag, AlertTriangle } from 'lucide-react';
import { CreateProductModal } from '../../components/modals/CreateProductModal.js';
import { Skeleton } from '../../components/common/Skeleton.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.js';

export const ProductsList: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([productService.getProducts(), categoryService.getCategories()]);
      if (pRes.success) setProducts(pRes.products);
      if (cRes.success) setCategories(cRes.categories);
    } catch (e) {
      console.error('Failed to load products/categories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'ALL' || p.categoryId === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" /> Enterprise Product Master Catalog
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Centralized item SKUs, standard pricing & inventory threshold levels</p>
        </div>

        {(user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'PROCUREMENT_MANAGER') && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Item SKU
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#66666E] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by SKU or title..."
            className="w-full pl-10 pr-4 py-2 bg-[#16161A] border border-[#26262B] text-[#EAEAEA] placeholder-[#66666E] rounded-xl text-xs focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3.5 py-2 bg-[#16161A] border border-[#26262B] text-[#EAEAEA] rounded-xl text-xs focus:border-[#D4AF37] focus:outline-none shrink-0"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EAEAEA]">
              <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3.5">SKU / Item Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Standard Price</th>
                  <th className="px-5 py-3.5">Unit</th>
                  <th className="px-5 py-3.5">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262B]">
                {filtered.map((prod) => {
                  const isLow = prod.currentStock <= prod.minStockLevel;
                  return (
                    <tr key={prod.id} className="hover:bg-[#1C1C21]">
                      <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <div>{prod.name}</div>
                        </div>
                        <div className="text-[11px] text-[#66666E] font-mono font-normal pl-5.5">{prod.sku}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[#88888E]">{prod.categoryName || 'General'}</td>
                      <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">{formatCurrency(prod.unitPrice)}</td>
                      <td className="px-5 py-3.5 text-[#88888E] uppercase font-mono">{prod.unitName || 'PCS'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}
                          >
                            {prod.currentStock} {prod.unitName || 'PCS'}
                          </span>
                          {isLow && (
                            <span className="p-1 bg-amber-500/10 text-amber-400 rounded-md">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateProductModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
};
