import React, { useState, useRef, useEffect } from 'react';
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
  Tag,
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { Position, POSITIONS, PositionContractTemplate, AgentProfile } from '../types';
import { api } from '../services/api';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import {
  generateContractPdf,
  downloadPdfBlob,
  generateContractDocx,
  downloadContractBlob,
  readDocxTemplateTags,
  getStandardTemplateTagsSchema,
  getDefaultTemplateUrlForPosition,
  getDefaultTemplateFileName,
} from '../utils/contractGenerator';
import { extractContractData } from './ContractDocument';

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
  const [stagedDetectedTags, setStagedDetectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedTestAgentCode, setSelectedTestAgentCode] = useState<string>('');
  const [isGeneratingTestDocx, setIsGeneratingTestDocx] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string>('All');
  const [activeContractDetectedTags, setActiveContractDetectedTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeContract =
    positionContracts.find((c) => c.position === selectedPosition) || {
      position: selectedPosition,
      title: `Special Affiliate Agreement (SAA) — ${selectedPosition}`,
      fileName: getDefaultTemplateFileName(selectedPosition),
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: '2.2 MB',
      templateUrl: getDefaultTemplateUrlForPosition(selectedPosition),
      lastUpdatedBy: `${currentUser.displayName || currentUser.role}`,
      lastUpdatedAt: new Date().toISOString(),
      notes: `Official uploaded contract for ${selectedPosition}`,
    };

  // Affiliates in this tier
  const affectedAgents = agents.filter((a) => a.position === selectedPosition);

  // Set default test agent when position changes
  useEffect(() => {
    if (affectedAgents.length > 0) {
      setSelectedTestAgentCode(affectedAgents[0].affiliateCode);
    } else if (agents.length > 0) {
      setSelectedTestAgentCode(agents[0].affiliateCode);
    }
  }, [selectedPosition, agents]);

  // Load detected tags for the active template
  useEffect(() => {
    let isCancelled = false;
    const loadTags = async () => {
      if (activeContract.detectedTags && activeContract.detectedTags.length > 0) {
        setActiveContractDetectedTags(activeContract.detectedTags);
        return;
      }

      setIsLoadingTags(true);
      try {
        const source = activeContract.fileData || activeContract.templateUrl || getDefaultTemplateUrlForPosition(selectedPosition);
        const tags = await readDocxTemplateTags(source);
        if (!isCancelled) {
          setActiveContractDetectedTags(tags);
        }
      } catch (err) {
        console.error('Failed to parse tags:', err);
      } finally {
        if (!isCancelled) setIsLoadingTags(false);
      }
    };

    loadTags();
    return () => {
      isCancelled = true;
    };
  }, [selectedPosition, activeContract]);

  // File size formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      // Extract template tags from docx file immediately
      let detected: string[] = [];
      if (file.name.endsWith('.docx') || file.type.includes('word')) {
        try {
          detected = await readDocxTemplateTags(dataUrl);
        } catch (e) {
          console.warn('Could not read tags from staged file:', e);
        }
      }

      setStagedDetectedTags(detected);

      // If text-like file, also read text
      if (
        file.type.includes('text') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.html') ||
        file.name.endsWith('.md')
      ) {
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
          type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
      showToast('Please select a template file to upload first.');
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

      const updatedTpl = {
        ...res.template,
        detectedTags: stagedDetectedTags.length > 0 ? stagedDetectedTags : activeContractDetectedTags,
      };

      onContractUpdated(updatedTpl);
      setActiveContractDetectedTags(stagedDetectedTags);
      setUploadSuccess(true);
      setStagedFile(null);
      setStagedDetectedTags([]);
      setNotes('');
      setCustomTitle('');
      showToast(
        `Official template for ${selectedPosition} deployed! All generated contracts will now use this exact document template.`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to upload contract template.');
    } finally {
      setIsUploading(false);
    }
  };

  // Direct download of the uploaded official template file
  const handleDownloadOfficialTemplate = () => {
    const filename = activeContract.fileName || getDefaultTemplateFileName(selectedPosition);

    if (activeContract.fileData && activeContract.fileData.includes('base64,')) {
      const a = document.createElement('a');
      a.href = activeContract.fileData;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded official uploaded template: ${filename}`);
    } else {
      // Download from public templates URL
      const url = activeContract.templateUrl || getDefaultTemplateUrlForPosition(selectedPosition);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded official position template: ${filename}`);
    }
  };

  // Test Contract Generation: Maps selected agent's information into the uploaded template tags and outputs PDF format
  const handleTestGenerateContract = async () => {
    const targetAgent = agents.find((a) => a.affiliateCode === selectedTestAgentCode) || agents[0];
    if (!targetAgent) {
      showToast('No agent selected for test contract generation.');
      return;
    }

    setIsGeneratingTestDocx(true);
    try {
      const contractData = extractContractData(null, targetAgent, selectedPosition);
      const templateSource =
        activeContract.fileData ||
        activeContract.templateUrl ||
        getDefaultTemplateUrlForPosition(selectedPosition);

      const genResult = await generateContractPdf(templateSource, contractData, selectedPosition);
      downloadPdfBlob(genResult.blob, genResult.fileName);

      showToast(
        `Generated ${genResult.fileName} (PDF): Successfully mapped ${genResult.replacedCount} placeholder tags with ${targetAgent.fullName}'s data!`
      );
    } catch (err: any) {
      console.error('Test contract PDF generation error:', err);
      showToast(err.message || 'Failed to generate test contract PDF.');
    } finally {
      setIsGeneratingTestDocx(false);
    }
  };

  // Optional: Generate Word DOCX for raw template editing
  const handleTestGenerateDocxContract = async () => {
    const targetAgent = agents.find((a) => a.affiliateCode === selectedTestAgentCode) || agents[0];
    if (!targetAgent) return;

    setIsGeneratingTestDocx(true);
    try {
      const contractData = extractContractData(null, targetAgent, selectedPosition);
      const templateSource =
        activeContract.fileData ||
        activeContract.templateUrl ||
        getDefaultTemplateUrlForPosition(selectedPosition);

      const genResult = await generateContractDocx(templateSource, contractData, selectedPosition);
      downloadContractBlob(genResult.blob, genResult.fileName);

      showToast(`Generated Word document: ${genResult.fileName}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate Word contract.');
    } finally {
      setIsGeneratingTestDocx(false);
    }
  };

  const allSchemaTags = getStandardTemplateTagsSchema();

  const filteredSchemaTags = allSchemaTags.filter((t) => {
    if (activeTagFilter === 'All') return true;
    return t.category === activeTagFilter;
  });

  const getFormatBadge = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toUpperCase() || 'DOCX';
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-900 border-blue-200">
        .{ext} Template
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" /> BD Operations • Automated Contract & SAA Template Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Contract & SAA Management per Position
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              The official document template uploaded here for each position is the <strong>source of truth</strong>.
              When an Agent's contract is generated, the system automatically maps the Agent's submitted data into
              the designated placeholder tags (e.g. <code className="text-amber-300 font-mono">{'{{firstname}}'}</code>,{' '}
              <code className="text-amber-300 font-mono">{'{{localbank}}'}</code>,{' '}
              <code className="text-amber-300 font-mono">{'{{insert_image signature 200 70}}'}</code>) while preserving 100% of all clauses, formatting, and layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="test-download-active-contract"
              onClick={handleDownloadOfficialTemplate}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2 shadow-sm"
              title="Download the official source template file"
            >
              <Download className="w-4 h-4 text-amber-300" />
              Download Template ({activeContract.fileName.split('.').pop()?.toUpperCase() || 'DOCX'})
            </button>

            <button
              type="button"
              id="quick-generate-pdf"
              onClick={handleTestGenerateContract}
              disabled={isGeneratingTestDocx}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-2 shadow-md disabled:opacity-50"
              title="Generate a filled SAA Contract in PDF format using current template and sample agent data"
            >
              <FileCheck className="w-4 h-4 text-slate-950" />
              Generate Sample SAA (PDF)
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950">
                PDF
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Position Selector Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-200">
        {POSITIONS.map((pos) => {
          const match = positionContracts.find((c) => c.position === pos);
          const isSelected = selectedPosition === pos;
          const ext = match?.fileName.split('.').pop()?.toUpperCase() || 'DOCX';

          return (
            <button
              key={pos}
              type="button"
              id={`tab-pos-${pos.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                setSelectedPosition(pos);
                setStagedFile(null);
                setStagedDetectedTags([]);
                setUploadSuccess(false);
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
                {match ? match.fileName : getDefaultTemplateFileName(pos)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Active Template Info & Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Currently Active Template Info & Agent Impact */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current File Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Source of Truth Template
                </span>
                <h2 className="text-base font-bold text-slate-900">{selectedPosition}</h2>
              </div>
              {getFormatBadge(activeContract.fileName)}
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
                    <span className="text-slate-400">Source:</span>
                    <span className="font-semibold text-blue-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Official Google Drive Template
                    </span>
                  </div>
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

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  id="btn-download-contract-file"
                  onClick={handleDownloadOfficialTemplate}
                  className="w-full py-2.5 px-3 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
                <button
                  type="button"
                  id="btn-test-generate-pdf"
                  disabled={isGeneratingTestDocx}
                  onClick={handleTestGenerateContract}
                  className="w-full py-2.5 px-3 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  title="Test generating filled Sales Accreditation Contract in PDF format"
                >
                  {isGeneratingTestDocx ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-amber-300" /> Test SAA (PDF)
                      <span className="text-[9px] font-black uppercase px-1 py-0.2 bg-amber-400 text-slate-950 rounded">
                        PDF
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Test Contract Generation With Live Agent Selection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-blue-900" /> Live Data Transfer & Generation Test
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded-full">
                PDF Output
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select an agent to test transferring their submitted details (Personal info, Bank, Leadership, Signature)
              into this template’s placeholder tags:
            </p>

            <div className="space-y-2">
              <select
                value={selectedTestAgentCode}
                onChange={(e) => setSelectedTestAgentCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
              >
                {agents.map((ag) => (
                  <option key={ag.affiliateCode} value={ag.affiliateCode}>
                    {ag.fullName} ({ag.affiliateCode}) — {ag.position}
                  </option>
                ))}
              </select>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleTestGenerateContract}
                  disabled={isGeneratingTestDocx}
                  className="flex-1 py-2.5 px-3 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  title="Generate and download filled contract in PDF format"
                >
                  {isGeneratingTestDocx ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-900" /> Filling Placeholders (PDF)...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-slate-900" /> Generate SAA Contract (PDF)
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950">
                        PDF
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTestGenerateDocxContract}
                  disabled={isGeneratingTestDocx}
                  className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition flex items-center justify-center gap-1.5"
                  title="Generate as Word Docx (.docx)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-900" /> Word (.docx)
                </button>
              </div>
            </div>
          </div>

          {/* Active Affiliates Impact Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-900" /> Active Affiliates in {selectedPosition} Tier
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-mono font-bold text-xs rounded-full">
                {affectedAgents.length} Agents
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              When any affiliate in this position generates or downloads their Sales Agency Agreement, they receive this exact template with their information automatically transferred.
            </p>

            <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto">
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

        {/* Right Column: Upload New Template & Template Tag Inspection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload Replacement Contract or SAA File */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-900" /> Upload Replacement Template File
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Target Position Tier: <strong className="text-blue-900">{selectedPosition}</strong>.
                Preserve all placeholders/template tags so agent information transfers into the correct fields.
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
                accept=".docx,.doc,.pdf,.txt,.rtf,.html"
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
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-emerald-950">File Ready for Deployment</p>
                    <p className="text-xs font-mono font-semibold text-slate-800">{stagedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Size: {stagedFile.size} • Type: {stagedFile.type || 'Custom format'}
                    </p>
                    {stagedDetectedTags.length > 0 && (
                      <div className="mt-2 p-2 bg-emerald-100/60 rounded-lg text-emerald-900 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
                        <strong>{stagedDetectedTags.length} template tags</strong> detected and verified in this document!
                      </div>
                    )}
                    <span className="inline-block mt-2 text-[11px] font-semibold text-blue-900 hover:underline">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Drag & drop contract template (.docx) here, or <span className="text-blue-900 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Accepted: .docx, .doc, .pdf (Official Word templates recommended)
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
                  placeholder={`e.g. Special Affiliate Agreement (SAA) — ${selectedPosition}`}
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
                  placeholder="e.g. Q4 2026 Updated Commission Schedule with 4-month international accreditation terms."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none resize-none"
                />
              </div>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Successfully updated template for <strong>{selectedPosition}</strong>! Affiliates will now generate their contracts from this exact file.
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
                  <RefreshCw className="w-4 h-4 animate-spin" /> Deploying Template...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload & Apply as Official Template for {selectedPosition}
                </>
              )}
            </button>
          </div>

          {/* Template Tags & Data Transfer Mapping Schema */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-900" /> Designated Template Tags & Data Transfer Schema
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tags recognized in the template to automatically insert the Agent’s information into the designated fields.
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['All', 'Personal', 'Bank', 'Team & Leadership', 'Dates', 'Document & Images'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTagFilter(cat)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                      activeTagFilter === cat
                        ? 'bg-blue-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Detected Tags Pills in the Active Template */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-900" />
                  Detected Placeholders in {activeContract.fileName}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full">
                  {activeContractDetectedTags.length} Tags Identified
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {activeContractDetectedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white border border-slate-200 text-blue-950 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Mapping Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Placeholder / Template Tag</th>
                    <th className="py-2.5 px-3">Target Field in Agent Profile</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Sample Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchemaTags.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{entry.tag}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{entry.fieldLabel}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          {entry.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] truncate max-w-[200px]" title={entry.sampleValue}>
                        {entry.sampleValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
