import React from 'react';
import {
  BarChart3,
  Download,
  PieChart,
  FileSpreadsheet,
  Globe,
  Award,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { AgentProfile, AccreditationApplication, REGIONS, POSITIONS } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface ReportsViewProps {
  agents: AgentProfile[];
  applications: AccreditationApplication[];
  onSyncGoogleSheets: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  agents,
  applications,
  onSyncGoogleSheets,
}) => {
  const totalIPAs = agents.length;
  const activeCount = agents.filter((a) => a.accreditationStatus === 'Active').length;
  const expiredCount = agents.filter((a) => a.accreditationStatus === 'Expired').length;
  const expiringCount = agents.filter((a) => a.accreditationStatus === 'Expiring Soon').length;

  const newApps = applications.filter((app) => app.applicationType === 'New').length;
  const renewalApps = applications.filter((app) => app.applicationType === 'Renewal').length;
  const pendingApps = applications.filter((app) => app.status === 'Submitted' || app.status === 'Under Review').length;
  const approvedApps = applications.filter((app) => app.status === 'Approved').length;
  const rejectedApps = applications.filter((app) => app.status === 'Rejected').length;

  // Group by Region
  const regionCounts: Record<string, number> = {};
  REGIONS.forEach((r) => {
    regionCounts[r] = agents.filter((a) => a.region === r).length;
  });

  // Group by Position
  const positionCounts: Record<string, number> = {};
  POSITIONS.forEach((p) => {
    positionCounts[p] = agents.filter((a) => a.position === p).length;
  });

  const handleExportReportCSV = () => {
    const lines = [
      'MEGAWORLD INTERNATIONAL - IPA OPERATIONAL ACCREDITATION REPORT',
      `Generated Date: ${formatDate(new Date())}`,
      '',
      'METRIC,COUNT',
      `Total Registered IPAs,${totalIPAs}`,
      `Active Accreditations (4-Month Term),${activeCount}`,
      `Expired Accreditations,${expiredCount}`,
      `Expiring Soon (Within 30 Days),${expiringCount}`,
      `New Applications Filed,${newApps}`,
      `Renewal Applications Filed,${renewalApps}`,
      `Pending BD Review,${pendingApps}`,
      `Approved Applications,${approvedApps}`,
      `Rejected Applications,${rejectedApps}`,
      '',
      'REGION DISTRIBUTION',
      'Region,Count',
      ...Object.entries(regionCounts).map(([region, count]) => `"${region}",${count}`),
      '',
      'POSITION TIER DISTRIBUTION',
      'Position,Count',
      ...Object.entries(positionCounts).map(([pos, count]) => `"${pos}",${count}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IPA_Accreditation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-view" className="space-y-6">
      {/* Top Banner & Export */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Accreditation Analytics & Reports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global operational breakdowns of International Property Affiliates, renewal rates, and regional representation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportReportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Report (CSV)
          </button>
          <button
            type="button"
            onClick={onSyncGoogleSheets}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Export to Google Sheets
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Registered IPAs</span>
          <div className="text-2xl font-bold text-slate-900">{totalIPAs}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">100% Unique Affiliate Codes</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Active Accreditations</span>
          <div className="text-2xl font-bold text-emerald-700">{activeCount}</div>
          <span className="text-[11px] text-slate-400">Current 4-month term</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Expired / Renewal Due</span>
          <div className="text-2xl font-bold text-rose-700">{expiredCount}</div>
          <span className="text-[11px] text-rose-700 font-medium">Unlocked for renewal</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Approval Success Rate</span>
          <div className="text-2xl font-bold text-blue-900">
            {applications.length > 0 ? `${Math.round((approvedApps / applications.length) * 100)}%` : '100%'}
          </div>
          <span className="text-[11px] text-slate-400">{approvedApps} Approved</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-900" />
            <h3 className="font-bold text-slate-900 text-sm">Affiliate Representation Across Regions/Territories</h3>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {REGIONS.map((region) => {
              const count = regionCounts[region] || 0;
              const percentage = totalIPAs > 0 ? Math.round((count / totalIPAs) * 100) : 0;
              return (
                <div key={region} className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800">{region}</span>
                    <span className="text-blue-950 font-bold">{count} IPAs ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-900 h-full rounded-full transition-all" style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Position & Application Types Breakdown */}
        <div className="space-y-6">
          {/* Position Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-blue-900" />
              <h3 className="font-bold text-slate-900 text-sm">Position Tier Distribution</h3>
            </div>

            <div className="space-y-3">
              {POSITIONS.map((pos) => {
                const count = positionCounts[pos] || 0;
                const percentage = totalIPAs > 0 ? Math.round((count / totalIPAs) * 100) : 0;
                return (
                  <div key={pos} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900">{pos}</span>
                      <span className="text-emerald-700">{count} Agents ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Application Pipeline Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-slate-500 block">New Accreditations:</span>
                <span className="text-lg font-bold text-blue-950">{newApps}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-slate-500 block">4-Month Renewals:</span>
                <span className="text-lg font-bold text-emerald-950">{renewalApps}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
