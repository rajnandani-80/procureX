import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Sparkles, ShieldCheck, Lock, Mail, ArrowRight, Building } from 'lucide-react';
import { UserRole } from '../../types/index.js';

const DEMO_PRESETS: { role: UserRole; email: string; name: string }[] = [
  { role: 'ORGANIZATION_ADMIN', email: 'admin@apexcorp.com', name: 'Rajnandani (Org Admin)' },
  { role: 'PROCUREMENT_MANAGER', email: 'pm@apexcorp.com', name: 'Vikram (Procurement Mgr)' },
  { role: 'EMPLOYEE', email: 'employee@apexcorp.com', name: 'Ananya (Employee)' },
  { role: 'WAREHOUSE_STAFF', email: 'warehouse@apexcorp.com', name: 'Rajesh (Warehouse Staff)' },
  { role: 'FINANCE', email: 'finance@apexcorp.com', name: 'Priya (Finance)' },
  { role: 'VENDOR', email: 'vendor@techsupply.com', name: 'TechSupply (Vendor)' },
  { role: 'SUPER_ADMIN', email: 'superadmin@procurex.io', name: 'Super Admin' }
];

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('admin@apexcorp.com');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const autofillPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col lg:flex-row text-[#EAEAEA] font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Left Column — Visual Brand & Value Proposition */}
      <div className="lg:flex-1 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#26262B] bg-[#0A0A0C] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-xl shadow-[#D4AF37]/10">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#EAEAEA] tracking-tight">
                Procure<span className="text-[#D4AF37]">X</span>
              </h1>
              <p className="text-xs text-[#88888E] font-medium">Smart Procurement. Complete Control.</p>
            </div>
          </div>

          <div className="max-w-md space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              <Building className="w-3.5 h-3.5" /> Next-Gen Enterprise Procurement ERP
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#EAEAEA] leading-tight">
              Streamline requisition, purchase orders & inventory in real time.
            </h2>

            <p className="text-sm text-[#88888E] leading-relaxed">
              ProcureX connects organizations, procurement managers, warehouse teams, and vendors under a unified role-governed workflow with automated audit logging.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-xs text-[#EAEAEA]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-role access governance with custom approval threshold rules</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#EAEAEA]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Vendor quotation offer comparison & purchase order dispatching</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#EAEAEA]">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Goods Receipt Note (GRN) verification & automated stock adjustments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 text-xs text-[#66666E] border-t border-[#26262B] flex items-center justify-between">
          <span>© 2026 ProcureX Enterprise SaaS</span>
          <span className="text-[#88888E] font-mono">v1.0.0-PROD</span>
        </div>
      </div>

      {/* Right Column — Login Card & Quick Preset Selector */}
      <div className="lg:w-[480px] p-8 lg:p-12 flex flex-col justify-center bg-[#111114] border-l border-[#26262B]">
        <div className="max-w-sm w-full mx-auto space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-[#EAEAEA] tracking-tight">Sign In to ProcureX</h3>
            <p className="text-xs text-[#88888E] mt-1">Enter your credentials or choose a pre-configured demo account below</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#66666E] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] placeholder-[#66666E] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#66666E] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] placeholder-[#66666E] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Preset Selector */}
          <div className="pt-4 border-t border-[#26262B] space-y-2">
            <div className="text-[11px] font-semibold text-[#88888E] uppercase tracking-wider">
              Quick Demo Persona Login:
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.role}
                  onClick={() => autofillPreset(preset.email)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                    email === preset.email
                      ? 'bg-[#1C1C21] border border-[#D4AF37]/50 text-[#D4AF37] font-semibold'
                      : 'bg-[#16161A] border border-[#26262B] text-[#88888E] hover:text-[#EAEAEA] hover:bg-[#1C1C21]'
                  }`}
                >
                  <span className="truncate">{preset.name}</span>
                  <span className="text-[10px] text-[#66666E] font-mono">password123</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
