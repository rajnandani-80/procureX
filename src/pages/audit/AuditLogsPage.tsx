import React, { useState, useEffect } from 'react';
import { auditLogService } from '../../services/procurementService.js';
import { AuditLog } from '../../types/index.js';
import { ShieldCheck, Search, Clock, User, FileCode } from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton.js';
import { formatDate } from '../../utils/formatters.js';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await auditLogService.getLogs();
        if (res.success) setLogs(res.auditLogs);
      } catch (e) {
        console.error('Failed to load audit logs', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.performedByName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#EAEAEA] tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Security & Governance Audit Trail
        </h1>
        <p className="text-xs text-[#88888E] mt-0.5">Immutable tenant system activity, security events & administrative compliance logs</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#66666E] absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit entries by user, action or entity..."
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
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Action Event</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262B]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1C1C21]">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#88888E]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#66666E]" /> {formatDate(log.timestamp)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#EAEAEA]">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#D4AF37]" /> {log.performedByName}
                      </span>
                      <span className="text-[10px] text-[#D4AF37] block pl-5 uppercase">{log.performedByRole?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#D4AF37] font-semibold">{log.action}</td>
                    <td className="px-5 py-3.5 font-mono text-[#88888E]">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-[#66666E]" /> {log.entity} #{log.entityId.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#88888E] max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
