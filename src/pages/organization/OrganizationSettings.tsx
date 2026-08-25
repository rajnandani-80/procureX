import React, { useState, useEffect } from 'react';
import {
  organizationService,
  departmentService,
  categoryService,
  unitService,
  approvalRuleService
} from '../../services/procurementService.js';
import { Organization, Department, Category, Unit, ApprovalRule } from '../../types/index.js';
import { TableSkeleton } from '../../components/common/Skeleton.js';
import { Modal } from '../../components/common/Modal.js';
import { formatCurrency } from '../../utils/formatters.js';
import { Building, Layers, Sliders, Plus, Save, Check } from 'lucide-react';

export const OrganizationSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'DEPARTMENTS' | 'CATEGORIES' | 'UNITS' | 'RULES'>('SETTINGS');

  const [org, setOrg] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Settings form state
  const [orgName, setOrgName] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [savingOrg, setSavingOrg] = useState<boolean>(false);
  const [orgSaved, setOrgSaved] = useState<boolean>(false);

  // Modal states
  const [deptModalOpen, setDeptModalOpen] = useState<boolean>(false);
  const [catModalOpen, setCatModalOpen] = useState<boolean>(false);
  const [unitModalOpen, setUnitModalOpen] = useState<boolean>(false);
  const [ruleModalOpen, setRuleModalOpen] = useState<boolean>(false);

  // Form Inputs
  const [newDeptName, setNewDeptName] = useState<string>('');
  const [newDeptCode, setNewDeptCode] = useState<string>('');
  const [newDeptBudget, setNewDeptBudget] = useState<number>(1000000);

  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatCode, setNewCatCode] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');

  const [newUnitName, setNewUnitName] = useState<string>('');
  const [newUnitCode, setNewUnitCode] = useState<string>('');

  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleMin, setNewRuleMin] = useState<number>(0);
  const [newRuleMax, setNewRuleMax] = useState<number>(100000);
  const [newRuleRole, setNewRuleRole] = useState<'ORGANIZATION_ADMIN' | 'PROCUREMENT_MANAGER' | 'FINANCE'>('PROCUREMENT_MANAGER');

  const loadData = async () => {
    setLoading(true);
    try {
      const [oRes, dRes, cRes, uRes, rRes] = await Promise.all([
        organizationService.getCurrentOrg(),
        departmentService.getDepartments(),
        categoryService.getCategories(),
        unitService.getUnits(),
        approvalRuleService.getRules()
      ]);

      if (oRes.organization) {
        setOrg(oRes.organization);
        setOrgName(oRes.organization.name);
        setCurrency(oRes.organization.currency);
        setTimezone(oRes.organization.timezone);
      }

      if (dRes.departments) setDepartments(dRes.departments);
      if (cRes.categories) setCategories(cRes.categories);
      if (uRes.units) setUnits(uRes.units);
      if (rRes.rules) setRules(rRes.rules);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrg(true);
    try {
      await organizationService.updateOrg({ name: orgName, currency, timezone });
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 2000);
      loadData();
    } finally {
      setSavingOrg(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await departmentService.createDepartment({ name: newDeptName, code: newDeptCode, budget: newDeptBudget });
      setDeptModalOpen(false);
      setNewDeptName('');
      setNewDeptCode('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.createCategory({ name: newCatName, code: newCatCode, description: newCatDesc });
      setCatModalOpen(false);
      setNewCatName('');
      setNewCatCode('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await unitService.createUnit({ name: newUnitName, code: newUnitCode });
      setUnitModalOpen(false);
      setNewUnitName('');
      setNewUnitCode('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await approvalRuleService.createRule({
        name: newRuleName,
        minAmount: newRuleMin,
        maxAmount: newRuleMax,
        approverRole: newRuleRole
      });
      setRuleModalOpen(false);
      setNewRuleName('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
          <Building className="w-5 h-5 text-[#D4AF37]" /> Organization Master Setup
        </h1>
        <p className="text-xs text-[#88888E] mt-0.5">Configure organization defaults, departments, catalog taxonomy, and approval rules</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#26262B] gap-6 text-xs font-semibold text-[#88888E]">
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'SETTINGS' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent hover:text-[#EAEAEA]'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'DEPARTMENTS' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent hover:text-[#EAEAEA]'
          }`}
        >
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'CATEGORIES' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent hover:text-[#EAEAEA]'
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('UNITS')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'UNITS' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent hover:text-[#EAEAEA]'
          }`}
        >
          Units ({units.length})
        </button>
        <button
          onClick={() => setActiveTab('RULES')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'RULES' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent hover:text-[#EAEAEA]'
          }`}
        >
          Approval Rules ({rules.length})
        </button>
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs p-6 max-w-2xl space-y-5">
          <h3 className="text-sm font-bold text-[#EAEAEA] border-b border-[#26262B] pb-3">Organization Preferences</h3>
          <form onSubmit={handleUpdateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1">Organization Legal Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0A0C] border border-[#26262B] text-xs text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#88888E] mb-1">Base Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0A0C] border border-[#26262B] text-xs text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#88888E] mb-1">Default Timezone</label>
                <input
                  type="text"
                  required
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0A0C] border border-[#26262B] text-xs text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingOrg}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                {orgSaved ? <Check className="w-4 h-4 text-emerald-900" /> : <Save className="w-4 h-4" />}
                {savingOrg ? 'Saving...' : orgSaved ? 'Changes Saved!' : 'Save Master Preferences'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EAEAEA]">Departments Directory</h3>
            <button
              onClick={() => setDeptModalOpen(true)}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          <table className="w-full text-left text-xs text-[#EAEAEA]">
            <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Department Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Annual Allocated Budget</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262B]">
              {departments.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-bold text-[#EAEAEA]">{d.name}</td>
                  <td className="px-4 py-3 font-mono text-[#D4AF37]">{d.code}</td>
                  <td className="px-4 py-3 font-semibold text-[#EAEAEA]">{formatCurrency(d.budget)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'CATEGORIES' && (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EAEAEA]">Product Categories</h3>
            <button
              onClick={() => setCatModalOpen(true)}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <table className="w-full text-left text-xs text-[#EAEAEA]">
            <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262B]">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-bold text-[#EAEAEA]">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-[#D4AF37]">{c.code}</td>
                  <td className="px-4 py-3 text-[#88888E]">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: UNITS */}
      {activeTab === 'UNITS' && (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EAEAEA]">Measurement Units</h3>
            <button
              onClick={() => setUnitModalOpen(true)}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Unit
            </button>
          </div>

          <table className="w-full text-left text-xs text-[#EAEAEA]">
            <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Unit Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262B]">
              {units.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-bold text-[#EAEAEA]">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-[#D4AF37]">{u.code}</td>
                  <td className="px-4 py-3 text-[#88888E]">{u.description || 'Standard Unit'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: APPROVAL RULES */}
      {activeTab === 'RULES' && (
        <div className="bg-[#16161A] rounded-2xl border border-[#26262B] shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EAEAEA]">Requisition Approval Threshold Rules</h3>
            <button
              onClick={() => setRuleModalOpen(true)}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Build Approval Rule
            </button>
          </div>

          <table className="w-full text-left text-xs text-[#EAEAEA]">
            <thead className="bg-[#111114] border-b border-[#26262B] text-[#66666E] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Rule Name</th>
                <th className="px-4 py-3">Spend Range</th>
                <th className="px-4 py-3">Mandatory Approver Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262B]">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-bold text-[#EAEAEA]">{r.name}</td>
                  <td className="px-4 py-3 font-semibold text-[#D4AF37]">
                    {formatCurrency(r.minAmount)} — {formatCurrency(r.maxAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-[#111114] border border-[#26262B] text-[#D4AF37] rounded-full font-bold">
                      {r.approverRole.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals for Dept, Cat, Unit, Rule */}
      <Modal isOpen={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="Create Department">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Department Title</label>
            <input
              type="text"
              required
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="e.g. Quality Assurance"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Department Code</label>
            <input
              type="text"
              required
              value={newDeptCode}
              onChange={(e) => setNewDeptCode(e.target.value)}
              placeholder="QA"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Allocated Budget (₹)</label>
            <input
              type="number"
              value={newDeptBudget}
              onChange={(e) => setNewDeptBudget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="submit" className="px-5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl cursor-pointer">
              Create Department
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title="Create Category">
        <form onSubmit={handleCreateCat} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Category Name</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Heavy Machinery"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Code</label>
            <input
              type="text"
              required
              value={newCatCode}
              onChange={(e) => setNewCatCode(e.target.value)}
              placeholder="MACH"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="submit" className="px-5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl cursor-pointer">
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={unitModalOpen} onClose={() => setUnitModalOpen(false)} title="Create Unit">
        <form onSubmit={handleCreateUnit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Unit Title</label>
            <input
              type="text"
              required
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="e.g. Meters"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Code</label>
            <input
              type="text"
              required
              value={newUnitCode}
              onChange={(e) => setNewUnitCode(e.target.value)}
              placeholder="MTR"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="submit" className="px-5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl cursor-pointer">
              Create Unit
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={ruleModalOpen} onClose={() => setRuleModalOpen(false)} title="Build Approval Rule">
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Rule Title</label>
            <input
              type="text"
              required
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              placeholder="e.g. High Value Machinery Purchase Escalation"
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1">Min Spend (₹)</label>
              <input
                type="number"
                value={newRuleMin}
                onChange={(e) => setNewRuleMin(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#88888E] mb-1">Max Spend (₹)</label>
              <input
                type="number"
                value={newRuleMax}
                onChange={(e) => setNewRuleMax(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#88888E] mb-1">Mandatory Approver Role</label>
            <select
              value={newRuleRole}
              onChange={(e) => setNewRuleRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA]"
            >
              <option value="PROCUREMENT_MANAGER">Procurement Manager</option>
              <option value="ORGANIZATION_ADMIN">Organization Admin</option>
              <option value="FINANCE">Finance</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="submit" className="px-5 py-2 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl cursor-pointer">
              Save Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
