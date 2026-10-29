import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  FileCode,
  Tag,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { WelcomeLetterTemplate } from '../types';
import { api } from '../services/api';
import { clientStorage } from '../services/clientStorage';
import { formatDateTime } from '../utils/dateFormatter';

interface WelcomeLetterTemplateModalProps {
  currentUser: {
    role: string;
    fullName?: string;
    displayName?: string;
    email?: string;
  };
  onClose: () => void;
  onTemplateUpdated: (template: WelcomeLetterTemplate) => void;
  showToast: (msg: string) => void;
}

export const WelcomeLetterTemplateModal: React.FC<WelcomeLetterTemplateModalProps> = ({
  currentUser,
  onClose,
  onTemplateUpdated,
  showToast,
}) => {
  const [template, setTemplate] = useState<WelcomeLetterTemplate>(() =>
    clientStorage.getWelcomeLetterTemplate()
  );
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [stagedFile, setStagedFile] = useState<{
    file: File;
    name: string;
    size: string;
    type: string;
    dataUrl: string;
    rawText?: string;
  } | null>(null);
  const [notes, setNotes] = useState(template.notes || '');
  const [customTitle, setCustomTitle] = useState(template.title || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFileProcess = (file: File) => {
    const sizeStr = formatFileSize(file.size);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setStagedFile({
        file,
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dataUrl: result,
      });
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
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
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSaveUpload = async () => {
    if (!stagedFile && !notes && !customTitle) {
      showToast('Please select a template file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const uploaderName = currentUser.displayName || currentUser.fullName || 'Rolly Manaog (BD Staff)';

      const res = await api.uploadWelcomeLetterTemplate({
        title: customTitle.trim() || template.title,
        fileName: stagedFile ? stagedFile.name : template.fileName,
        fileType: stagedFile ? stagedFile.type : template.fileType,
        fileSize: stagedFile ? stagedFile.size : template.fileSize,
        fileData: stagedFile ? stagedFile.dataUrl : template.fileData,
        lastUpdatedBy: uploaderName,
        notes: notes.trim() || undefined,
      });

      setTemplate(res.template);
      onTemplateUpdated(res.template);
      setStagedFile(null);
      showToast('Welcome Letter template successfully updated!');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload Welcome Letter template.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadCurrent = () => {
    if (template.fileData) {
      const link = document.createElement('a');
      link.href = template.fileData;
      link.download = template.fileName;
      link.click();
    } else {
      showToast('Downloading standard template document...');
      const dummy = `MEGAWORLD INTERNATIONAL OFFICIAL WELCOME LETTER TEMPLATE\n\nReference: {{affiliateCode}}\nDate: {{approvalDate}}\n\nTo: {{fullName}}\nPosition: {{position}}\nRegion: {{region}}\n\nCongratulations on your accreditation approval...`;
      const blob = new Blob([dummy], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = template.fileName.replace(/\.docx?$/, '.txt');
      link.click();
    }
  };

  const templateTags = [
    { tag: '{{fullName}}', desc: 'Full legal name of the accredited affiliate' },
    { tag: '{{affiliateCode}}', desc: 'Permanent Affiliate Code (e.g. IPA-AP2-000024)' },
    { tag: '{{position}}', desc: 'Designated accredited position title' },
    { tag: '{{region}}', desc: 'Territory / Regional Operations Hub' },
    { tag: '{{approvalDate}}', desc: 'Accreditation approval start date' },
    { tag: '{{expiryDate}}', desc: '4-month term expiration date' },
    { tag: '{{teamLead}}', desc: 'Territory Head / Team Lead / Upline Manager' },
    { tag: '{{portalUrl}}', desc: 'Official portal access link' },
    { tag: '{{email}}', desc: 'Registered affiliate email address' },
  ];

  return (
    <div
      id="welcome-template-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-6 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-900/60 border border-blue-700/60 text-blue-300">
              <UploadCloud className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Welcome Letter Template Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload official Word (.docx) or PDF template issued to approved affiliates.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-welcome-template-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Active Template Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Active Template File
              </span>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900 shrink-0" />
                <strong className="text-slate-900 text-sm font-semibold">{template.fileName}</strong>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] pt-0.5">
                <span>Size: <strong className="text-slate-700">{template.fileSize}</strong></span>
                <span>•</span>
                <span>By: <strong className="text-slate-700">{template.lastUpdatedBy}</strong></span>
                <span>•</span>
                <span>Updated: <strong className="text-slate-700">{formatDateTime(template.lastUpdatedAt)}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadCurrent}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-900" />
              <span>Download File</span>
            </button>
          </div>

          {/* Drag & Drop File Upload Zone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Upload New Welcome Letter Template
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
                dragActive
                  ? 'border-blue-900 bg-blue-50/70'
                  : stagedFile
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-blue-900 bg-slate-50/50 hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.pdf,.txt,.rtf,.html"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileProcess(f);
                }}
              />

              {stagedFile ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-900 block font-semibold">
                      {stagedFile.name}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {stagedFile.size} • Ready to save
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStagedFile(null);
                    }}
                    className="text-[11px] text-rose-600 hover:underline block mx-auto font-medium"
                  >
                    Remove and choose another
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <UploadCloud className="w-8 h-8 text-blue-900 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop template file here
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports Microsoft Word (.docx), PDF, or HTML letter templates
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Title & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Template Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Megaworld International Welcome Letter 2026"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Revision Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Updated signatories for 2026"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 text-xs"
              />
            </div>
          </div>

          {/* Supported Dynamic Placeholder Tags Reference */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-blue-950 font-bold">
              <Tag className="w-3.5 h-3.5 text-blue-900" />
              <span>Supported Dynamic Placeholder Tags in Template</span>
            </div>
            <p className="text-[11px] text-slate-600">
              When using a custom template file, these tags will be automatically replaced with the approved affiliate's details:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {templateTags.map(({ tag, desc }) => (
                <div key={tag} className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-blue-200">
                  <code className="font-mono text-[11px] font-bold text-blue-900">{tag}</code>
                  <span className="text-[10px] text-slate-500 truncate">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-save-welcome-template"
            onClick={handleSaveUpload}
            disabled={isUploading}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
            <span>{isUploading ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
