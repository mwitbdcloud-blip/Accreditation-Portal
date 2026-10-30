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
  Lock,
} from 'lucide-react';
import { AccreditationApplication, AgentProfile, WelcomeLetterTemplate } from '../types';
import { MegaworldLogo } from './MegaworldLogo';
import { formatDate, computeExpiryDate } from '../utils/dateFormatter';
import { api } from '../services/api';
import { clientStorage } from '../services/clientStorage';

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
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
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

  const getLetterPlainText = () => {
    return `
${letterDateFormatted}

Dear ${salutationName},

Thank you very much for joining our growing Megaworld Corporation - International Marketing Division family!

It is my distinct privilege to welcome you to our group of dynamic and driven real estate sales professionals operating in key territories all over the world. Just like them, you were accepted because of your knowledge, attitudes, skills and integrity that form the core of our business. It is our fervent hope that you will champion, observe, and respect the corporate values we espouse toward the achievement of our corporate vision and dreams. In the process, we hope you achieve yours too.

As a new member, you are entitled to the following benefits:

  o Career Development
  o Rewarding Commission
  o Exciting Promos and Incentives
  o Acquaintances and Conferences
  o Training and Self-Development
  o Enriching Experience

Please check this guide and sign up at our 1.) Agent’s Hub - the one-stop, web-based sales management tool to access latest inventory, computations, updates and promotions; 2.) TBD Cloud - access and download presentation materials of Megaworld and its subsidiaries; and 3.) Sales and Commission Portal – for monitoring commission and generating sales reports.

You are signed up as a ${position} under ${region} region. Your sales contract expires on ${expiryDateFormatted} and is renewable upon further evaluation of your sales performance. You may also refer to your Sales Agency Agreement for the details of your sales targets & commission structure.

We wish you all the best. Welcome to our world! Welcome to Megaworld!
${effectiveCustomNote ? `\nManagement Remarks:\n${effectiveCustomNote}\n` : ''}
Sincerely,

MR. JAVIER ROMEO K. ABUSTAN
Managing Director

------------------------------------------------------------------------
Megaworld International Contacts & Portals:
Website: www.megaworldinternational.com
Phone: (632) 894-6300
Facebook: MegaworldInternationalOfficial | MegaworldInternationalRecruitment
Twitter: @megaworld_intl
Instagram: @megaworld_intl
------------------------------------------------------------------------
`.trim();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getLetterPlainText());
    setCopied(true);
    showToast('Welcome Letter text copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadLetter = () => {
    const plainText = getLetterPlainText();
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Megaworld_International_Welcome_Letter_${affiliateCode}.txt`;
    link.click();
    showToast('Welcome Letter downloaded successfully!');
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
              onClick={handleDownloadLetter}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5 text-blue-900" />
              <span>Download</span>
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

        {/* Scrollable Letter Document Sheet matching image_15b08e2d.png */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 bg-slate-200/80 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div
            ref={letterRef}
            id="welcome-letter-sheet"
            className="relative w-full max-w-[760px] bg-white shadow-2xl rounded-2xl p-8 sm:p-12 md:p-16 border border-slate-300/80 text-slate-900 font-sans overflow-hidden select-text print:shadow-none print:border-none print:rounded-none print:p-8"
            style={{ minHeight: '1020px' }}
          >
            {/* TOP-RIGHT CURVED GRADIENT WAVES ACCENT */}
            <div className="absolute top-0 right-0 w-64 h-52 sm:w-84 sm:h-68 pointer-events-none overflow-hidden z-0 print:opacity-100">
              <svg viewBox="0 0 400 320" className="w-full h-full" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient id="topWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="topWaveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.75" />
                    <stop offset="60%" stopColor="#0284c7" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#075985" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="topWaveGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path d="M110 0 C210 50 310 120 400 240 L400 0 Z" fill="url(#topWaveGrad1)" />
                <path d="M170 0 C250 70 330 160 400 320 L400 0 Z" fill="url(#topWaveGrad2)" />
                <path d="M50 0 C150 30 270 80 400 160 L400 0 Z" fill="url(#topWaveGrad3)" />
              </svg>
            </div>

            {/* BOTTOM-LEFT & BOTTOM SPREAD GRADIENT WAVES ACCENT */}
            <div className="absolute bottom-0 left-0 w-full h-36 sm:h-44 pointer-events-none overflow-hidden z-0 print:opacity-100">
              <svg viewBox="0 0 900 200" className="w-full h-full" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient id="botWaveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.65" />
                  </linearGradient>
                  <linearGradient id="botWaveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0369a1" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient id="botWaveGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.45" />
                  </linearGradient>
                </defs>
                <path d="M0 70 C220 30 500 160 900 60 L900 200 L0 200 Z" fill="url(#botWaveGrad1)" />
                <path d="M0 120 C280 60 580 180 900 100 L900 200 L0 200 Z" fill="url(#botWaveGrad2)" />
                <path d="M0 30 C200 110 440 40 900 140 L900 200 L0 200 Z" fill="url(#botWaveGrad3)" />
              </svg>
            </div>

            {/* RELATIVE CONTENT LAYER */}
            <div className="relative z-10 space-y-5 text-slate-800 text-[13.5px] sm:text-[14px] leading-relaxed">
              {/* TOP HEADER: OFFICIAL MEGAWORLD INTERNATIONAL LOGO ("Megaworld International Logo_blue_4-02") */}
              <div className="pt-1">
                <img
                  src="/assets/aistudio/Megaworld_International_Logo_blue_4-02_2fcc5f75.png"
                  alt="Megaworld International"
                  className="h-16 sm:h-20 w-auto object-contain bg-transparent shrink-0 select-none"
                />
              </div>

              {/* DATE */}
              <div className="pt-4 text-slate-900 font-sans font-medium text-sm">
                {letterDateFormatted}
              </div>

              {/* SALUTATION */}
              <div className="pt-2 font-bold text-slate-900 text-sm">
                Dear {salutationName},
              </div>

              {/* PARAGRAPH 1 */}
              <p className="text-slate-900">
                Thank you very much for joining our growing{' '}
                <strong className="font-bold text-slate-950">
                  Megaworld Corporation - International Marketing Division
                </strong>{' '}
                family!
              </p>

              {/* PARAGRAPH 2 */}
              <p className="text-slate-800 text-justify">
                It is my distinct privilege to welcome you to our group of dynamic and driven real estate
                sales professionals operating in key territories all over the world. Just like them, you
                were accepted because of your knowledge, attitudes, skills and integrity that form the core
                of our business. It is our fervent hope that you will champion, observe, and respect the
                corporate values we espouse toward the achievement of our corporate vision and dreams. In
                the process, we hope you achieve yours too.
              </p>

              {/* BENEFITS INTRO & CREATE BULLETS */}
              <div className="space-y-1.5 pt-1">
                <p className="text-slate-900">
                  As a new member, you are entitled to the following benefits:
                </p>

                <ul className="space-y-1.5 pl-6 sm:pl-8 text-slate-800">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full border border-slate-700 inline-block shrink-0" />
                    <span>
                      <strong className="font-bold text-[#0080c8] text-base">C</strong>areer Development
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full border border-slate-700 inline-block shrink-0" />
                    <span>
                      <strong className="font-bold text-[#0080c8] text-base">R</strong>ewarding Commission
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full border border-slate-700 inline-block shrink-0" />
                    <span>
                      <strong className="font-bold text-[#0080c8] text-base">E</strong>xciting Promos and Incentives
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full border border-slate-700 inline-block shrink-0" />
                    <span>
                      <strong className="font-bold text-[#0080c8] text-base">A</strong>cquaintances and Conferences
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full border border-slate-700 inline-block shrink-0" />
                    <span>
                      <strong className="font-bold text-[#0080c8] text-base">T</strong>raining and Self-Development
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full border border-slate-700 inline-block shrink-0" />
                    <span>
                      <strong className="font-bold text-[#0080c8] text-base">E</strong>nriching Experience
                    </span>
                  </li>
                </ul>
              </div>

              {/* PLATFORMS & GUIDE PARAGRAPH */}
              <p className="text-slate-800 text-justify pt-1">
                Please check this{' '}
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="text-[#0080c8] underline font-medium hover:text-[#0060aa] cursor-pointer inline p-0 bg-transparent border-0"
                >
                  guide
                </button>{' '}
                and sign up at our 1.) <strong className="font-bold text-slate-950">Agent’s Hub</strong> -
                the one-stop, web-based sales management tool to access latest inventory, computations,
                updates and promotions; 2.) <strong className="font-bold text-slate-950">TBD Cloud</strong> -
                access and download presentation materials of Megaworld and its subsidiaries; and 3.){' '}
                <strong className="font-bold text-slate-950">Sales and Commission Portal</strong> – for
                monitoring commission and generating sales reports.
              </p>

              {/* POSITION, REGION & EXPIRY PARAGRAPH */}
              <p className="text-slate-800 text-justify pt-1">
                You are signed up as a{' '}
                <strong className="font-bold text-slate-950">{position}</strong> under{' '}
                <strong className="font-bold text-slate-950">{region}</strong> region. Your sales
                contract expires on{' '}
                <strong className="font-bold text-slate-950">{expiryDateFormatted}</strong> and is
                renewable upon further evaluation of your sales performance. You may also refer to your Sales
                Agency Agreement for the details of your sales targets & commission structure.
              </p>

              {/* CLOSING GREETING */}
              <p className="text-slate-900 font-normal pt-1">
                We wish you all the best. Welcome to our world! Welcome to Megaworld!
              </p>

              {/* OPTIONAL OPERATIONS REMARKS */}
              {effectiveCustomNote && (
                <div className="p-3 bg-blue-50/80 border-l-4 border-[#0060AA] rounded-r-lg text-xs space-y-0.5 my-2">
                  <span className="font-bold text-[#0060AA] block">Management Remarks:</span>
                  <span className="text-slate-800 italic">{effectiveCustomNote}</span>
                </div>
              )}

              {/* SIGN-OFF & CONTACT INFORMATION SECTION */}
              <div className="pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6">
                {/* Left Column: Sign-off */}
                <div className="space-y-1">
                  <p className="text-slate-800">Sincerely,</p>
                  <div className="h-10 sm:h-12 flex items-center">
                    <span className="font-serif italic text-xl text-blue-950/80 font-bold select-none tracking-wide">
                      Javier Romeo K. Abustan
                    </span>
                  </div>
                  <p className="font-bold text-slate-950 tracking-wider text-xs sm:text-sm">
                    MR. JAVIER ROMEO K. ABUSTAN
                  </p>
                  <p className="text-xs text-slate-600 font-medium">Managing Director</p>
                </div>

                {/* Right Column: Contact & Social Handles */}
                <div className="flex items-start gap-4">
                  <div className="w-[1.5px] bg-slate-300 self-stretch hidden sm:block" />

                  <div className="space-y-1.5 text-[11px] text-[#0080c8] font-sans">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0 text-[#0080c8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <a href="https://www.megaworldinternational.com" target="_blank" rel="noreferrer" className="hover:underline">
                        www.megaworldinternational.com
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0 text-[#0080c8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>(632) 894-6300</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0 text-[#0080c8] mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      <div className="flex flex-col leading-tight">
                        <span>MegaworldInternationalOfficial</span>
                        <span>MegaworldInternationalRecruitment</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0 text-[#0080c8]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                      </svg>
                      <span>@megaworld_intl</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0 text-[#0080c8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                      <span>@megaworld_intl</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <>
                <button
                  type="button"
                  id="agent-download-letter-btn"
                  onClick={handleDownloadLetter}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-900" />
                  <span>Download Letter (.txt)</span>
                </button>
                <button
                  type="button"
                  id="agent-print-letter-btn"
                  onClick={handlePrint}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </>
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

      {/* Print Style Injector */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #welcome-letter-sheet, #welcome-letter-sheet * {
            visibility: visible !important;
          }
          #welcome-letter-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24mm 18mm !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            z-index: 99999 !important;
          }
        }
      `}</style>
    </div>
  );
};
