import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  Layers,
  ChevronDown,
  Table,
  Copy,
  Check,
  Upload,
} from 'lucide-react';
import { AgentProfile, AccreditationApplication, SystemSettings, StaffAccount } from '../types';
import { formatDate, formatDateTime } from '../utils/dateFormatter';

interface GoogleSpreadsheetMonitoringProps {
  agents: AgentProfile[];
  applications: AccreditationApplication[];
  settings: SystemSettings;
  staffAccounts: StaffAccount[];
  onSyncGoogleSheets: () => void;
  isSyncing: boolean;
  onOpenImport?: () => void;
  currentUserRole?: string;
}

type SheetTab = 'all_agents' | 'active_accreditations' | 'expiry_monitoring' | 'pending_applications' | 'staff_roles';

export const GoogleSpreadsheetMonitoring: React.FC<GoogleSpreadsheetMonitoringProps> = ({
  agents,
  applications,
  settings,
  staffAccounts,
  onSyncGoogleSheets,
  isSyncing,
  onOpenImport,
  currentUserRole = 'Admin',
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<SheetTab>('all_agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: string } | null>({
    row: 2,
    col: 'B',
    val: agents[0]?.fullName || 'Full Legal Name',
  });
  const [copiedCell, setCopiedCell] = useState(false);

  const googleSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/${settings.googleSpreadsheetId}/edit`;

  // Filtered rows according to active sheet tab
  const getRows = () => {
    let list = [...agents];
    if (activeSheetTab === 'active_accreditations') {
      list = list.filter((a) => a.accreditationStatus === 'Active');
    } else if (activeSheetTab === 'expiry_monitoring') {
      list = list.filter((a) => a.accreditationStatus === 'Expiring Soon' || a.accreditationStatus === 'Expired');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.affiliateCode.toLowerCase().includes(q) ||
          a.fullName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q) ||
          a.position.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const rows = getRows();

  const handleCellClick = (rowIdx: number, colLetter: string, value: string) => {
    setSelectedCell({
      row: rowIdx + 2, // 1 is header
      col: colLetter,
      val: value,
    });
  };

  const handleCopyCell = () => {
    if (!selectedCell) return;
    navigator.clipboard.writeText(selectedCell.val);
    setCopiedCell(true);
    setTimeout(() => setCopiedCell(false), 2000);
  };

  const columns = [
    { letter: 'A', label: 'Affiliate Code', width: 'w-36' },
    { letter: 'B', label: 'Full Legal Name', width: 'w-56' },
    { letter: 'C', label: 'Email Address', width: 'w-56' },
    { letter: 'D', label: 'Region/Territory', width: 'w-44' },
    { letter: 'E', label: 'Position Tier', width: 'w-44' },
    { letter: 'F', label: 'Registration Date', width: 'w-40' },
    { letter: 'G', label: 'Account Status', width: 'w-32' },
    { letter: 'H', label: 'Accreditation Status', width: 'w-40' },
    { letter: 'I', label: 'Accreditation Start Date', width: 'w-44' },
    { letter: 'J', label: 'Accreditation Expiry Date', width: 'w-44' },
    { letter: 'K', label: 'Term Duration', width: 'w-32' },
    { letter: 'L', label: 'Profile %', width: 'w-24' },
    { letter: 'M', label: 'Renewal Eligibility', width: 'w-36' },
    { letter: 'N', label: 'Assigned BD Staff', width: 'w-44' },
  ];

  const exportSpreadsheetCSV = () => {
    const headers = columns.map((c) => c.label);
    const csvRows = agents.map((a) => [
      a.affiliateCode,
      `"${a.fullName.replace(/"/g, '""')}"`,
      a.email,
      `"${a.region}"`,
      `"${a.position}"`,
      `"${formatDate(a.registrationDate)}"`,
      a.accountStatus,
      a.accreditationStatus,
      `"${formatDate(a.accreditationStartDate)}"`,
      `"${formatDate(a.accreditationExpiryDate)}"`,
      '4 Months',
      `${a.profileCompletion}%`,
      a.renewalEligibility ? 'Eligible' : 'Not Eligible',
      `"${a.assignedStaff || 'Elena Ramos (BD Staff)'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Megaworld_IPA_Database_Spreadsheet_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      {/* Google Sheets Inspired Header Bar */}
      <div className="bg-[#0F9D58] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center border border-white/30 text-white shadow-inner">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight">
                Megaworld International — Personnel & Agents Database Monitoring
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-medium">
                Live Google Sheets
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-emerald-100 mt-0.5">
              <span>Sheet ID: <strong className="font-mono text-white">{settings.googleSpreadsheetId}</strong></span>
              <span>•</span>
              <span>Sync: <strong className="uppercase text-white">{settings.sheetsSyncStatus}</strong></span>
              <span>•</span>
              <span>Last Synced: {settings.lastSheetsSyncTimestamp ? formatDateTime(settings.lastSheetsSyncTimestamp) : 'Live Connected'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {(currentUserRole?.toLowerCase() === 'admin' || currentUserRole?.toLowerCase() === 'staff') && onOpenImport && (
            <button
              type="button"
              id="monitoring-import-agents-btn"
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg font-bold text-xs shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Agents (2013-Present)
            </button>
          )}

          <a
            href={googleSpreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg font-bold text-xs shadow-xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Google Sheets
          </a>

          <button
            type="button"
            onClick={onSyncGoogleSheets}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>

          <button
            type="button"
            onClick={exportSpreadsheetCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download .CSV
          </button>
        </div>
      </div>

      {/* Spreadsheet Formula Bar & Search */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          {/* Cell Coordinate Box */}
          <div className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-center text-slate-800 text-xs shadow-inner">
            {selectedCell ? `${selectedCell.col}${selectedCell.row}` : 'A1'}
          </div>
          <span className="font-mono text-slate-400 font-bold">fx</span>
          {/* Formula / Value Input */}
          <div className="flex-1 flex items-center bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-mono text-xs">
            <span className="truncate flex-1">
              {selectedCell?.val || '=QUERY(Agents_DB!A2:N, "SELECT A, B, C, D, E WHERE H = \'Active\'")'}
            </span>
            {selectedCell && (
              <button
                type="button"
                onClick={handleCopyCell}
                className="ml-2 text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[10px]"
                title="Copy Cell Value"
              >
                {copiedCell ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedCell ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        {/* In-Spreadsheet Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search spreadsheet cells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Spreadsheet Grid View */}
      <div className="overflow-x-auto max-h-[500px] select-text">
        <table className="w-full text-left border-collapse font-sans text-xs">
          {/* Column Header Letters: A, B, C, D... */}
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 border-b border-slate-300 font-mono text-[11px]">
            <tr>
              <th className="w-10 py-1.5 px-2 text-center bg-slate-200 border-r border-b border-slate-300 font-medium text-slate-500">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.letter}
                  className={`${col.width} py-1.5 px-3 border-r border-b border-slate-300 font-semibold text-slate-700 bg-slate-100`}
                >
                  <div className="flex items-center justify-between">
                    <span>{col.letter}</span>
                    <span className="font-sans font-normal text-[10px] text-slate-400 truncate max-w-[120px]">
                      {col.label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Data Rows */}
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-slate-400 font-mono">
                  No matching cells found in Google Spreadsheet.
                </td>
              </tr>
            ) : (
              rows.map((agent, rIdx) => {
                const rowNum = rIdx + 2;
                const isSelectedRow = selectedCell?.row === rowNum;

                return (
                  <tr
                    key={agent.affiliateCode}
                    className={`hover:bg-emerald-50/40 transition ${
                      isSelectedRow ? 'bg-emerald-50/70' : ''
                    }`}
                  >
                    {/* Row Number */}
                    <td className="py-2 px-2 text-center bg-slate-100 border-r border-slate-200 font-mono text-[10px] text-slate-500 font-medium select-none">
                      {rowNum}
                    </td>

                    {/* Col A: Affiliate Code */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'A', agent.affiliateCode)}
                      className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-blue-950 cursor-pointer"
                    >
                      {agent.affiliateCode}
                    </td>

                    {/* Col B: Full Legal Name */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'B', agent.fullName)}
                      className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900 cursor-pointer truncate"
                    >
                      {agent.fullName}
                    </td>

                    {/* Col C: Email */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'C', agent.email)}
                      className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px] cursor-pointer truncate"
                    >
                      {agent.email}
                    </td>

                    {/* Col D: Region */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'D', agent.region)}
                      className="py-2 px-3 border-r border-slate-200 text-slate-700 cursor-pointer"
                    >
                      {agent.region}
                    </td>

                    {/* Col E: Position */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'E', agent.position)}
                      className="py-2 px-3 border-r border-slate-200 text-slate-800 font-medium cursor-pointer"
                    >
                      {agent.position}
                    </td>

                    {/* Col F: Registration Date */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'F', formatDate(agent.registrationDate))}
                      className="py-2 px-3 border-r border-slate-200 text-slate-600 cursor-pointer whitespace-nowrap"
                    >
                      {formatDate(agent.registrationDate)}
                    </td>

                    {/* Col G: Account Status */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'G', agent.accountStatus)}
                      className="py-2 px-3 border-r border-slate-200 text-center cursor-pointer"
                    >
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {agent.accountStatus}
                      </span>
                    </td>

                    {/* Col H: Accreditation Status */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'H', agent.accreditationStatus)}
                      className="py-2 px-3 border-r border-slate-200 cursor-pointer"
                    >
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          agent.accreditationStatus === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : agent.accreditationStatus === 'Expiring Soon'
                            ? 'bg-amber-100 text-amber-800'
                            : agent.accreditationStatus === 'Expired'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {agent.accreditationStatus}
                      </span>
                    </td>

                    {/* Col I: Start Date */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'I', formatDate(agent.accreditationStartDate))}
                      className="py-2 px-3 border-r border-slate-200 text-slate-600 cursor-pointer whitespace-nowrap"
                    >
                      {formatDate(agent.accreditationStartDate)}
                    </td>

                    {/* Col J: Expiry Date */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'J', formatDate(agent.accreditationExpiryDate))}
                      className="py-2 px-3 border-r border-slate-200 text-slate-800 font-semibold cursor-pointer whitespace-nowrap"
                    >
                      {formatDate(agent.accreditationExpiryDate)}
                    </td>

                    {/* Col K: Duration */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'K', '4 Months')}
                      className="py-2 px-3 border-r border-slate-200 text-slate-500 cursor-pointer"
                    >
                      4 Months
                    </td>

                    {/* Col L: Profile % */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'L', `${agent.profileCompletion}%`)}
                      className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-700 cursor-pointer"
                    >
                      {agent.profileCompletion}%
                    </td>

                    {/* Col M: Renewal Eligibility */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'M', agent.renewalEligibility ? 'Eligible' : 'Locked')}
                      className="py-2 px-3 border-r border-slate-200 cursor-pointer"
                    >
                      {agent.renewalEligibility ? (
                        <span className="text-emerald-700 font-bold">Eligible</span>
                      ) : (
                        <span className="text-slate-400">Locked</span>
                      )}
                    </td>

                    {/* Col N: Assigned BD Staff */}
                    <td
                      onClick={() => handleCellClick(rIdx, 'N', agent.assignedStaff || 'Elena Ramos (BD Staff)')}
                      className="py-2 px-3 border-r border-slate-200 text-slate-600 cursor-pointer truncate"
                    >
                      {agent.assignedStaff || 'Elena Ramos (BD Staff)'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Bottom Sheet Tabs (Like Google Sheets Tabs) */}
      <div className="bg-slate-100 border-t border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSheetTab('all_agents')}
            className={`px-3 py-1.5 rounded-t font-semibold text-xs flex items-center gap-1.5 border-t-2 transition ${
              activeSheetTab === 'all_agents'
                ? 'bg-white border-emerald-600 text-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            All Agents Database ({agents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('active_accreditations')}
            className={`px-3 py-1.5 rounded-t font-semibold text-xs flex items-center gap-1.5 border-t-2 transition ${
              activeSheetTab === 'active_accreditations'
                ? 'bg-white border-emerald-600 text-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active Accreditations ({agents.filter((a) => a.accreditationStatus === 'Active').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('expiry_monitoring')}
            className={`px-3 py-1.5 rounded-t font-semibold text-xs flex items-center gap-1.5 border-t-2 transition ${
              activeSheetTab === 'expiry_monitoring'
                ? 'bg-white border-amber-500 text-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            4-Month Expiry Queue ({agents.filter((a) => a.accreditationStatus === 'Expiring Soon' || a.accreditationStatus === 'Expired').length})
          </button>
        </div>

        {/* Quick Calculation Summary Bar */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span>COUNT: <strong className="text-slate-800">{rows.length}</strong></span>
          <span>ACTIVE: <strong className="text-emerald-700">{agents.filter((a) => a.accreditationStatus === 'Active').length}</strong></span>
          <span>EXPIRING: <strong className="text-amber-700">{agents.filter((a) => a.accreditationStatus === 'Expiring Soon').length}</strong></span>
        </div>
      </div>
    </div>
  );
};
