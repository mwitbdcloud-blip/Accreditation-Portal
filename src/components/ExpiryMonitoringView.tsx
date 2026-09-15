import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Bell,
  RefreshCw,
  Zap,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { AgentProfile, AccreditationRecord, SystemSettings } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface ExpiryMonitoringViewProps {
  agents: AgentProfile[];
  accreditations: AccreditationRecord[];
  settings: SystemSettings;
  onFastForwardTime: (months: number) => void;
}

export const ExpiryMonitoringView: React.FC<ExpiryMonitoringViewProps> = ({
  agents,
  accreditations,
  settings,
  onFastForwardTime,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Filter agents with accreditation records
  const monitoredAgents = agents.map((agent) => {
    const activeAcc = accreditations.find(
      (a) => a.affiliateCode === agent.affiliateCode && (a.status === 'Active' || a.status === 'Expiring Soon')
    );
    const pastAcc = accreditations.find((a) => a.affiliateCode === agent.affiliateCode);
    return {
      ...agent,
      record: activeAcc || pastAcc,
    };
  }).filter((a) =>
    a.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulateExpiry = async (months: number) => {
    setIsSimulating(true);
    await onFastForwardTime(months);
    setIsSimulating(false);
  };

  return (
    <div id="expiry-monitoring-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-900 rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">4-Month Accreditation Expiry Radar</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated monitoring engine enforcing the strict 4-month accreditation cycle (Start Date + 4 months).
              Tracks expiration deadlines, fires automated notifications, and unlocks renewal while maintaining permanent Affiliate Codes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSimulateExpiry(4)}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 rounded-lg shadow-xs transition"
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              Fast-Forward 4 Months (Test Expiry)
            </button>
          </div>
        </div>

        {/* Reminder Intervals Schedule */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-blue-900" />
            <div>
              <strong className="text-slate-800 block font-semibold">Automated Renewal Notifications Schedule:</strong>
              <span className="text-slate-500">
                Triggered at 30 days before expiry • 15 days before expiry • 7 days before expiry • On Expiry Date (Automatic Renewal Unlock)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Cron Active
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Affiliate Code or Name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Monitoring {monitoredAgents.length} Affiliates
        </span>
      </div>

      {/* Agent Expiry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitoredAgents.map((agent) => {
          const isActive = agent.accreditationStatus === 'Active';
          const isExpiring = agent.accreditationStatus === 'Expiring Soon';
          const isExpired = agent.accreditationStatus === 'Expired';
          const daysRemaining = agent.record?.daysRemaining ?? (isActive ? 90 : 0);

          return (
            <div
              key={agent.affiliateCode}
              className={`p-5 rounded-2xl border-2 transition shadow-xs flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-slate-200 hover:border-emerald-300'
                  : isExpiring
                  ? 'bg-amber-50/50 border-amber-300'
                  : isExpired
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-950">
                    {agent.affiliateCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : isExpiring
                        ? 'bg-amber-100 text-amber-800'
                        : isExpired
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {agent.accreditationStatus}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{agent.fullName}</h3>
                <p className="text-xs text-slate-500">{agent.position} • {agent.region}</p>

                {/* Days remaining meter */}
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Days Remaining:</span>
                    <span
                      className={
                        isExpired
                          ? 'text-rose-700 font-bold'
                          : isExpiring
                          ? 'text-amber-700 font-bold'
                          : 'text-emerald-700 font-bold'
                      }
                    >
                      {daysRemaining} Days
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isExpired
                          ? 'bg-rose-500 w-0'
                          : isExpiring
                          ? 'bg-amber-500 w-1/4'
                          : 'bg-emerald-500 w-3/4'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Start: {formatDate(agent.accreditationStartDate)}</span>
                    <span>Expires: {formatDate(agent.accreditationExpiryDate)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Renewal Eligibility:</span>
                {agent.renewalEligibility || isExpired || isExpiring ? (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked & Available
                  </span>
                ) : (
                  <span className="text-slate-400">Locked (Term Active)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
