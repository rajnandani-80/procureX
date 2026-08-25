import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/procurementService.js';
import { InventoryItem } from '../../types/index.js';
import { Boxes, SlidersHorizontal, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { AdjustInventoryModal } from '../../components/modals/AdjustInventoryModal.js';
import { Skeleton } from '../../components/common/Skeleton.js';
import { useAuth } from '../../context/AuthContext.js';

export const InventoryList: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [adjustModalOpen, setAdjustModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventory();
      if (res.success) setInventory(res.inventory);
    } catch (e) {
      console.error('Failed to load inventory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustClick = (item: InventoryItem) => {
    setSelectedProduct(item);
    setAdjustModalOpen(true);
  };

  const filtered = inventory.filter(
    (i) =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#D4AF37]" /> Multi-Location Warehouse Inventory
          </h1>
          <p className="text-xs text-[#88888E] mt-0.5">Real-time stock level balances, bin locations & automatic reorder flags</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#66666E] absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SKU, item title or category..."
          className="w-full pl-10 pr-4 py-2 bg-[#16161A] border border-[#26262B] text-[#EAEAEA] placeholder-[#66666E] rounded-xl text-xs focus:border-[#D4AF37] focus:outline-none"
        />
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EAEAEA]">
              <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3.5">Product SKU & Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Current Balance</th>
                  <th className="px-5 py-3.5">Min Threshold</th>
                  <th className="px-5 py-3.5">Stock Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262B]">
                {filtered.map((item) => {
                  const isLow = item.currentStock <= item.minStockLevel;
                  return (
                    <tr key={item.id} className="hover:bg-[#1C1C21]">
                      <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">
                        <div>{item.productName}</div>
                        <div className="text-[11px] text-[#D4AF37] font-mono font-normal">{item.sku}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[#88888E]">{item.categoryName || 'General'}</td>
                      <td className="px-5 py-3.5 font-black text-sm text-[#EAEAEA]">
                        {item.currentStock} {item.unitName || 'PCS'}
                      </td>
                      <td className="px-5 py-3.5 text-[#88888E] font-mono">{item.minStockLevel} {item.unitName || 'PCS'}</td>
                      <td className="px-5 py-3.5">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Reorder Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> Healthy Stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {(user?.role === 'ORGANIZATION_ADMIN' || user?.role === 'WAREHOUSE_STAFF' || user?.role === 'PROCUREMENT_MANAGER') && (
                          <button
                            onClick={() => handleAdjustClick(item)}
                            className="px-3 py-1.5 bg-[#111114] border border-[#26262B] hover:bg-[#1C1C21] text-[#D4AF37] font-bold text-xs rounded-xl flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedProduct && (
        <AdjustInventoryModal
          isOpen={adjustModalOpen}
          onClose={() => {
            setAdjustModalOpen(false);
            setSelectedProduct(null);
          }}
          item={selectedProduct}
          onSuccess={fetchInventory}
        />
      )}
    </div>
  );
};
