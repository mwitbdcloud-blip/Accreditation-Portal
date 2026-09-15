import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  RefreshCw,
  TrendingUp,
  FileCheck,
  Calendar,
  Database,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AgentProfile, AccreditationApplication, SystemSettings } from '../types';

interface AdminOverviewProps {
  agents: AgentProfile[];
  applications: AccreditationApplication[];
  settings: SystemSettings;
  onNavigateTab: (tab: string) => void;
  onSyncGoogleSheets: () => void;
  onFastForwardTime: (months: number) => void;
  isSyncingSheets: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  agents,
  applications,
  settings,
  onNavigateTab,
  onSyncGoogleSheets,
  onFastForwardTime,
  isSyncingSheets,
}) => {
  const [fastForwardMonths, setFastForwardMonths] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);

  // Computed metrics
  const totalIPAs = agents.length;
  const activeIPAs = agents.filter((a) => a.accreditationStatus === 'Active').length;
  const expiredIPAs = agents.filter((a) => a.accreditationStatus === 'Expired').length;
  const expiringSoonIPAs = agents.filter((a) => a.accreditationStatus === 'Expiring Soon').length;

  const newApplications = applications.filter((app) => app.applicationType === 'New').length;
  const renewalApplications = applications.filter((app) => app.applicationType === 'Renewal').length;
  const pendingApprovals = applications.filter((app) => app.status === 'Submitted' || app.status === 'Under Review').length;
  const pendingDocuments = applications.filter(
    (app) => !app.governmentIdUrl || !app.idPhotoUrl || app.idVerificationStatus === 'Pending' || app.idVerificationStatus === 'For Review'
  ).length;

  const handleSimulate = async () => {
    setIsSimulating(true);
    await onFastForwardTime(fastForwardMonths);
    setIsSimulating(false);
  };

  return (
    <div id="admin-overview-content" className="space-y-6">
      {/* Top Banner with Google Sheets Integration Status */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-800/60 rounded-full border border-blue-700/50 text-blue-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Operations & BD Management Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              International Property Affiliates
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Monitoring <strong>{totalIPAs}</strong> permanent IPAs worldwide • Google Sheets Agents Database Connected
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="sync-sheets-btn"
              onClick={onSyncGoogleSheets}
              disabled={isSyncingSheets}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded-xl shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              {isSyncingSheets ? 'Syncing with Sheets...' : 'Sync Agents Database'}
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('agentsDatabase')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition"
            >
              <Database className="w-3.5 h-3.5" /> View Spreadsheet Table
            </button>
          </div>
        </div>
      </div>

      {/* 8 Primary Cards as specified in prompt Section 21 */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Core Operations Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Total IPAs */}
          <div
            onClick={() => onNavigateTab('agentsDatabase')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total IPAs</span>
              <Users className="w-4 h-4 text-blue-900" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalIPAs}</div>
            <p className="text-[11px] text-slate-500 mt-1">Unique affiliate codes</p>
          </div>

          {/* 2. Active IPAs */}
          <div
            onClick={() => onNavigateTab('accreditationMonitoring')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-semibold">Active IPAs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{activeIPAs}</div>
            <p className="text-[11px] text-slate-500 mt-1">Current 4-month cycle</p>
          </div>

          {/* 3. Expired IPAs */}
          <div
            onClick={() => onNavigateTab('accreditationMonitoring')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-400 transition"
          >
            <div className="flex items-center justify-between text-rose-700 mb-2">
              <span className="text-xs font-semibold">Expired IPAs</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-700">{expiredIPAs}</div>
            <p className="text-[11px] text-slate-500 mt-1">Renewal unlocked</p>
          </div>

          {/* 4. Expiring Soon */}
          <div
            onClick={() => onNavigateTab('accreditationMonitoring')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition"
          >
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-semibold">Expiring Soon</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{expiringSoonIPAs}</div>
            <p className="text-[11px] text-slate-500 mt-1">Within 30-day window</p>
          </div>

          {/* 5. New Applications */}
          <div
            onClick={() => onNavigateTab('applications')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between text-blue-900 mb-2">
              <span className="text-xs font-semibold">New Applications</span>
              <FileText className="w-4 h-4 text-blue-900" />
            </div>
            <div className="text-2xl font-bold text-blue-950">{newApplications}</div>
            <p className="text-[11px] text-slate-500 mt-1">First-time accreditations</p>
          </div>

          {/* 6. Renewal Applications */}
          <div
            onClick={() => onNavigateTab('applications')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-xs font-semibold">Renewal Applications</span>
              <RefreshCw className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-emerald-950">{renewalApplications}</div>
            <p className="text-[11px] text-slate-500 mt-1">Retaining permanent IPA</p>
          </div>

          {/* 7. Pending Approvals */}
          <div
            onClick={() => onNavigateTab('applications')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition"
          >
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-semibold">Pending Approvals</span>
              <FileCheck className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-bold text-amber-900">{pendingApprovals}</div>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting BD verification</p>
          </div>

          {/* 8. Pending Documents */}
          <div
            onClick={() => onNavigateTab('applications')}
            className="cursor-pointer bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 transition"
          >
            <div className="flex items-center justify-between text-purple-800 mb-2">
              <span className="text-xs font-semibold">Pending Documents</span>
              <FileText className="w-4 h-4 text-purple-700" />
            </div>
            <div className="text-2xl font-bold text-purple-900">{pendingDocuments}</div>
            <p className="text-[11px] text-slate-500 mt-1">ID/1x1 photo review</p>
          </div>
        </div>
      </div>

      {/* Testing & Fast-Forward Simulator (Crucial for verifying 4-month cycle & renewal!) */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-200 text-amber-900 rounded-lg">
                <Zap className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-amber-950">
                Accreditation Expiry & Renewal Cycle Simulator
              </h3>
            </div>
            <p className="text-xs text-amber-900/80 max-w-2xl">
              Test the automated 4-month expiry mechanism. Fast-forward time to see active accreditations transition, notifications fire, and renewal buttons automatically unlock with permanent Affiliate Codes preserved!
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={fastForwardMonths}
              onChange={(e) => setFastForwardMonths(Number(e.target.value))}
              className="px-3 py-2 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-amber-950 focus:outline-none"
            >
              <option value={3.5}>+ 3.5 Months (Expiring Soon)</option>
              <option value={4}>+ 4 Months (Expired & Unlock Renewal)</option>
            </select>

            <button
              type="button"
              id="simulate-fast-forward-btn"
              onClick={handleSimulate}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 rounded-lg shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Simulating...' : 'Simulate Expiry'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Tables & Status Snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Queue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-900" /> Recent Applications Pending Review
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('applications')}
              className="text-xs text-blue-900 font-semibold hover:underline"
            >
              View all ({applications.length})
            </button>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                onClick={() => onNavigateTab('applications')}
                className="cursor-pointer p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-between transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-950">{app.affiliateCode}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        app.applicationType === 'Renewal' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {app.applicationType}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">{app.personalDetails.fullName}</p>
                  <p className="text-[11px] text-slate-500">{app.region} • {app.position}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      app.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'Under Review' || app.status === 'Submitted'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {app.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{app.dateSubmitted.split('T')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Architecture Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" /> Multi-Phase Enterprise Integrations
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block">Google Sheets Agents Database</strong>
                <span className="text-slate-500">ID: {settings.googleSpreadsheetId}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                {settings.sheetsSyncStatus}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block">Google Drive Document Storage</strong>
                <span className="text-slate-500">Folder: /Agents/{'{Region}'}/{'{AffiliateCode}'}/</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                Configured
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block">Google Docs Contract Generator</strong>
                <span className="text-slate-500">Template: {settings.contractTemplateName}</span>
              </div>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full">
                Active
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block">Firebase Security & Role Access</strong>
                <span className="text-slate-500">RBAC Rules: Agent, Staff, Admin Roles</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                Enforced
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
