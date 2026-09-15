import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle,
  FileDown,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { Position, AccreditationApplication, AgentProfile, PositionContractTemplate } from '../types';
import { extractContractData } from './ContractDocument';
import { getPagesForPosition } from './contractPages';

interface ContractModalProps {
  application?: AccreditationApplication | null;
  agent?: AgentProfile | null;
  positionContract?: PositionContractTemplate | null;
  initialPosition?: Position;
  currentUserRole?: 'Agent' | 'Staff' | 'Admin';
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  application,
  agent,
  positionContract,
  initialPosition,
  currentUserRole,
  onClose,
}) => {
  if (!application && !agent) return null;

  // Role & permission evaluation
  const isAgentUser = currentUserRole === 'Agent' || (!currentUserRole && agent?.role === 'agent');
  const unlockedPositions = agent?.unlockedPositions || (agent?.position ? [agent.position] : ['Marketing Associate']);

  // Check if position is authorized for this user
  const isPositionUnlocked = (pos: Position): boolean => {
    // Staff and Admin have unrestricted access across all contracts
    if (!isAgentUser) return true;
    // Marketing Associate is always accessible to the agent
    if (pos === 'Marketing Associate') return true;
    // For MM and MD, agent must be endorsed and approved by Staff/Admin
    return unlockedPositions.includes(pos);
  };

  // Determine starting position - ensure we start on an unlocked position for agents
  const requestedPos = (
    initialPosition ||
    application?.position ||
    agent?.position ||
    'Marketing Associate'
  ) as Position;

  const startingPos: Position = isPositionUnlocked(requestedPos)
    ? (requestedPos === 'Marketing Manager' || requestedPos === 'Marketing Director'
        ? requestedPos
        : 'Marketing Associate')
    : 'Marketing Associate';

  const [activePosition, setActivePosition] = useState<Position>(startingPos);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'continuous' | 'paginated'>('continuous');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const isCurrentActiveUnlocked = isPositionUnlocked(activePosition);

  // Extract all details provided by agent
  const contractData = extractContractData(application, agent, activePosition);
  const pages = getPagesForPosition(activePosition);
  const totalPages = pages.length;

  const handlePrint = () => {
    if (!isCurrentActiveUnlocked) return;
    window.print();
  };

  const handleDownloadMultiPageHTML = () => {
    if (!isCurrentActiveUnlocked) return;
    // Generate self-contained printable HTML document
    const title = `Megaworld_International_SAA_${activePosition.replace(/\s+/g, '_')}_${contractData.affiliateCode}`;
    const pageHtmlStrings = pages
      .map((p, idx) => {
        return `<div class="contract-print-page" style="page-break-after: always; padding: 40px; margin-bottom: 24px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px;">
          <div style="font-family: Arial, sans-serif; font-size: 10px; color: #64748b; margin-bottom: 8px; display: flex; justify-content: space-between;">
            <span>MEGAWORLD INTERNATIONAL • ${activePosition.toUpperCase()}</span>
            <span>Page ${idx + 1} of ${totalPages}</span>
          </div>
          <h2 style="font-size: 16px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin-bottom: 16px; text-align: center;">
            ${p.title}
          </h2>
          <div style="font-family: Georgia, serif; font-size: 12px; line-height: 1.6; color: #1e293b;">
            Affiliate: <strong>${contractData.fullName}</strong> (${contractData.affiliateCode})<br/>
            Valid Period: ${contractData.startDate} to ${contractData.expiryDate}<br/>
            Bank: ${contractData.bankName} - ${contractData.accountNumber}<br/>
            Leadership: ${contractData.teamName} • Hub: ${contractData.brokerGroup}
          </div>
          <div style="margin-top: 40px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #475569;">
            <span>E-Signature Authenticated • Signatory: ${contractData.fullName}</span>
            ${contractData.eSignatureUrl ? `<img src="${contractData.eSignatureUrl}" style="height: 24px; max-width: 90px; object-fit: contain;" />` : `<span style="font-style: italic; font-weight: bold;">${contractData.fullName}</span>`}
            <span>Page ${idx + 1} of ${totalPages}</span>
          </div>
        </div>`;
      })
      .join('\n');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @media print {
      body { margin: 0; background: #fff; }
      .contract-print-page { page-break-after: always; border: none !important; margin: 0 !important; box-shadow: none !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; padding: 20px; }
  </style>
</head>
<body>
  ${pageHtmlStrings}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const contractFileName =
    positionContract?.fileName ||
    `Megaworld_${activePosition.replace(/\s+/g, '_')}_Official_SAA.pdf`;

  return (
    <div id="contract-modal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl my-4 sm:my-8 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[96vh]">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900 text-blue-200 rounded-lg shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Generated Sales Accreditation Contract
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {totalPages} Pages • Signed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Signatory: <strong className="text-slate-200">{contractData.fullName}</strong> • Affiliate Code: <span className="font-mono text-blue-300">{contractData.affiliateCode}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!isCurrentActiveUnlocked}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition shadow-xs ${
                isCurrentActiveUnlocked
                  ? 'text-white bg-blue-900 hover:bg-blue-800'
                  : 'text-slate-500 bg-slate-800/80 cursor-not-allowed border border-slate-700'
              }`}
              title={isCurrentActiveUnlocked ? 'Print or Save to PDF' : 'Locked — Requires Marketing Manager/Director Approval'}
            >
              {isCurrentActiveUnlocked ? <Printer className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              Print / Save as PDF
            </button>

            <button
              onClick={handleDownloadMultiPageHTML}
              disabled={!isCurrentActiveUnlocked}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition border ${
                isCurrentActiveUnlocked
                  ? 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700'
                  : 'text-slate-500 bg-slate-900 border-slate-800 cursor-not-allowed'
              }`}
              title={isCurrentActiveUnlocked ? 'Export Standalone Multi-Page Document' : 'Locked — Requires Approval'}
            >
              {isCurrentActiveUnlocked ? <FileDown className="w-3.5 h-3.5 text-amber-300" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              Export File (.html)
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Position Template Selector Tabs & Viewing Controls */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Position Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 select-none">Position:</span>
            {(['Marketing Associate', 'Marketing Manager', 'Marketing Director'] as Position[]).map((pos) => {
              const isActive = activePosition === pos;
              const isUnlocked = isPositionUnlocked(pos);
              const pageCount = pos === 'Marketing Associate' ? 12 : pos === 'Marketing Manager' ? 10 : 13;
              return (
                <button
                  key={pos}
                  onClick={() => {
                    if (!isUnlocked) {
                      setLockedNotice(
                        `Access Restricted: You are currently accredited as a Marketing Associate. Viewing, printing, and downloading the ${pos} contract is locked until your position upgrade is approved by BD Staff or Admin.`
                      );
                      return;
                    }
                    setLockedNotice(null);
                    setActivePosition(pos);
                    setCurrentPageIndex(0);
                  }}
                  className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : isUnlocked
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-amber-400/90 hover:bg-slate-900/80 cursor-pointer'
                  }`}
                  title={!isUnlocked ? 'Locked: Approval required by Staff/Admin' : undefined}
                >
                  {!isUnlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                  <span>{pos}</span>
                  {!isUnlocked ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Locked
                    </span>
                  ) : (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {pageCount}p
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode & Zoom Controls */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('continuous')}
                disabled={!isCurrentActiveUnlocked}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  viewMode === 'continuous'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Pages
              </button>
              <button
                onClick={() => setViewMode('paginated')}
                disabled={!isCurrentActiveUnlocked}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  viewMode === 'paginated'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Single Page
              </button>
            </div>

            {/* Pagination Controls (when in Paginated mode) */}
            {viewMode === 'paginated' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentPageIndex === 0}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-40 rounded hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={currentPageIndex}
                  onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-1 focus:outline-none"
                >
                  {pages.map((p, idx) => (
                    <option key={idx} value={idx}>
                      Page {idx + 1} of {totalPages} — {p.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPageIndex === totalPages - 1}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-40 rounded hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2 text-slate-400">
              <button
                onClick={() => setZoomScale((z) => Math.max(0.75, z - 0.1))}
                className="p-1 hover:text-white rounded hover:bg-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-300 w-10 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((z) => Math.min(1.25, z + 0.1))}
                className="p-1 hover:text-white rounded hover:bg-slate-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Locked Notification Banner if clicked on a locked tab */}
        {lockedNotice && (
          <div className="px-5 py-3 bg-amber-950/90 border-b border-amber-800 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lockedNotice}</span>
            </div>
            <button
              onClick={() => setLockedNotice(null)}
              className="p-1 text-amber-400 hover:text-white rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Contract Pages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-800/80 flex justify-center">
          {!isCurrentActiveUnlocked ? (
            <div className="w-full max-w-lg mx-auto my-8 p-8 bg-slate-900 border border-slate-700 rounded-2xl text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {activePosition} Contract Restricted
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As an accredited <strong>Marketing Associate</strong>, you cannot view, print, or download the {activePosition} contract. Access will be unlocked once approved by BD Staff or Admin.
              </p>
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-left text-xs space-y-1.5 text-slate-300">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> How to Gain Access:
                </div>
                <p className="text-[11px] text-slate-400">
                  1. Submit a Position Upgrade Request to your upline and assigned BD Operations staff.
                </p>
                <p className="text-[11px] text-slate-400">
                  2. Upon review and approval by BD Staff or Super Admin, your position will be elevated and this contract will automatically unlock.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActivePosition('Marketing Associate');
                  setLockedNotice(null);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition shadow-xs"
              >
                Return to Marketing Associate Contract
              </button>
            </div>
          ) : (
            <div
              style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
              className="w-full max-w-3xl space-y-6 transition-transform duration-150"
            >
              {viewMode === 'continuous' ? (
                pages.map((p, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-12 top-4 hidden md:block text-[11px] font-mono font-bold text-slate-400 select-none">
                      #{idx + 1}
                    </div>
                    {p.render(contractData, activePosition, totalPages)}
                  </div>
                ))
              ) : (
                <div>
                  <div className="text-center text-xs font-medium text-slate-300 mb-2">
                    Displaying Page {currentPageIndex + 1} of {totalPages}: <strong>{pages[currentPageIndex]?.title}</strong>
                  </div>
                  {pages[currentPageIndex]?.render(contractData, activePosition, totalPages)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Accreditation Term: <strong className="text-slate-200">{contractData.startDate}</strong> to <strong className="text-slate-200">{contractData.expiryDate}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              E-Signature attached to each page
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="text-xs font-semibold text-blue-300 hover:text-white px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
