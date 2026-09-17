import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  FileText,
  Sparkles,
  Calendar,
  Layers,
  Check,
  Lock,
  ExternalLink,
  Download,
  FileType,
  Trash2,
  Link,
  Globe,
} from 'lucide-react';
import { AgentProfile, Position, Region, SystemSettings, POSITIONS, REGIONS } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { download34ColumnCsv, download34ColumnExcel } from '../utils/agentDatasetExport';

export interface RawSpreadsheetRecord {
  email: string;
  nickname?: string;
  fullName?: string;
  passwordHash?: string;
  dateCreated?: string;
  status?: string;
  region?: Region;
  positions?: Position[];
  position?: Position;
  hasExistingContract?: boolean;
}

// 17 records from the attached Google Spreadsheet Monitoring (2013 - Present)
export const ATTACHED_SPREADSHEET_RECORDS: RawSpreadsheetRecord[] = [
  {
    email: 'jadelacruz.global@megaworld-marketing.com',
    nickname: 'Supremo',
    passwordHash: 'YzYIaA6q2MNtxp6i6Nvz1qb6fjSC+uIRTP523J6S9fo=',
    dateCreated: '20/01/2026 02:04:53',
    status: 'Active',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate', 'Senior Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'bmanga.global@megaworld-marketing.com',
    nickname: 'Amoreee',
    passwordHash: '8ap+5BInyyK0DxP1bWgh67PI8YWMsj9smYWfSDcmVHg=',
    dateCreated: '26/01/2026 03:41:05',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Senior Marketing Associate',
    positions: ['Marketing Associate', 'Senior Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'rvalenzuela.global@megaworld-marketing.com',
    nickname: 'RV',
    passwordHash: 't2pqv943QO+5qInb+AbPEkL17kPWYqoy3iXEQ6p3dtQ=',
    dateCreated: '26/01/2026 05:57:12',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Manager',
    positions: ['Marketing Associate', 'Senior Marketing Associate', 'Marketing Manager'],
    hasExistingContract: true,
  },
  {
    email: 'rmanaog.global@megaworld-marketing.com',
    nickname: 'Rolls',
    passwordHash: 'jrk1EmHgiYUvpEUR4J0xzSC3B3O49slnIemJ/G9/ZRo=',
    dateCreated: '29/01/2026 03:05:51',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'malabit@megaworld-marketing.com',
    nickname: 'manel',
    passwordHash: 'kOPC/O5p1X3WWHGKiuYBqEcf+1bIajC9repdWbT/EuQ=',
    dateCreated: '02/02/2026 02:23:05',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'rgiron@megaworld-marketing.com',
    nickname: 'Rosey',
    passwordHash: 'usZGaUXVvCcQDomLRs/FfZD4dTwo9uZSGKmK3wYrOiQ=',
    dateCreated: '02/02/2026 03:55:56',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Senior Marketing Associate',
    positions: ['Marketing Associate', 'Senior Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'gvito@megaworld-marketing.com',
    nickname: '',
    fullName: 'Gabriel Vito',
    passwordHash: '5jeQOltqCkjsd0AKX3SvV5BNaDf+qH4IeE924WlNQVc=',
    dateCreated: '02/02/2026 08:00:02',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'clabita.global@megaworld-marketing.com',
    nickname: 'Cheesecarls',
    passwordHash: '#ERROR!',
    dateCreated: '03/02/2026 01:00:52',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'fcabotaje@megaworld-marketing.com',
    nickname: 'Phet',
    passwordHash: 'QejEgiLxTxItOR+vbEl8nr866ftAkzXxeLYwcREayKU=',
    dateCreated: '03/02/2026 01:06:54',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Manager',
    positions: ['Marketing Associate', 'Senior Marketing Associate', 'Marketing Manager'],
    hasExistingContract: true,
  },
  {
    email: 'lodero.global@megaworld-marketing.com',
    nickname: 'Laiza',
    passwordHash: 'AFZ9vfm4CNn6eLeGTsoQiIGKWs2R2abMlEFN4droHwE=',
    dateCreated: '03/02/2026 02:14:24',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'manoso@megaworld-marketing.com',
    nickname: 'Mars',
    passwordHash: 'bjxbh6EOy5O8mWsRYFe75Babtc96RRr27EWutW0sNkQ=',
    dateCreated: '03/02/2026 02:20:31',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Senior Marketing Associate',
    positions: ['Marketing Associate', 'Senior Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'lrey.global@megaworld-marketing.com',
    nickname: '',
    fullName: 'Leila Rey',
    passwordHash: 'KvVQ9Xc9j3B7Ru9dak2NDmuLWxHVgMQWO2OU92xxb88=',
    dateCreated: '03/02/2026 03:48:39',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'amalabug.global@megaworld-marketing.com',
    nickname: 'AJ',
    passwordHash: 'uHePU+lJuQY5mRtKLgHQfQ6petKCeRXnfPWwVIPknGg=',
    dateCreated: '04/02/2026 06:36:34',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Partner',
    positions: ['Marketing Associate', 'Senior Marketing Associate', 'Marketing Manager', 'Marketing Partner'],
    hasExistingContract: true,
  },
  {
    email: 'mdelacruz@megaworld-marketing.com',
    nickname: 'Meralyn-Mktg',
    passwordHash: '3AO+8xEiupZtshxF7FubBvf615AcHDbEiqtPaNqhU2A=',
    dateCreated: '18/02/2026 01:06:34',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Director',
    positions: ['Marketing Associate', 'Senior Marketing Associate', 'Marketing Manager', 'Marketing Director'],
    hasExistingContract: true,
  },
  {
    email: 'apama.global@megaworld-marketing.com',
    nickname: 'Loisy',
    passwordHash: 'KlsOC4qEoGr75N7FypJLVK2H2Flgr04sG9UeUcg/Pxw=',
    dateCreated: '23/02/2026 09:05:43',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    positions: ['Marketing Associate', 'Senior Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'jjose.global@megaworld-marketing.com',
    nickname: 'Master',
    passwordHash: 'FYAWyfGkXmh4F5/00FRJSXtSirGA2zaM9fUcsiclWSY=',
    dateCreated: '14/07/2026 00:19:28',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Senior Marketing Associate',
    positions: ['Marketing Associate', 'Senior Marketing Associate'],
    hasExistingContract: true,
  },
  {
    email: 'mbelles@megaworld-marketing.com',
    nickname: 'Loren Belles',
    passwordHash: 'dfKOAjsMraVyGJnoPq3bUABn6+bEPF3pdR//X+SDfNA=',
    dateCreated: '17/08/2026 06:08:33',
    status: 'Approved',
    region: 'Asia Pacific 2',
    position: 'Marketing Partner',
    positions: ['Marketing Associate', 'Senior Marketing Associate', 'Marketing Manager', 'Marketing Director', 'Marketing Partner'],
    hasExistingContract: true,
  },
];

export interface UploadedFileInfo {
  name: string;
  size: number;
  type: 'excel' | 'csv';
  extension: string;
  sheetNames: string[];
  selectedSheet: string;
  totalRows: number;
  workbook?: XLSX.WorkBook;
}

export function parseWorksheetToRecords(sheet: XLSX.WorkSheet): RawSpreadsheetRecord[] {
  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  if (!rows || rows.length < 2) return [];

  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = rows[i];
    if (
      Array.isArray(r) &&
      r.some((cell: any) => {
        const s = String(cell).toLowerCase();
        return (
          s.includes('email') ||
          s.includes('mail') ||
          s.includes('name') ||
          s.includes('agent') ||
          s.includes('code') ||
          s.includes('affiliate')
        );
      })
    ) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = (rows[headerRowIndex] || []).map((h: any) => String(h).trim().toLowerCase());
  const emailIdx = headers.findIndex((h: string) => h.includes('email') || h.includes('mail'));
  const nameIdx = headers.findIndex((h: string) => h.includes('full name') || (h.includes('name') && !h.includes('nick')));
  const nickIdx = headers.findIndex((h: string) => h.includes('nick') || h.includes('alias'));
  const passIdx = headers.findIndex((h: string) => h.includes('pass') || h.includes('hash'));
  const dateIdx = headers.findIndex((h: string) => h.includes('date') || h.includes('create') || h.includes('reg'));
  const statusIdx = headers.findIndex((h: string) => h.includes('status'));
  const posIdx = headers.findIndex((h: string) => h.includes('pos') || h.includes('role') || h.includes('designation'));
  const regIdx = headers.findIndex((h: string) => h.includes('region') || h.includes('territory') || h.includes('branch'));

  const records: RawSpreadsheetRecord[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    let email = emailIdx !== -1 && row[emailIdx] ? String(row[emailIdx]).trim() : '';
    if (!email || !email.includes('@')) {
      const found = row.find((c: any) => typeof c === 'string' && c.includes('@') && c.includes('.'));
      if (found) email = String(found).trim();
    }
    if (!email || !email.includes('@')) continue;

    const fullName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : undefined;
    const nickname = nickIdx !== -1 && row[nickIdx] ? String(row[nickIdx]).trim() : undefined;
    const passwordHash = passIdx !== -1 && row[passIdx] ? String(row[passIdx]).trim() : undefined;

    let dateCreated: string | undefined = undefined;
    if (dateIdx !== -1 && row[dateIdx] !== undefined && row[dateIdx] !== '') {
      const dv = row[dateIdx];
      if (dv instanceof Date) {
        dateCreated = dv.toISOString().split('T')[0];
      } else {
        dateCreated = String(dv).trim();
      }
    }

    const status = statusIdx !== -1 && row[statusIdx] ? String(row[statusIdx]).trim() : 'Approved';
    const regRaw = regIdx !== -1 && row[regIdx] ? String(row[regIdx]).trim() : '';
    let matchedRegion: Region = 'Asia Pacific 2';
    if (regRaw) {
      const found = REGIONS.find((r) => r.toLowerCase() === regRaw.toLowerCase());
      if (found) {
        matchedRegion = found;
      } else {
        const partial = REGIONS.find(
          (r) =>
            r.toLowerCase().includes(regRaw.toLowerCase()) ||
            regRaw.toLowerCase().includes(r.toLowerCase())
        );
        if (partial) {
          matchedRegion = partial;
        }
      }
    }

    const posRaw = posIdx !== -1 && row[posIdx] ? String(row[posIdx]) : '';
    const positions: Position[] = [];
    if (posRaw) {
      POSITIONS.forEach((p) => {
        if (posRaw.toLowerCase().includes(p.toLowerCase())) {
          positions.push(p);
        }
      });
    }
    if (positions.length === 0) {
      positions.push('Marketing Associate');
    }

    records.push({
      email,
      nickname: nickname || (fullName ? fullName.split(' ')[0] : undefined),
      fullName,
      passwordHash,
      dateCreated,
      status,
      region: matchedRegion,
      position: positions[positions.length - 1],
      positions,
      hasExistingContract: true,
    });
  }
  return records;
}

interface ImportAgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentProfile[];
  onImportComplete: (importedAgents: AgentProfile[], message: string) => void;
  currentUserRole: string;
  currentUser?: {
    fullName: string;
    email: string;
    role: string;
  };
  settings: SystemSettings;
}

export const ImportAgentsModal: React.FC<ImportAgentsModalProps> = ({
  isOpen,
  onClose,
  agents,
  onImportComplete,
  currentUserRole,
  currentUser = {
    fullName: 'Business Development Admin',
    email: 'admin@megaworld.com',
    role: 'Admin',
  },
  settings,
}) => {
  const [importMode, setImportMode] = useState<'link' | 'preset' | 'file' | 'paste'>('link');
  const [sheetsLinkUrl, setSheetsLinkUrl] = useState<string>(
    settings?.googleSpreadsheetUrl ||
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'
  );
  const [isSyncingSheetsLink, setIsSyncingSheetsLink] = useState<boolean>(false);
  const [duplicateHandling, setDuplicateHandling] = useState<'update' | 'skip'>('update');
  const [customCsvText, setCustomCsvText] = useState<string>('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFileInfo | null>(null);
  const [fileRecords, setFileRecords] = useState<RawSpreadsheetRecord[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Access Control Check: Only Staff and Admin are authorized
  const isAuthorized =
    currentUserRole?.toLowerCase() === 'admin' ||
    currentUserRole?.toLowerCase() === 'staff' ||
    currentUser.role?.toLowerCase() === 'admin' ||
    currentUser.role?.toLowerCase() === 'staff';

  // Real-time Google Spreadsheet Sync Handler
  const handleSyncGoogleSpreadsheetLink = async () => {
    if (!sheetsLinkUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid Google Spreadsheet URL or Sheet ID.',
      });
      return;
    }

    setIsSyncingSheetsLink(true);
    setStatusMessage(null);

    try {
      const res = await api.fetchOnlineSpreadsheetData(sheetsLinkUrl);
      if (res.records && res.records.length > 0) {
        setFileRecords(res.records);
        setUploadedFileInfo({
          fileName: 'Google Sheets Live Database Sync',
          sheetNames: ['Online Master Sheet'],
          activeSheet: 'Online Master Sheet',
          totalRows: res.records.length,
          fileSize: `${res.records.length} synced rows`,
        });
        setStatusMessage({
          type: 'success',
          text: `Online Database Synced: Retrieved ${res.records.length} records with automated contract dates and accreditation timelines!`,
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: 'Connected to Google Spreadsheet, but no agent rows were returned.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to connect to Google Spreadsheet.',
      });
    } finally {
      setIsSyncingSheetsLink(false);
    }
  };

  // Parse records based on mode
  const rawRecords = useMemo((): RawSpreadsheetRecord[] => {
    if (importMode === 'link') {
      return fileRecords.length > 0 ? fileRecords : ATTACHED_SPREADSHEET_RECORDS;
    }

    if (importMode === 'preset') {
      return ATTACHED_SPREADSHEET_RECORDS;
    }

    if (importMode === 'file') {
      return fileRecords;
    }

    if (!customCsvText.trim()) return [];

    const lines = customCsvText.trim().split(/\r?\n/);
    if (lines.length === 0) return [];

    const parsed: RawSpreadsheetRecord[] = [];
    const headers = lines[0].split(/[,\t]/).map((h) => h.trim().toLowerCase());

    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const nickIdx = headers.findIndex((h) => h.includes('nick') || h.includes('name'));
    const passIdx = headers.findIndex((h) => h.includes('pass') || h.includes('hash'));
    const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('create'));
    const statusIdx = headers.findIndex((h) => h.includes('status'));
    const posIdx = headers.findIndex((h) => h.includes('pos') || h.includes('role'));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(/[,\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));

      const email = emailIdx !== -1 ? cols[emailIdx] : cols[0];
      if (!email || !email.includes('@')) continue;

      const nickname = nickIdx !== -1 ? cols[nickIdx] : undefined;
      const passwordHash = passIdx !== -1 ? cols[passIdx] : undefined;
      const dateCreated = dateIdx !== -1 ? cols[dateIdx] : undefined;
      const status = statusIdx !== -1 ? cols[statusIdx] : 'Approved';
      const posRaw = posIdx !== -1 ? cols[posIdx] : undefined;

      // Extract positions
      const positions: Position[] = [];
      if (posRaw) {
        POSITIONS.forEach((p) => {
          if (posRaw.toLowerCase().includes(p.toLowerCase())) {
            positions.push(p);
          }
        });
      }
      if (positions.length === 0) {
        positions.push('Marketing Associate');
      }

      parsed.push({
        email,
        nickname,
        passwordHash,
        dateCreated,
        status,
        region: 'Asia Pacific 2',
        position: positions[positions.length - 1],
        positions,
        hasExistingContract: true,
      });
    }

    return parsed;
  }, [importMode, fileRecords, customCsvText]);

  // Analyze records with Double Checker against existing agents in DB
  const analyzedRecords = useMemo(() => {
    return rawRecords.map((rec) => {
      // Parse year
      let year = new Date().getFullYear();
      if (rec.dateCreated) {
        const ddmmyyyy = rec.dateCreated.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (ddmmyyyy) {
          year = parseInt(ddmmyyyy[3], 10);
        } else {
          const parsed = new Date(rec.dateCreated);
          if (!isNaN(parsed.getTime())) year = parsed.getFullYear();
        }
      }

      // Year Cutoff Filter Removed: 100% of historical and current records are processed and included
      const meetsYearFilter = true;

      // Double-checker: Check for duplicate account by Email (case-insensitive) or Name
      const duplicateAgent = agents.find(
        (a) =>
          a.email.toLowerCase() === rec.email.toLowerCase() ||
          (rec.fullName && a.fullName.toLowerCase() === rec.fullName.toLowerCase())
      );

      const isDuplicate = !!duplicateAgent;

      // Positions to be added / already present
      const requestedPositions: Position[] = rec.positions && rec.positions.length > 0
        ? rec.positions
        : [rec.position || 'Marketing Associate'];

      const newPositionsToAdd = isDuplicate
        ? requestedPositions.filter((p) => !duplicateAgent.unlockedPositions.includes(p))
        : requestedPositions;

      return {
        ...rec,
        year,
        meetsYearFilter,
        isDuplicate,
        duplicateAgent,
        requestedPositions,
        newPositionsToAdd,
      };
    });
  }, [rawRecords, agents]);

  // Filtered view by search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return analyzedRecords;
    const term = searchTerm.toLowerCase();
    return analyzedRecords.filter(
      (r) =>
        r.email.toLowerCase().includes(term) ||
        (r.nickname && r.nickname.toLowerCase().includes(term)) ||
        (r.fullName && r.fullName.toLowerCase().includes(term)) ||
        r.requestedPositions.some((p) => p.toLowerCase().includes(term)) ||
        (r.duplicateAgent && r.duplicateAgent.affiliateCode.toLowerCase().includes(term))
    );
  }, [analyzedRecords, searchTerm]);

  // Metric counts
  const validRecordsToProcess = analyzedRecords.filter((r) => r.meetsYearFilter);
  const newAccountsCount = validRecordsToProcess.filter((r) => !r.isDuplicate).length;
  const duplicateAccountsCount = validRecordsToProcess.filter((r) => r.isDuplicate).length;

  if (!isOpen) return null;

  // Render Access Denied if non-Staff and non-Admin
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto text-rose-600">
            <Lock className="w-6 h-6" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Restricted Feature</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Google Spreadsheet Agent Import tool is restricted to <strong>Staff</strong> and <strong>Admin</strong> accounts only. Your current role is <strong>{currentUserRole}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Process uploaded Excel / CSV file
  const handleProcessFile = async (file: File) => {
    if (!file) return;
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    try {
      setIsProcessing(true);
      setStatusMessage(null);

      const isExcel =
        ext === 'xlsx' ||
        ext === 'xls' ||
        file.type.includes('spreadsheet') ||
        file.type.includes('excel') ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (isExcel) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const sheetNames = workbook.SheetNames;
        if (!sheetNames || sheetNames.length === 0) {
          throw new Error('The uploaded Excel workbook contains no readable worksheets.');
        }
        const initialSheet = sheetNames[0];
        const worksheet = workbook.Sheets[initialSheet];
        const records = parseWorksheetToRecords(worksheet);

        setUploadedFileInfo({
          name: file.name,
          size: file.size,
          type: 'excel',
          extension: ext,
          sheetNames,
          selectedSheet: initialSheet,
          totalRows: records.length,
          workbook,
        });

        setFileRecords(records);
        setImportMode('file');
        setStatusMessage({
          type: 'success',
          text: `Successfully parsed Microsoft Excel Worksheet "${file.name}" [Worksheet: ${initialSheet}] with ${records.length} records found.`,
        });
      } else {
        // CSV or text
        const text = await file.text();
        setCustomCsvText(text);
        const workbook = XLSX.read(text, { type: 'string' });
        const firstSheet = workbook.SheetNames[0];
        const records = parseWorksheetToRecords(workbook.Sheets[firstSheet]);

        setUploadedFileInfo({
          name: file.name,
          size: file.size,
          type: 'csv',
          extension: 'csv',
          sheetNames: ['Default'],
          selectedSheet: 'Default',
          totalRows: records.length,
        });

        setFileRecords(records);
        setImportMode('file');
        setStatusMessage({
          type: 'success',
          text: `Successfully loaded CSV file "${file.name}" with ${records.length} records found.`,
        });
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setStatusMessage({
        type: 'error',
        text: `Error reading file "${file.name}": ${err.message || 'Invalid or unreadable format'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleProcessFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (!uploadedFileInfo?.workbook) return;
    const worksheet = uploadedFileInfo.workbook.Sheets[sheetName];
    if (!worksheet) return;

    const records = parseWorksheetToRecords(worksheet);
    setUploadedFileInfo((prev) =>
      prev
        ? {
            ...prev,
            selectedSheet: sheetName,
            totalRows: records.length,
          }
        : null
    );
    setFileRecords(records);
    setStatusMessage({
      type: 'info',
      text: `Switched to worksheet "${sheetName}" (${records.length} records loaded).`,
    });
  };

  const handleClearUploadedFile = () => {
    setUploadedFileInfo(null);
    setFileRecords([]);
    setStatusMessage(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownloadExcelTemplate = () => {
    const templateRows = [
      [
        'Full Name',
        'Email Address',
        'Nickname',
        'Region',
        'Positions',
        'Registration Date',
        'Status',
        'Password Hash',
      ],
      [
        'Juan Dela Cruz',
        'jdelacruz.sample@megaworld-marketing.com',
        'Supremo',
        'Asia Pacific 2',
        'Marketing Associate, Senior Marketing Associate',
        '20/01/2026 02:04:53',
        'Approved',
        'YzYIaA6q2MNtxp6i6Nvz1qb6fjSC+uIRTP523J6S9fo=',
      ],
      [
        'Maria Santos',
        'msantos.sample@megaworld-marketing.com',
        'Maria',
        'Europe',
        'Marketing Manager, Marketing Director',
        '15/03/2024',
        'Approved',
        '',
      ],
      [
        'Carlos Garcia',
        'cgarcia.sample@megaworld-marketing.com',
        'Charlie',
        'North America',
        'Marketing Partner',
        '10/08/2021',
        'Approved',
        '',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 22 },
      { wch: 40 },
      { wch: 16 },
      { wch: 18 },
      { wch: 48 },
      { wch: 24 },
      { wch: 14 },
      { wch: 34 },
    ];

    download34ColumnExcel([]);
  };

  const handleDownloadCsvTemplate = () => {
    download34ColumnCsv([]);
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (validRecordsToProcess.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'No agent records found to import.',
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const payloadRecords = validRecordsToProcess.map((r) => ({
        email: r.email,
        nickname: r.nickname,
        fullName: r.fullName,
        passwordHash: r.passwordHash,
        dateCreated: r.dateCreated,
        status: r.status,
        region: r.region || 'Asia Pacific 2',
        position: r.position,
        positions: r.requestedPositions,
        hasExistingContract: true,
      }));

      const response = await api.importAgents({
        records: payloadRecords,
        importedBy: currentUser.fullName,
        importedByRole: currentUserRole,
        filterMinYear: 1900,
        duplicateHandling,
      });

      setStatusMessage({
        type: 'success',
        text: response.message,
      });

      // Notify parent to refresh agents state
      onImportComplete(response.importedAgents, response.message);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to complete agent import.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-[#002B66] text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Google Spreadsheet Agent Import</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Staff & Admin Only
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Batch import monitoring records (2013 - Present), automated unique IPA codes & duplicate account checker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status feedback message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Mode Selector & Filter Toolbar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Import Source Tabs */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Data Source
              </label>
              <div className="flex rounded-lg border border-slate-300 bg-white p-0.5">
                <button
                  type="button"
                  id="import-tab-link"
                  onClick={() => setImportMode('link')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    importMode === 'link'
                      ? 'bg-[#002B66] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link className="w-3.5 h-3.5 text-emerald-400" />
                  Sheet Link
                </button>
                <button
                  type="button"
                  id="import-tab-preset"
                  onClick={() => setImportMode('preset')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    importMode === 'preset'
                      ? 'bg-[#002B66] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Preset (17)
                </button>
                <button
                  type="button"
                  id="import-tab-excel"
                  onClick={() => setImportMode('file')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    importMode === 'file'
                      ? 'bg-[#002B66] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Excel / CSV
                  {uploadedFileInfo && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </button>
                <button
                  type="button"
                  id="import-tab-paste"
                  onClick={() => setImportMode('paste')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    importMode === 'paste'
                      ? 'bg-[#002B66] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste
                </button>
              </div>
            </div>

            {/* Year Range Filter (Removed per user instructions) */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-600" /> Year Cutoff Filter
              </label>
              <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs text-emerald-950 font-semibold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Removed • All Records Included (2013–Present)</span>
              </div>
            </div>

            {/* Duplicate Handling Strategy */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-900" /> Double Checker Strategy
              </label>
              <select
                value={duplicateHandling}
                onChange={(e) => setDuplicateHandling(e.target.value as 'update' | 'skip')}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-1 focus:ring-blue-900 focus:outline-hidden"
              >
                <option value="update">
                  Double Check & Add Positions to Existing Account
                </option>
                <option value="skip">Double Check & Skip Duplicates</option>
              </select>
            </div>
          </div>

          {/* Google Spreadsheet Link & Online Sync Area */}
          {importMode === 'link' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Google Spreadsheet Online Database Sync
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Automated Date Sync
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Connect your Google Spreadsheet link to automatically sync all automated dates (Contract Date, 4-Month Expiry Date, Renewal Eligibility) and agent records into the database.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    id="sheets-link-url-input"
                    value={sheetsLinkUrl}
                    onChange={(e) => setSheetsLinkUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-emerald-300 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  id="sync-sheets-online-btn"
                  onClick={handleSyncGoogleSpreadsheetLink}
                  disabled={isSyncingSheetsLink}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-2 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheetsLink ? 'animate-spin' : ''}`} />
                  {isSyncingSheetsLink ? 'Syncing Online Database...' : 'Sync Automated Dates from Online Database'}
                </button>
              </div>

              {/* Automation badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                <div className="p-2 bg-white rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Automated 4-Month Contract Dates</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>34-Column Official Dataset</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Resilient Deployment Fallback</span>
                </div>
              </div>
            </div>
          )}

          {/* Microsoft Excel / CSV Upload Area */}
          {importMode === 'file' && (
            <div className="space-y-3">
              {uploadedFileInfo ? (
                /* Loaded File Info Card */
                <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {uploadedFileInfo.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                            {uploadedFileInfo.type === 'excel'
                              ? `Excel .${uploadedFileInfo.extension}`
                              : 'CSV File'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Size: {formatFileSize(uploadedFileInfo.size)} • Records detected:{' '}
                          <strong className="text-emerald-900 font-bold">
                            {uploadedFileInfo.totalRows}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-950 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        Replace File
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClearUploadedFile}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Multi-Worksheet Selector for Excel workbooks */}
                  {uploadedFileInfo.sheetNames && uploadedFileInfo.sheetNames.length > 1 && (
                    <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Layers className="w-4 h-4 text-emerald-700" />
                        <span>Worksheet / Tab:</span>
                      </div>
                      <select
                        value={uploadedFileInfo.selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="text-xs font-semibold bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-emerald-950 focus:ring-1 focus:ring-emerald-600"
                      >
                        {uploadedFileInfo.sheetNames.map((s) => (
                          <option key={s} value={s}>
                            Worksheet: {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-6 border-2 border-dashed rounded-xl transition text-center space-y-3 ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400'
                      : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Upload Microsoft Excel Worksheet or CSV
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Drag and drop your <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> spreadsheet file here, or click to browse.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Microsoft Excel Worksheet (.xlsx)
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                      Excel 97-2003 (.xls)
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                      CSV File (.csv)
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                      Google Sheets Export
                    </span>
                  </div>

                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer transition shadow-xs">
                      <Upload className="w-4 h-4" />
                      Browse Files on Device
                      <input
                        type="file"
                        id="excel-file-upload-input"
                        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Template Download Row */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Need the 34-column Megaworld International standard schema template?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    Download 34-Col Excel Template (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    <FileType className="w-3.5 h-3.5 text-slate-600" />
                    Download 34-Col CSV Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paste Raw CSV / TSV Area */}
          {importMode === 'paste' && (
            <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Paste Spreadsheet Text (CSV or TSV)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Columns: Full Name, Email Address, Nickname, Region, Positions, Registration Date, Status
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 hover:underline"
                >
                  <Download className="w-3 h-3" /> Sample Format
                </button>
              </div>
              <textarea
                value={customCsvText}
                onChange={(e) => setCustomCsvText(e.target.value)}
                placeholder="Full Name,Email Address,Nickname,Region,Positions,Registration Date,Status&#10;Juan Dela Cruz,jdelacruz.global@megaworld-marketing.com,Supremo,Asia Pacific 2,Marketing Associate; Marketing Director,20/01/2026 02:04:53,Approved"
                rows={5}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-blue-900"
              />
            </div>
          )}

          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Total In Source</span>
              <span className="text-lg font-bold text-slate-800">{rawRecords.length}</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <span className="text-[11px] font-medium text-blue-700 block">Eligible (2013+)</span>
              <span className="text-lg font-bold text-blue-950">{validRecordsToProcess.length}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-[11px] font-medium text-emerald-700 block">New Unique IPA Codes</span>
              <span className="text-lg font-bold text-emerald-900">{newAccountsCount}</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-[11px] font-medium text-amber-700 block">Duplicate Checker Matches</span>
              <span className="text-lg font-bold text-amber-900">{duplicateAccountsCount}</span>
            </div>
          </div>

          {/* Position Reference Guide */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Multi-Position Support Active:</strong> If an agent holds Marketing Associate, Senior Marketing Associate, Marketing Manager, Marketing Director, or Marketing Partner, all positions are linked to the account.
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {POSITIONS.map((pos) => (
                <span
                  key={pos}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-amber-300 text-amber-900"
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>

          {/* Records Double-Checker Table */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Pre-Import Verification & Double Checker Table ({filteredRecords.length})
                </h4>
                <span className="text-[11px] text-slate-500">
                  Showing records matching year & duplicate checks
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by email, nickname, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2 px-3">Agent / Email</th>
                      <th className="py-2 px-3">Nickname</th>
                      <th className="py-2 px-3">Date Created</th>
                      <th className="py-2 px-3">Double Checker Status</th>
                      <th className="py-2 px-3">Positions to Add</th>
                      <th className="py-2 px-3">Contract Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No records match the current criteria or filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec, idx) => (
                        <tr
                          key={rec.email + idx}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{rec.email}</div>
                            {rec.fullName && (
                              <div className="text-[11px] text-slate-500">{rec.fullName}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {rec.nickname ? (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                                {rec.nickname}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            {rec.dateCreated || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3">
                            {rec.isDuplicate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-700" />
                                Existing Account ({rec.duplicateAgent?.affiliateCode})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <UserCheck className="w-3 h-3 text-emerald-700" />
                                New Unique IPA Code
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {rec.requestedPositions.map((pos) => (
                                <span
                                  key={pos}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                    rec.isDuplicate && rec.duplicateAgent?.unlockedPositions.includes(pos)
                                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                                      : 'bg-blue-50 text-blue-950 border-blue-200 font-semibold'
                                  }`}
                                >
                                  {pos}
                                  {rec.isDuplicate && rec.duplicateAgent?.unlockedPositions.includes(pos)
                                    ? ' (Held)'
                                    : ' (+Add)'}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            {rec.isDuplicate && rec.duplicateAgent?.currentAccreditationId ? (
                              <span className="font-mono text-blue-900">
                                SAA-AP2-000{idx + 5}
                              </span>
                            ) : (
                              <span className="font-mono text-emerald-700">
                                Auto-Generate
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Authorized Operator:{' '}
            <strong className="text-slate-800">
              {currentUser.fullName} ({currentUserRole})
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-import-agents-btn"
              onClick={handleExecuteImport}
              disabled={isProcessing || validRecordsToProcess.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#002B66] hover:bg-blue-950 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Importing & Generating Codes...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Confirm Import ({validRecordsToProcess.length} Records)
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
