import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/procurementService.js';
import { BarChart3, TrendingUp, DollarSign, Store, PieChart } from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton.js';
import { formatCurrency } from '../../utils/formatters.js';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [vendorPerf, setVendorPerf] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [sumRes, perfRes] = await Promise.all([
          reportService.getPurchaseSummary(),
          reportService.getVendorPerformance()
        ]);
        if (sumRes.success) setSummary(sumRes.summary);
        if (perfRes.success) setVendorPerf(perfRes.performance);
      } catch (e) {
        console.error('Failed to load reports', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#D4AF37]" /> Executive Spend & Vendor Performance Analytics
        </h1>
        <p className="text-xs text-[#88888E] mt-0.5">Corporate procurement analytics, spend velocity & supplier evaluation metrics</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs">
              <div className="flex items-center justify-between text-[#88888E] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Commited Spend</span>
                <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-black text-[#EAEAEA]">{formatCurrency(summary?.totalSpend || 0)}</div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> +12.4% vs last quarter
              </p>
            </div>

            <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs">
              <div className="flex items-center justify-between text-[#88888E] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active PO Volume</span>
                <PieChart className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-black text-[#EAEAEA]">{summary?.poCount || 0} Orders</div>
              <p className="text-[11px] text-[#88888E] mt-1 font-mono">Issued to verified vendors</p>
            </div>

            <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs">
              <div className="flex items-center justify-between text-[#88888E] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Average Fulfillment Time</span>
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-black text-[#EAEAEA]">4.2 Days</div>
              <p className="text-[11px] text-emerald-400 mt-1 font-semibold">98.1% On-time delivery SLA</p>
            </div>

            <div className="p-5 bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs">
              <div className="flex items-center justify-between text-[#88888E] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Cost Savings Realized</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">$28,450</div>
              <p className="text-[11px] text-[#88888E] mt-1 font-mono">Via competitive vendor bidding</p>
            </div>
          </div>

          {/* Vendor Performance Scorecard */}
          <div className="bg-[#16161A] rounded-2xl border border-[#26262B] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#EAEAEA] mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#D4AF37]" /> Vendor Performance Scorecard
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#EAEAEA]">
                <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Vendor Partner</th>
                    <th className="px-5 py-3.5">Fulfillment Rate</th>
                    <th className="px-5 py-3.5">Quality Pass Score</th>
                    <th className="px-5 py-3.5">Avg Lead Time</th>
                    <th className="px-5 py-3.5">Total PO Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26262B]">
                  {vendorPerf.map((vp) => (
                    <tr key={vp.vendorId} className="hover:bg-[#1C1C21]">
                      <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">{vp.vendorName}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-400">{vp.fulfillmentRate}%</td>
                      <td className="px-5 py-3.5 font-bold text-[#D4AF37]">{vp.qualityScore}%</td>
                      <td className="px-5 py-3.5 text-[#88888E]">{vp.avgLeadTimeDays} Days</td>
                      <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">{formatCurrency(vp.totalPOValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
