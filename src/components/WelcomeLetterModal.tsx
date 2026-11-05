import React, { useState, useRef } from 'react';
import {
  X,
  Mail,
  Printer,
  Download,
  UploadCloud,
  FileText,
  Award,
  Send,
  Building,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { AccreditationApplication, AgentProfile, WelcomeLetterTemplate } from '../types';
import { MegaworldLogo } from './MegaworldLogo';
import { formatDate, computeExpiryDate } from '../utils/dateFormatter';
import { api } from '../services/api';
import { clientStorage } from '../services/clientStorage';
import { jsPDF } from 'jspdf';
import { downloadWelcomeLetterPdf, WelcomeLetterDocument } from '../utils/welcomeLetterPdfGenerator';

interface WelcomeLetterModalProps {
  application?: AccreditationApplication | null;
  agent?: AgentProfile | null;
  currentUser?: {
    role: string;
    fullName?: string;
    displayName?: string;
    email?: string;
  };
  onClose: () => void;
  onOpenTemplateManager?: () => void;
  showToast?: (msg: string) => void;
  isAgentView?: boolean;
}

export const WelcomeLetterModal: React.FC<WelcomeLetterModalProps> = ({
  application,
  agent,
  currentUser = { role: 'Agent', fullName: 'Affiliate', email: '' },
  onClose,
  onOpenTemplateManager,
  showToast = (msg: string) => {},
  isAgentView = false,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(0.8);
  const letterRef = useRef<HTMLDivElement>(null);

  const template = clientStorage.getWelcomeLetterTemplate();
  const welcomeRecord = agent?.welcomeLetter || application?.welcomeLetter;

  const recipientName =
    application?.personalDetails?.fullName ||
    agent?.fullName ||
    (application as any)?.agentName ||
    'Juan Pineda Dela Cruz';

  const affiliateCode = application?.affiliateCode || agent?.affiliateCode || 'IPA-AP2-000000';
  const position = application?.position || agent?.position || 'Marketing Associate';
  const region = application?.region || agent?.region || 'Asia Pacific 1';
  const recipientEmail =
    application?.personalDetails?.emailAddress ||
    agent?.email ||
    (application as any)?.email ||
    'affiliate@megaworld.com';

  const getSalutationName = () => {
    const raw = recipientName.trim();
    if (/^(mr\.|ms\.|mrs\.|dr\.|engr\.|atty\.)/i.test(raw)) {
      return raw;
    }
    const civil = (application?.personalDetails?.civilStatus || agent?.personalDetails?.civilStatus || '').toLowerCase();
    const gender = ((application?.personalDetails as any)?.gender || (agent?.personalDetails as any)?.gender || '').toLowerCase();
    if (gender === 'female' || gender === 'f' || civil === 'married') {
      return `Ms. ${raw}`;
    }
    return `Mr. ${raw}`;
  };
  const salutationName = getSalutationName();

  const letterDateFormatted = (() => {
    try {
      const raw = welcomeRecord?.sentAt || application?.dateSubmitted;
      const d = raw ? new Date(raw) : new Date();
      if (isNaN(d.getTime())) return 'January 01, 2026';
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'January 01, 2026';
    }
  })();

  const expiryDateFormatted = (() => {
    try {
      const raw = welcomeRecord?.termEndDate || application?.accreditationExpiryDate;
      const d = raw
        ? new Date(raw)
        : new Date(computeExpiryDate(application?.dateSubmitted || new Date().toISOString(), 4));
      if (isNaN(d.getTime())) return 'May 30, 2026';
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'May 30, 2026';
    }
  })();

  const refNumber = welcomeRecord?.refNumber || `MWI-WL-2026-${affiliateCode.replace(/[^0-9]/g, '').slice(-6) || '000001'}`;
  const effectiveCustomNote = customNote || welcomeRecord?.customNote || '';

  const handleSendEmail = async () => {
    if (!application?.id) return;
    setIsSending(true);
    try {
      const operatorName = currentUser?.fullName || 'Rolly Manaog (BD Staff)';
      const operatorRole = currentUser?.role || 'Staff';

      const res = await api.sendWelcomeLetter(application.id, {
        operatorName,
        operatorRole,
        customNote: customNote.trim() || undefined,
        template,
      });

      setSentSuccess(true);
      showToast(res.message || `Welcome Letter dispatched to ${recipientEmail}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch Welcome Letter email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      showToast('Generating official 1-page Welcome Letter PDF...');
      await downloadWelcomeLetterPdf({
        recipientName,
        salutationName,
        affiliateCode,
        position,
        region,
        letterDateFormatted,
        expiryDateFormatted,
        refNumber,
        customNote: effectiveCustomNote,
      });
      showToast('Welcome Letter PDF downloaded successfully!');
    } catch (err: any) {
      console.error('Error generating Welcome Letter PDF:', err);
      showToast('Failed to generate PDF. Please use the Print button to Save as PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Strict check: The Welcome Letter is only accessible if the application has been approved by staff or admin.
  const isApplicationApproved =
    application?.status === 'Approved' ||
    (agent?.accreditationStatus === 'Active' &&
      application?.status !== 'Submitted' &&
      application?.status !== 'Under Review' &&
      application?.status !== 'Revision Required' &&
      application?.status !== 'Rejected');

  if (!isApplicationApproved) {
    return (
      <div
        id="welcome-letter-unapproved-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-center space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              Welcome Letter Not Accessible
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The official Welcome Letter can only be viewed or dispatched once the application has been officially processed and approved by Staff or Admin.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Application Standing:</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
              {application?.status || agent?.accreditationStatus || 'Not Processed / Pending Approval'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="welcome-letter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl my-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-900/60 border border-blue-700/60 text-blue-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isAgentView ? 'Official Accreditation Welcome Letter' : 'Official Welcome Letter'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Approved
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Recipient: <strong className="text-slate-200">{recipientName}</strong> •{' '}
                <span className="font-mono text-amber-300">{affiliateCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAgentView && onOpenTemplateManager && (
              <button
                type="button"
                id="btn-open-template-from-letter"
                onClick={onOpenTemplateManager}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="Upload or configure Welcome Letter template"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Template File</span>
              </button>
            )}

            <button
              type="button"
              id="close-welcome-letter-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold">
              {isAgentView ? 'Accreditation Status:' : 'Active Template:'}
            </span>
            <span className="font-mono text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {isAgentView
                ? `${position} • 4-Month Term`
                : (template.fileName || 'Official Welcome Letter Template')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Full-Page Zoom Controls */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-slate-700 font-semibold px-1 min-w-[38px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3 bg-slate-200 mx-1" />
              <button
                type="button"
                onClick={() => setZoomScale(0.75)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition cursor-pointer flex items-center gap-1 ${
                  Math.abs(zoomScale - 0.75) < 0.03
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Fit entire page in view"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fit Page</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1.0)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition cursor-pointer ${
                  Math.abs(zoomScale - 1.0) < 0.03
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="100% Actual Size"
              >
                100%
              </button>
            </div>

            {!isAgentView && (
              <button
                type="button"
                onClick={() => setShowNoteInput((prev) => !prev)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                {showNoteInput ? 'Hide Custom Note' : '+ Add Custom Note'}
              </button>
            )}

            <button
              type="button"
              id="btn-download-welcome-letter-pdf"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Download Welcome Letter as PDF file"
            >
              {isGeneratingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-blue-900" />
              )}
              <span>{isGeneratingPdf ? 'Downloading...' : 'Download'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Print Welcome Letter"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Optional Custom Note Banner */}
        {showNoteInput && (
          <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-200 text-xs space-y-1.5 shrink-0">
            <label className="font-bold text-amber-950 block">
              Custom Operations Remarks / Instructions (Included in dispatched email)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please coordinate with Regional Team Lead Victoria Del Rosario regarding your scheduled orientation."
              className="w-full p-2 bg-white text-xs border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-500 text-slate-800"
            />
          </div>
        )}

        {/* Scrollable Letter Document Sheet calibrated strictly to ONE FULL PAGE */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 md:p-8 bg-slate-700/30 flex flex-col items-center print:p-0 print:bg-white print:overflow-visible">
          <div
            ref={letterRef}
            className="transition-transform duration-150 origin-top flex flex-col items-center print:transform-none"
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              marginBottom: zoomScale < 1 ? `-${Math.round((1 - zoomScale) * 1123)}px` : '24px',
            }}
          >
            <WelcomeLetterDocument
              data={{
                recipientName,
                salutationName,
                affiliateCode,
                position,
                region,
                letterDateFormatted,
                expiryDateFormatted,
                refNumber,
                customNote: effectiveCustomNote,
              }}
              onOpenGuide={() => setShowGuideModal(true)}
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {isAgentView ? (
              welcomeRecord?.sentAt ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Welcome Letter delivered to your account on {formatDate(welcomeRecord.sentAt)} (Ref: {welcomeRecord.refNumber || 'MWI-WL-2026'})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-blue-900 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Official Accreditation Welcome Letter • Megaworld International
                </span>
              )
            ) : sentSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Welcome Letter dispatched to {recipientEmail}
              </span>
            ) : (
              <span>
                Sending will deliver this official letter to{' '}
                <strong className="text-slate-800">{recipientEmail}</strong>.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isAgentView ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  id="btn-confirm-send-welcome-letter"
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSending ? 'Sending Letter...' : sentSuccess ? 'Re-send Letter' : 'Send Welcome Letter'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Guide & Platform Modal Popup */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                  <FileText className="w-4 h-4 text-blue-800" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Affiliate Onboarding & Portal Guide
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Official platforms for accredited sales affiliates
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-blue-950 font-bold block text-xs">
                  1.) Agent’s Hub
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  The one-stop, web-based sales management tool to access latest project inventory, price computations, promos, reservation workflows, and property releases across global territories.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-blue-950 font-bold block text-xs">
                  2.) TBD Cloud
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Official repository to access and download high-resolution marketing presentation materials, video walkthroughs, township e-brochures, and project collaterals of Megaworld Corporation and its subsidiaries.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-blue-950 font-bold block text-xs">
                  3.) Sales and Commission Portal
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Dedicated portal for real-time monitoring of commission releases, sales credit tracking, reservation approvals, and generating comprehensive quarterly sales performance reports.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Style Injector: Strict Single-Page Fit Across A4 and Letter */}
      <style>{`
        @media print {
          @page {
            size: a4 portrait;
            margin: 0;
          }

          html,
          body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
          }

          /* Hide everything except the welcome letter sheet */
          body * {
            visibility: hidden !important;
          }

          #welcome-letter-sheet,
          #welcome-letter-sheet * {
            visibility: visible !important;
          }

          #welcome-letter-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-width: 210mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 12mm 15mm 12mm 15mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            z-index: 999999 !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
};
