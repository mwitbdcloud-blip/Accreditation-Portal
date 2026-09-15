import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  RefreshCw,
  ExternalLink,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  Download,
  Lock,
} from 'lucide-react';
import {
  AgentProfile,
  AccreditationApplication,
  AccreditationRecord,
  PositionContractTemplate,
} from '../types';
import { formatDate } from '../utils/dateFormatter';

interface AgentDashboardProps {
  agent: AgentProfile;
  applications: AccreditationApplication[];
  accreditations: AccreditationRecord[];
  positionContract?: PositionContractTemplate | null;
  onNavigateToAccreditation: () => void;
  onViewContract: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agent,
  applications,
  accreditations,
  positionContract,
  onNavigateToAccreditation,
  onViewContract,
}) => {
  const latestApp = applications[0];
  const isExpired = agent.accreditationStatus === 'Expired';
  const isExpiringSoon = agent.accreditationStatus === 'Expiring Soon';
  const isActive = agent.accreditationStatus === 'Active';
  const isUnderReview = agent.accreditationStatus === 'Pending Review' || latestApp?.status === 'Submitted' || latestApp?.status === 'Under Review';
  const isNotStarted = agent.accreditationStatus === 'Not Started' || !latestApp;

  const contractFileName = positionContract?.fileName || `Megaworld_SAA_${agent.position.replace(/\s+/g, '_')}.pdf`;
  const fileExt = contractFileName.split('.').pop()?.toUpperCase() || 'PDF';

  const handleDirectContractDownload = () => {
    // Open the official contract viewer and downloader with full pages and e-signatures
    onViewContract();
  };

  // Next action advice logic
  let nextActionTitle = 'Complete your Accreditation Application';
  let nextActionDesc = 'Submit your personal details, banking info, 1x1 photo, and e-signature to activate your 4-month accreditation.';
  let nextActionType: 'action' | 'review' | 'active' | 'expired' = 'action';

  if (isUnderReview) {
    nextActionTitle = 'Your application is currently under review';
    nextActionDesc = 'Our BD Staff operations team is verifying your submitted valid ID, photo, and details. You will be notified upon approval.';
    nextActionType = 'review';
  } else if (isActive) {
    nextActionTitle = `Your accreditation is active until ${formatDate(agent.accreditationExpiryDate) || 'the end of your 4-month cycle'}`;
    nextActionDesc = 'You are fully authorized to represent Megaworld International and offer all megaworld and subsidiaries projects. View your signed Sales Agency Agreement or Contract anytime.';
    nextActionType = 'active';
  } else if (isExpired) {
    nextActionTitle = 'Your accreditation has expired. Please submit your renewal application.';
    nextActionDesc = `Your IPA Code (${agent.affiliateCode}) remains reserved for you. Submit your 4-month renewal to reactivate commission eligibility.`;
    nextActionType = 'expired';
  } else if (isExpiringSoon) {
    nextActionTitle = 'Accreditation expiring soon — Renewal is now open';
    nextActionDesc = `Your 4-month cycle expires on ${formatDate(agent.accreditationExpiryDate)}. You can file your renewal application right now with pre-filled details.`;
    nextActionType = 'expired';
  }

  return (
    <div id="agent-dashboard-content" className="space-y-6">
      {/* Top Welcome / Identity Hero */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide">
              <span>Affiliate Portal</span>
              <span>•</span>
              <span>Megaworld International</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome, {agent.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              IPA Code: <strong className="font-mono text-amber-400">{agent.affiliateCode}</strong> • {agent.position} • {agent.region}
            </p>
          </div>

          {/* Accreditation Status Badge & Days Gauge */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 min-w-[220px] text-right sm:text-left">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider block font-medium">
              Accreditation Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-400 animate-pulse'
                    : isExpiringSoon
                    ? 'bg-amber-400'
                    : isExpired
                    ? 'bg-rose-400'
                    : 'bg-blue-400'
                }`}
              />
              <span className="text-base font-bold text-white">{agent.accreditationStatus}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {agent.accreditationExpiryDate
                ? `Expires: ${formatDate(agent.accreditationExpiryDate)}`
                : 'Pending accreditation submission'}
            </p>
          </div>
        </div>
      </div>

      {/* Prominent "Your Next Action" Banner */}
      <div
        className={`p-6 rounded-2xl border-2 shadow-xs transition-all ${
          nextActionType === 'active'
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : nextActionType === 'expired'
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : nextActionType === 'review'
            ? 'bg-blue-50/70 border-blue-300 text-blue-950'
            : 'bg-slate-50 border-slate-300 text-slate-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                nextActionType === 'active'
                  ? 'bg-emerald-200/80 text-emerald-900'
                  : nextActionType === 'expired'
                  ? 'bg-amber-200/80 text-amber-900'
                  : 'bg-blue-200/80 text-blue-900'
              }`}
            >
              {nextActionType === 'active' ? (
                <CheckCircle className="w-6 h-6" />
              ) : nextActionType === 'expired' ? (
                <Clock className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                Your Next Action
              </span>
              <h3 className="text-base sm:text-lg font-bold">{nextActionTitle}</h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">{nextActionDesc}</p>
            </div>
          </div>

          <div className="shrink-0">
            {isExpired || isExpiringSoon ? (
              <button
                type="button"
                onClick={onNavigateToAccreditation}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition"
              >
                <RefreshCw className="w-4 h-4" /> Start Renewal Application
              </button>
            ) : isNotStarted ? (
              <button
                type="button"
                onClick={onNavigateToAccreditation}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition"
              >
                Proceed to Accreditation <ArrowRight className="w-4 h-4" />
              </button>
            ) : isActive ? (
              <button
                type="button"
                onClick={onViewContract}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-200/80 hover:bg-emerald-300 rounded-xl transition"
              >
                <FileText className="w-4 h-4" /> View Sales Agreement
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Visual Application Progress Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-900" /> Accreditation Journey Tracker
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { label: 'Registration', done: true, current: false },
            { label: 'Personal Info', done: Boolean(latestApp?.personalDetails.fullName), current: false },
            { label: 'Bank Details', done: Boolean(latestApp?.bankDetails.accountNumber), current: false },
            { label: 'Team Details', done: Boolean(latestApp?.teamDetails.teamName), current: false },
            { label: 'Documents', done: Boolean(latestApp?.governmentIdUrl && latestApp?.idPhotoUrl), current: false },
            { label: 'Review & Submit', done: latestApp?.status === 'Submitted' || latestApp?.status === 'Approved', current: latestApp?.status === 'Draft' },
            { label: 'BD Staff Review', done: latestApp?.status === 'Approved', current: latestApp?.status === 'Submitted' || latestApp?.status === 'Under Review' },
            { label: 'Accredited (4 Mo)', done: isActive, current: false },
          ].map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                step.done
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : step.current
                  ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold ring-2 ring-blue-900/10'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step.done
                    ? 'bg-emerald-600 text-white'
                    : step.current
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step.done ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className="text-[11px] font-medium leading-tight">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 34: Accreditation History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-900" /> Accreditation History
            </h3>
            <p className="text-xs text-slate-500">
              IPA Code <strong className="text-blue-950 font-mono">{agent.affiliateCode}</strong> remains constant across multiple 4-month cycles.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Application Type</th>
                <th className="py-2.5 px-3">Position Tier</th>
                <th className="py-2.5 px-3">Start Date</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3">Term Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accreditations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No completed accreditation records yet. Submit your application to activate your first 4-month term.
                  </td>
                </tr>
              ) : (
                accreditations.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">{record.applicationType}</td>
                    <td className="py-3 px-3 text-slate-700">{record.position}</td>
                    <td className="py-3 px-3 text-slate-700">{formatDate(record.startDate)}</td>
                    <td className="py-3 px-3 text-slate-700">{formatDate(record.expiryDate)}</td>
                    <td className="py-3 px-3 text-slate-500">4 Months</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : record.status === 'Expiring Soon'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{record.approvedBy || 'Elena Ramos'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
