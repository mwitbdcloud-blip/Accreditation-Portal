import React, { useState, useEffect } from 'react';
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
  FileCheck,
  CreditCard,
  QrCode,
  Maximize2,
  User,
} from 'lucide-react';
import {
  AgentProfile,
  AccreditationApplication,
  AccreditationRecord,
  PositionContractTemplate,
} from '../types';
import { formatDate } from '../utils/dateFormatter';
import {
  generateContractPdfFromTemplate,
} from '../utils/templateDocumentEngine';
import {
  downloadPdfBlob,
  getDefaultTemplateUrlForPosition,
} from '../utils/contractGenerator';
import { extractContractData } from './ContractDocument';
import { DigitalIdBadge } from './DigitalIdBadge';

interface AgentDashboardProps {
  agent: AgentProfile;
  applications: AccreditationApplication[];
  accreditations: AccreditationRecord[];
  positionContract?: PositionContractTemplate | null;
  onNavigateToAccreditation: () => void;
  onViewContract: () => void;
  initialSubView?: 'overview' | 'badge';
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agent,
  applications,
  accreditations,
  positionContract,
  onNavigateToAccreditation,
  onViewContract,
  initialSubView = 'overview',
}) => {
  const latestApp = applications[0];
  const isExpired = agent.accreditationStatus === 'Expired';
  const isExpiringSoon = agent.accreditationStatus === 'Expiring Soon';
  const isActive = agent.accreditationStatus === 'Active';
  const isUnderReview = agent.accreditationStatus === 'Pending Review' || latestApp?.status === 'Submitted' || latestApp?.status === 'Under Review';
  const isNotStarted = agent.accreditationStatus === 'Not Started' || !latestApp || latestApp?.status === 'Draft' || (agent.accreditationStatus === 'Pending' && latestApp?.status !== 'Submitted' && latestApp?.status !== 'Under Review');

  const [activeSubView, setActiveSubView] = useState<'overview' | 'badge'>(initialSubView);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  const photoUrl =
    agent.photoUrl ||
    agent.idPhotoUrl ||
    latestApp?.idPhotoUrl ||
    latestApp?.personalDetails?.idPhotoUrl;

  const handleDirectContractDownload = async () => {
    setIsDownloadingPdf(true);
    try {
      const contractData = extractContractData(latestApp, agent, (agent.position as any) || 'Marketing Associate');
      const templateSource =
        positionContract?.fileData ||
        positionContract?.templateUrl ||
        getDefaultTemplateUrlForPosition(agent.position);

      const genResult = await generateContractPdfFromTemplate(templateSource, contractData, agent.position);
      downloadPdfBlob(genResult.blob, genResult.fileName);
    } catch (err) {
      console.error('Error generating contract PDF for agent:', err);
      // Fallback to opening modal
      onViewContract();
    } finally {
      setIsDownloadingPdf(false);
    }
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
    nextActionDesc = 'You are fully authorized to represent Megaworld International and offer all megaworld and subsidiaries projects. View your signed Sales Agency Agreement (SAA) anytime.';
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
          <div className="flex items-start sm:items-center gap-4">
            {/* Agent Avatar Frame */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/70 shadow-md shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={agent.fullName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-amber-300">
                  {agent.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-semibold tracking-wide">
                <span>Affiliate Portal</span>
                <span>•</span>
                <span>Megaworld International</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                Welcome, {agent.fullName}
              </h1>
              <p className="text-xs text-slate-300">
                IPA Code: <strong className="font-mono text-amber-400">{agent.affiliateCode}</strong> •{' '}
                {agent.position && agent.position !== 'Pending Accreditation'
                  ? agent.position
                  : 'Accreditation Pending'}{' '}
                • {agent.region}
              </p>
            </div>
          </div>

          {/* Accreditation Status & Quick Badge Launcher */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 min-w-[200px] text-right sm:text-left">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-medium">
                Accreditation Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
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
                <span className="text-sm font-bold text-white">
                  {isActive ? 'Active' : isUnderReview ? 'Under Review' : isExpired ? 'Expired' : 'Pending Submission'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">
                {isActive && agent.accreditationExpiryDate
                  ? `Expires: ${formatDate(agent.accreditationExpiryDate)}`
                  : 'Pending accreditation cycle'}
              </p>
            </div>

            <button
              type="button"
              id="btn-hero-digital-badge"
              onClick={() => setActiveSubView('badge')}
              className="px-4 py-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
              title="Show Client Digital ID Badge"
            >
              <Award className="w-4 h-4 text-slate-950" />
              Digital ID Badge
            </button>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs: Overview vs. Digital ID Badge */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          id="tab-subview-overview"
          onClick={() => setActiveSubView('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubView === 'overview'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Dashboard Overview
        </button>

        <button
          type="button"
          id="tab-subview-badge"
          onClick={() => setActiveSubView('badge')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubView === 'badge'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          Digital ID Badge
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
            Client View
          </span>
        </button>
      </div>

      {/* Main Content Area: Render Digital ID Badge view OR Standard Dashboard Overview */}
      {activeSubView === 'badge' ? (
        <DigitalIdBadge
          agent={agent}
          latestApplication={latestApp}
          onNavigateToAccreditation={onNavigateToAccreditation}
        />
      ) : (
        <div className="space-y-6">
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
            ) : isUnderReview ? (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDirectContractDownload}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-xs disabled:opacity-50"
                  title="Download filled official Sales Agency Agreement (PDF) with your submitted details"
                >
                  {isDownloadingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Generating SAA (PDF)...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download SAA Agreement (PDF)
                      <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-slate-950/20 text-slate-950">
                        PDF
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onViewContract}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 rounded-xl transition"
                >
                  <FileText className="w-4 h-4 text-blue-900" /> View Sales Agency Agreement (SAA)
                </button>
                <button
                  type="button"
                  onClick={onNavigateToAccreditation}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl shadow-xs transition"
                >
                  <Lock className="w-4 h-4 text-slate-500" /> View Submitted Application (Read-Only)
                </button>
              </div>
            ) : isActive ? (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDirectContractDownload}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-xs disabled:opacity-50"
                  title="Download filled official Sales Agency Agreement (PDF)"
                >
                  {isDownloadingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Generating SAA (PDF)...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Official SAA Agreement (PDF)
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950">
                        PDF
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onViewContract}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-200/80 hover:bg-emerald-300 rounded-xl transition"
                >
                  <FileText className="w-4 h-4" /> View Sales Agency Agreement (SAA)
                </button>
              </div>
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

      {/* Digital ID Badge Client Presentation Highlight Card in Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/60 shadow-lg shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={agent.fullName} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-amber-300">
                {agent.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Official Digital ID Badge for Clients
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white font-serif">{agent.fullName}</h4>
            <p className="text-xs text-slate-300">
              <span className="font-mono text-amber-300 font-bold">{agent.affiliateCode}</span> •{' '}
              {agent.position && agent.position !== 'Pending Accreditation' ? agent.position : 'Accredited Affiliate'} •{' '}
              <span className={isActive ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {agent.accreditationStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            id="btn-preview-present-badge"
            onClick={() => setActiveSubView('badge')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-slate-950" /> Present ID to Client
          </button>
          <button
            type="button"
            id="btn-preview-view-badge"
            onClick={() => setActiveSubView('badge')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-blue-300" /> View QR & 2-Sided Badge
          </button>
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
      )}
    </div>
  );
};
