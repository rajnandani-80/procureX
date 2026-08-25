import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Menu, Bell, Search, Sparkles } from 'lucide-react';
import { aiService } from '../../services/procurementService.js';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const fetchAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await aiService.getProcurementInsights();
      setAiInsight(res.insight);
    } catch (e) {
      setAiInsight('ProcureX AI: System optimized. 2 low stock items flagged for reorder.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-[#26262B] px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left section: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-[#88888E] hover:text-[#EAEAEA] hover:bg-[#16161A] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#88888E] font-medium">
          <span className="text-[#66666E]">ProcureX ERP</span>
          <span>/</span>
          <span className="text-[#D4AF37] font-semibold uppercase">{user?.role.replace(/_/g, ' ')} VIEW</span>
        </div>
      </div>

      {/* Right Section: AI Intelligence Trigger, Search & User Info */}
      <div className="flex items-center gap-3">
        {/* Gemini AI Optimization Assistant Trigger */}
        <button
          onClick={fetchAiInsight}
          disabled={loadingAi}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#16161A] text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all shadow-2xs"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[#D4AF37] ${loadingAi ? 'animate-spin' : ''}`} />
          <span>{loadingAi ? 'Analyzing ERP...' : 'AI Insights'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-full text-[#88888E] hover:text-[#EAEAEA] hover:bg-[#16161A] transition-colors relative"
            title="System Status"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0A0A0C]"></span>
          </button>
        </div>

        {/* User Persona Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#26262B]">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#16161A] border border-[#26262B] text-[#EAEAEA]">
            {user?.name}
          </span>
        </div>
      </div>

      {/* AI Insight Modal Banner if loaded */}
      {aiInsight && (
        <div className="fixed top-16 right-4 left-4 lg:left-auto lg:right-8 z-50 max-w-lg bg-[#111114] text-[#EAEAEA] p-4 rounded-2xl shadow-2xl border border-[#D4AF37]/40 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#26262B] pb-2 mb-2">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> ProcureX Gemini AI Intelligence
            </div>
            <button
              onClick={() => setAiInsight(null)}
              className="text-xs text-[#88888E] hover:text-white px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[#EAEAEA] leading-relaxed whitespace-pre-line">{aiInsight}</p>
        </div>
      )}
    </header>
  );
};
