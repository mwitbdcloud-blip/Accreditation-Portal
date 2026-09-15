import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Download,
  AlertCircle,
  FileCode,
  Calendar,
  UserCheck,
  Building,
  RefreshCw,
  Eye,
  Info,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Position, POSITIONS, PositionContractTemplate, AgentProfile } from '../types';
import { api } from '../services/api';
import { formatDate, formatDateTime } from '../utils/dateFormatter';

interface ContractManagementViewProps {
  positionContracts: PositionContractTemplate[];
  agents: AgentProfile[];
  currentUser: {
    role: 'Staff' | 'Admin' | 'Agent';
    displayName?: string;
    email: string;
  };
  onContractUpdated: (updatedTemplate: PositionContractTemplate) => void;
  showToast: (msg: string) => void;
}

export const ContractManagementView: React.FC<ContractManagementViewProps> = ({
  positionContracts,
  agents,
  currentUser,
  onContractUpdated,
  showToast,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<Position>('Marketing Associate');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [stagedFile, setStagedFile] = useState<{
    file: File;
    name: string;
    size: string;
    type: string;
    dataUrl: string;
    rawText?: string;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editedRawText, setEditedRawText] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeContract =
    positionContracts.find((c) => c.position === selectedPosition) || {
      position: selectedPosition,
      title: `Special Affiliate Agreement (SAA) — ${selectedPosition}`,
      fileName: `Megaworld_SAA_${selectedPosition.replace(/\s+/g, '_')}.pdf`,
      fileType: 'application/pdf',
      fileSize: '240 KB',
      lastUpdatedBy: `${currentUser.displayName || currentUser.role}`,
      lastUpdatedAt: new Date().toISOString(),
      notes: `Official uploaded contract for ${selectedPosition}`,
    };

  // Affiliates in this tier
  const affectedAgents = agents.filter((a) => a.position === selectedPosition);

  // File size formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // If text-like file, also read text
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.html') || file.name.endsWith('.md')) {
        const textReader = new FileReader();
        textReader.onload = () => {
          setStagedFile({
            file,
            name: file.name,
            size: formatBytes(file.size),
            type: file.type || 'application/octet-stream',
            dataUrl,
            rawText: textReader.result as string,
          });
        };
        textReader.readAsText(file);
      } else {
        setStagedFile({
          file,
          name: file.name,
          size: formatBytes(file.size),
          type: file.type || 'application/octet-stream',
          dataUrl,
        });
      }
      setUploadSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!stagedFile) {
      showToast('Please select a file to upload first.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadPositionContract(selectedPosition, {
        fileName: stagedFile.name,
        fileType: stagedFile.type,
        fileSize: stagedFile.size,
        fileData: stagedFile.dataUrl,
        rawText: stagedFile.rawText,
        title: customTitle.trim() || undefined,
        notes: notes.trim() || undefined,
        uploadedBy: `${currentUser.displayName || 'Staff'} (${currentUser.role})`,
      });

      onContractUpdated(res.template);
      setUploadSuccess(true);
      setStagedFile(null);
      setNotes('');
      setCustomTitle('');
      showToast(`Contract for ${selectedPosition} updated! Agents will now download this exact file.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to upload contract file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Direct download to verify format
  const handleTestDownload = () => {
    const filename = activeContract.fileName;
    const fileType = activeContract.fileType || 'application/octet-stream';

    if (activeContract.fileData) {
      // Create link from base64 data URL
      const a = document.createElement('a');
      a.href = activeContract.fileData;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded official contract: ${filename}`);
    } else {
      // Generate downloadable blob from text template with matching extension
      const content = activeContract.rawText || 'Megaworld International Sales Agreement Agency (SAA)';
      const blob = new Blob([content], { type: fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded position contract: ${filename}`);
    }
  };

  const handleSaveTextContent = async () => {
    if (!editedRawText) return;
    setIsSavingText(true);
    try {
      const res = await api.updatePositionContract(selectedPosition, {
        rawText: editedRawText,
        updatedBy: `${currentUser.displayName || 'Staff'} (${currentUser.role})`,
      });
      onContractUpdated(res.template);
      setShowTextEditor(false);
      showToast(`Contract text clauses for ${selectedPosition} saved.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update text.');
    } finally {
      setIsSavingText(false);
    }
  };

  const getFormatBadge = (fileName: string, fileType: string) => {
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    let colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    if (ext === 'PDF') colorClass = 'bg-rose-100 text-rose-800 border-rose-200';
    else if (ext === 'DOCX' || ext === 'DOC') colorClass = 'bg-sky-100 text-sky-800 border-sky-200';
    else if (ext === 'TXT') colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}>
        {ext} Format
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" /> BD Operations & Admin Contract Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Contract & SAA Management per Position
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upload official Sales Agreement Agency (SAA) or accreditation contracts per tier. When an Agent downloads their contract, they receive the exact file and format (.pdf, .docx, .txt) uploaded here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="test-download-active-contract"
              onClick={handleTestDownload}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-300" />
              Download Current ({activeContract.fileName.split('.').pop()?.toUpperCase()})
            </button>
          </div>
        </div>
      </div>

      {/* Position Selector Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-200">
        {POSITIONS.map((pos) => {
          const match = positionContracts.find((c) => c.position === pos);
          const isSelected = selectedPosition === pos;
          const ext = match?.fileName.split('.').pop()?.toUpperCase() || 'PDF';

          return (
            <button
              key={pos}
              type="button"
              id={`tab-pos-${pos.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                setSelectedPosition(pos);
                setStagedFile(null);
                setUploadSuccess(false);
                setShowTextEditor(false);
              }}
              className={`flex-1 min-w-[200px] text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{pos}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  .{ext.toLowerCase()}
                </span>
              </div>
              <p className={`text-[11px] truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                {match ? match.fileName : `Standard SAA (${ext})`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Active Position Contract Info & Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Currently Active Template Info & Agent Impact */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current File Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Contract File
                </span>
                <h2 className="text-base font-bold text-slate-900">{selectedPosition}</h2>
              </div>
              {getFormatBadge(activeContract.fileName, activeContract.fileType)}
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-900 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate" title={activeContract.fileName}>
                      {activeContract.fileName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Size: {activeContract.fileSize} • MIME: {activeContract.fileType}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Uploaded By:</span>
                    <span className="font-semibold text-slate-800">{activeContract.lastUpdatedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Upload Date:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateTime(activeContract.lastUpdatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {activeContract.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                      Staff Operational Notes
                    </span>
                    <p className="text-[11px]">{activeContract.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  id="btn-download-contract-file"
                  onClick={handleTestDownload}
                  className="w-full py-2 px-3 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>
                <button
                  type="button"
                  id="btn-preview-clauses"
                  onClick={() => {
                    setEditedRawText(activeContract.rawText || '');
                    setShowTextEditor(!showTextEditor);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> {showTextEditor ? 'Hide Text' : 'View / Edit Text'}
                </button>
              </div>
            </div>
          </div>

          {/* Active Affiliates Impact Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-900" /> Active Affiliates in this Tier
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-mono font-bold text-xs rounded-full">
                {affectedAgents.length} Agents
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              When any of these affiliates click "Download Official Contract" in their dashboard, they will automatically download this exact uploaded file.
            </p>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {affectedAgents.length === 0 ? (
                <p className="py-2 text-[11px] text-slate-400 italic">No agents registered in this tier yet.</p>
              ) : (
                affectedAgents.map((ag) => (
                  <div key={ag.affiliateCode} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">{ag.fullName}</span>
                      <span className="font-mono text-[10px] text-blue-900 font-bold">{ag.affiliateCode}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {ag.region}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upload New Contract or SAA File */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-900" /> Upload Replacement Contract / SAA File
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Target Position Tier: <strong className="text-blue-900">{selectedPosition}</strong>. Supports PDF, DOCX, DOC, TXT, HTML formats.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-900 bg-blue-50/70 scale-[1.01]'
                  : stagedFile
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-blue-900 hover:bg-slate-50/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="contract-file-input"
                accept=".pdf,.docx,.doc,.txt,.rtf,.html"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                    stagedFile ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {stagedFile ? <FileCheck className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
                </div>

                {stagedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-950">File Ready for Upload</p>
                    <p className="text-xs font-mono font-semibold text-slate-800">{stagedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Size: {stagedFile.size} • Type: {stagedFile.type || 'Custom format'}
                    </p>
                    <span className="inline-block mt-2 text-[11px] font-semibold text-blue-900 hover:underline">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Drag & drop contract file here, or <span className="text-blue-900 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Accepted: .pdf, .docx, .doc, .txt, .html (Max 25MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Metadata Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agreement Title / Display Label (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`e.g. Sales Agreement Agency (SAA) — ${selectedPosition}`}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Revision / Operational Notes (Visible to BD Staff & Admin)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Q4 Updated Commission Schedule and 4-month international accreditation terms."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none resize-none"
                />
              </div>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Successfully updated contract for <strong>{selectedPosition}</strong>! Affiliates will now download this exact file.
                </span>
              </div>
            )}

            {/* Upload Action Button */}
            <button
              type="button"
              id="btn-upload-contract"
              disabled={!stagedFile || isUploading}
              onClick={handleUploadSubmit}
              className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Uploading & Deploying...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload & Apply to {selectedPosition}
                </>
              )}
            </button>
          </div>

          {/* Quick Text Clause Editor (Collapsible) */}
          {showTextEditor && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-900" /> Contract Text Clauses & Tokens
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Use tokens like {'{{FULL_NAME}}'}, {'{{AFFILIATE_CODE}}'}, {'{{ACCREDITATION_START_DATE}}'}, {'{{ACCREDITATION_EXPIRY_DATE}}'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTextEditor(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <textarea
                rows={12}
                value={editedRawText}
                onChange={(e) => setEditedRawText(e.target.value)}
                className="w-full font-mono text-[11px] p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50 leading-relaxed text-slate-800"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTextEditor(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-save-contract-text"
                  disabled={isSavingText}
                  onClick={handleSaveTextContent}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition flex items-center gap-1.5"
                >
                  {isSavingText ? 'Saving...' : 'Save Text Clauses'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
