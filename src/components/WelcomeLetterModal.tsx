import React, { useState, useRef } from 'react';
import {
  X,
  Mail,
  Printer,
  Download,
  Copy,
  Check,
  UploadCloud,
  FileText,
  Award,
  Send,
  Building,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { AccreditationApplication, AgentProfile, WelcomeLetterTemplate } from '../types';
import { MegaworldLogo } from './MegaworldLogo';
import { formatDate, computeExpiryDate } from '../utils/dateFormatter';
import { api } from '../services/api';
import { clientStorage } from '../services/clientStorage';

interface WelcomeLetterModalProps {
  application: AccreditationApplication;
  agent?: AgentProfile | null;
  currentUser: {
    role: string;
    fullName?: string;
    displayName?: string;
    email?: string;
  };
  onClose: () => void;
  onOpenTemplateManager: () => void;
  showToast: (msg: string) => void;
}

export const WelcomeLetterModal: React.FC<WelcomeLetterModalProps> = ({
  application,
  agent,
  currentUser,
  onClose,
  onOpenTemplateManager,
  showToast,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const template = clientStorage.getWelcomeLetterTemplate();

  const recipientName =
    application.personalDetails?.fullName ||
    agent?.fullName ||
    application.agentName ||
    'Valued Affiliate';

  const affiliateCode = application.affiliateCode || agent?.affiliateCode || 'IPA-AP2-000000';
  const position = application.position || agent?.position || 'Marketing Associate';
  const region = application.region || agent?.region || 'Asia Pacific 2';
  const recipientEmail =
    application.personalDetails?.emailAddress ||
    agent?.email ||
    application.email ||
    'affiliate@megaworld.com';

  const approvalDate = application.dateSubmitted
    ? formatDate(application.dateSubmitted)
    : formatDate(new Date().toISOString());

  const startDateFormatted = approvalDate;
  const expiryDateFormatted = application.dateSubmitted
    ? formatDate(computeExpiryDate(application.dateSubmitted, 4))
    : formatDate(computeExpiryDate(new Date().toISOString(), 4));

  const teamLead =
    application.teamDetails?.teamLeader ||
    application.teamDetails?.upline ||
    'Victoria Del Rosario';

  const refNumber = `MWI-WL-2026-${affiliateCode.replace(/[^0-9]/g, '').slice(-6) || '000001'}`;

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const operatorName = currentUser?.displayName || currentUser?.fullName || 'Rolly Manaog (BD Staff)';
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

  const handleCopyText = () => {
    const plainText = `
MEGAWORLD INTERNATIONAL
Global Operations & Accreditation Management
Official Reference: ${refNumber}
Date: ${approvalDate}

TO: ${recipientName.toUpperCase()}
Position: Accredited ${position}
Region: ${region}
Permanent Affiliate Code: ${affiliateCode}
Email: ${recipientEmail}

SUBJECT: OFFICIAL WELCOME LETTER & ACCREDITATION APPROVAL

Dear ${recipientName},

On behalf of Megaworld International, we are pleased to officially congratulate you on the approval of your accreditation as an International Property Affiliate (IPA). 

ACCREDITATION PARTICULARS:
• Permanent Affiliate Code: ${affiliateCode}
• Designated Position: ${position}
• Regional Territory: ${region}
• Accreditation Term: Valid for 4 Months (${startDateFormatted} – ${expiryDateFormatted})
• Reporting Leadership: ${teamLead}

You are now formally accredited to market and present Megaworld Corporation's premier master-planned township communities and luxury residential properties across our global client portfolio.

KEY ONBOARDING DIRECTIVES:
1. International Property Affiliate Portal Access: Sign in using your registered email address or permanent Affiliate Code (${affiliateCode}).
2. Official Digital ID Badge: Present your verified Digital ID Badge during client presentations and property inquiries.
3. Sales Agency Agreement (SAA): Your official SAA has been generated and filed with Legal Compliance.
4. Marketing Collateral & Inventories: Access authorized price lists, township brochures, and reservation agreements.

${customNote ? `SPECIAL INSTRUCTIONS FROM BD OPERATIONS:\n${customNote}\n\n` : ''}
Welcome once again to the Megaworld International family. We look forward to a rewarding and successful partnership.

Sincerely,

BUSINESS DEVELOPMENT & ACCREDITATION OPERATIONS
Megaworld International
`.trim();

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    showToast('Welcome Letter text copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="welcome-letter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-6 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
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
                  Official Welcome Letter
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
            <span className="font-semibold">Active Template:</span>
            <span className="font-mono text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {template.fileName || 'Official Welcome Letter Template'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNoteInput((prev) => !prev)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              {showNoteInput ? 'Hide Custom Note' : '+ Add Custom Note'}
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Copy text of Welcome Letter"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
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

        {/* Scrollable Letter Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center">
          <div
            ref={letterRef}
            className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8 sm:p-12 border border-slate-200 text-slate-900 font-sans space-y-6"
          >
            {/* Letterhead */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-blue-900 pb-5 gap-4">
              <div>
                <MegaworldLogo theme="light" size="md" />
                <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-2">
                  Global Operations & Accreditation Management
                </p>
                <p className="text-[10px] text-slate-400">
                  Megaworld International • Official Accreditation Division
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-0.5">
                <span className="font-mono text-[11px] font-bold text-blue-950 block">
                  Ref: {refNumber}
                </span>
                <span className="text-slate-500 block">Date: {approvalDate}</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                  Accreditation: Approved
                </span>
              </div>
            </div>

            {/* Recipient Block */}
            <div className="text-xs space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Accredited Affiliate Details
              </span>
              <p className="text-sm font-bold text-slate-900">
                {recipientName.toUpperCase()}
              </p>
              <p className="font-semibold text-blue-900">
                Designated Position: {position}
              </p>
              <p className="text-slate-600">
                Regional Hub: {region}
              </p>
              <p className="text-slate-600">
                Registered Email: <span className="font-mono">{recipientEmail}</span>
              </p>
              <p className="font-mono text-xs font-bold text-amber-700">
                Permanent Affiliate Code: {affiliateCode}
              </p>
            </div>

            {/* Subject */}
            <div className="border-l-4 border-blue-900 pl-3 py-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-950">
                Subject: Official Welcome & Confirmation of Accreditation Approval
              </h4>
            </div>

            {/* Letter Body */}
            <div className="text-xs text-slate-700 leading-relaxed space-y-3.5 text-justify">
              <p>
                Dear <strong className="text-slate-900">{recipientName}</strong>,
              </p>

              <p>
                On behalf of the executive leadership and the Business Development Operations Group of{' '}
                <strong className="text-blue-950">Megaworld International</strong>, we are pleased to officially
                welcome you as an accredited <strong className="text-slate-900">{position}</strong>. Your
                credentials and submitted accreditation documents have been thoroughly verified and officially approved.
              </p>

              <p>
                You are now authorized to market and present Megaworld Corporation’s portfolio of master-planned
                township developments, premier residential condominiums, and world-class commercial real estate
                opportunities to clients across global markets.
              </p>

              {/* Accreditation Summary Box */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-950 block">
                  Official Accreditation Particulars
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Affiliate Code:</span>
                    <strong className="font-mono text-blue-950 text-xs">{affiliateCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accredited Position:</span>
                    <strong className="text-slate-900">{position}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Territory / Regional Hub:</span>
                    <strong className="text-slate-900">{region}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accreditation Term:</span>
                    <strong className="text-emerald-800">
                      {startDateFormatted} – {expiryDateFormatted} (4 Months)
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">Team & Leadership Structure:</span>
                    <strong className="text-slate-800">{teamLead}</strong>
                  </div>
                </div>
              </div>

              {/* Key Directives */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-900 block">
                  Key Directives & Next Steps for Activation:
                </span>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                  <li>
                    <strong>Affiliate Portal Access:</strong> Log in to your International Property Affiliate Portal
                    using your permanent Affiliate Code (<code>{affiliateCode}</code>) or registered email address.
                  </li>
                  <li>
                    <strong>Official Digital ID Badge:</strong> Access your verified Digital ID Badge in the portal to
                    present official accreditation credentials to prospective purchasers.
                  </li>
                  <li>
                    <strong>Sales Agency Agreement (SAA):</strong> Your official SAA has been generated in accordance with
                    your accredited position and filed with Legal Compliance.
                  </li>
                  <li>
                    <strong>Project Inventories & Pricing:</strong> Coordinate with your designated Territory Head and BD
                    operations team for authorized unit inventories, price schedules, and official reservation forms.
                  </li>
                </ol>
              </div>

              {customNote && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
                  <strong className="block mb-1">Remarks from BD Operations:</strong>
                  <span>{customNote}</span>
                </div>
              )}

              <p className="pt-2">
                We are confident that your expertise and dedication will contribute significantly to the growth and
                prestige of Megaworld International. We look forward to a successful and productive partnership.
              </p>
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-8">
                  Verified & Dispatched by:
                </p>
                <div className="border-t border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-900">
                    {currentUser?.displayName || currentUser?.fullName || 'Rolly Manaog'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Business Development Operations
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Megaworld International
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-8">
                  Executive Endorsement:
                </p>
                <div className="border-t border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-900">
                    Executive Directorate
                  </p>
                  <p className="text-[10px] text-slate-500">
                    International Sales & Global Marketing
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Megaworld Corporation
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
              Megaworld International • Global Operations & Accreditation Center • Confidential Corporate Document
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {sentSuccess ? (
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
          </div>
        </div>
      </div>
    </div>
  );
};
