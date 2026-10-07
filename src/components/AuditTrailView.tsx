import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, Download, Clock, Filter, FileSpreadsheet } from 'lucide-react';
import { AuditLog } from '../types';
import { formatDateTime } from '../utils/dateFormatter';

interface AuditTrailViewProps {
  auditLogs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  // Dynamic set of actions from live logs
  const availableActions = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter((log) => {
      if (!log) return false;
      const targetRecord = (log.affiliateCode || log.recordAffected || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const details = (log.details || '').toLowerCase();
      const performer = (log.performedBy || log.user || '').toLowerCase();
      const role = String(log.role || '').toLowerCase();
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        targetRecord.includes(search) ||
        action.includes(search) ||
        details.includes(search) ||
        performer.includes(search) ||
        role.includes(search);

      const matchesAction = actionFilter === 'All' || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchTerm, actionFilter]);

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Record / Affiliate Code', 'Action', 'Performed By', 'Role', 'IP Address', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${formatDateTime(l.timestamp)}"`,
      `"${l.affiliateCode || l.recordAffected || '—'}"`,
      `"${(l.action || '—').replace(/"/g, '""')}"`,
      `"${(l.performedBy || l.user || 'System').replace(/"/g, '""')}"`,
      `"${l.role || '—'}"`,
      `"${l.ipAddress || 'Internal'}"`,
      `"${(l.details || '—').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IPA_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="audit-trail-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Immutable Compliance Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-proof chronological log recording every registration, review, contract generation, and expiry update.
          </p>
        </div>

        <button
          type="button"
          onClick={exportAuditCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Export Audit Log (CSV)
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Affiliate Code, Action, User..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-700"
          >
            <option value="All">All Audit Event Actions ({auditLogs.length})</option>
            {availableActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="text-right flex items-center justify-end text-xs text-slate-400">
          Showing {filteredLogs.length} audit records
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Affiliate / Target</th>
                <th className="py-3 px-4">Event / Action</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Channel / IP</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const roleStr = String(log.role || '').toLowerCase();
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-950 whitespace-nowrap">
                        {log.affiliateCode || log.recordAffected || '—'}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700 whitespace-nowrap">
                        {log.performedBy || log.user || 'System'}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            roleStr === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : roleStr === 'staff'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {String(log.role || 'system').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{log.ipAddress || 'Internal'}</td>
                      <td className="py-3 px-4 font-sans text-slate-600 max-w-md break-words">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
