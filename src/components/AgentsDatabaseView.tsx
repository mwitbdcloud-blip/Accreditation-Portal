import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Table,
  ExternalLink,
  Edit2,
  ShieldAlert,
  Database,
  Trash2,
  Users,
  ShieldCheck,
  AlertCircle,
  X,
  UserCheck,
  UserPlus,
  Mail,
  Eye,
  RotateCcw,
  Check,
  Clock,
  Send,
  Shield,
  Copy,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AgentProfile,
  SystemSettings,
  Region,
  Position,
  REGIONS,
  POSITIONS,
  StaffAccount,
  StaffInvitation,
} from '../types';
import { api } from '../services/api';
import { InviteStaffModal } from './InviteStaffModal';
import { ViewDispatchedEmailModal } from './ViewDispatchedEmailModal';
import { GoogleSpreadsheetMonitoring } from './GoogleSpreadsheetMonitoring';
import { ImportAgentsModal } from './ImportAgentsModal';
import { formatDate, formatDateTime } from '../utils/dateFormatter';

interface AgentsDatabaseViewProps {
  agents: AgentProfile[];
  settings: SystemSettings;
  onSyncGoogleSheets: () => void;
  isSyncingSheets: boolean;
  onUpdateAgent: (code: string, updatedData: Partial<AgentProfile>) => void;
  onDeleteAgent?: (code: string, name: string) => Promise<void> | void;
  onRefreshData?: () => void;
  currentUserRole: string;
  currentUser?: {
    fullName: string;
    email: string;
    role: string;
  };
}

export const AgentsDatabaseView: React.FC<AgentsDatabaseViewProps> = ({
  agents,
  settings,
  onSyncGoogleSheets,
  isSyncingSheets,
  onUpdateAgent,
  onDeleteAgent,
  onRefreshData,
  currentUserRole,
  currentUser = {
    fullName: 'Business Development Admin',
    email: 'admin@megaworld.com',
    role: 'Admin',
  },
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'agents' | 'spreadsheet' | 'staff'>('agents');
  const [staffSubtab, setStaffSubtab] = useState<'active' | 'pending'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);

  // Staff and Admin Accounts & Invitations state loaded from backend
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [isLoadingStaffData, setIsLoadingStaffData] = useState(false);

  // Invitation Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [invitationTargetAgent, setInvitationTargetAgent] = useState<AgentProfile | null>(null);
  const [viewingEmailInvitation, setViewingEmailInvitation] = useState<StaffInvitation | null>(null);
  const [notificationToast, setNotificationToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    idOrCode: string;
    fullName: string;
    type: 'agent' | 'staff';
    role?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal fields
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRegion, setEditRegion] = useState<Region>('Asia Pacific 2');
  const [editPosition, setEditPosition] = useState<Position>('Marketing Associate');
  const [editAccountStatus, setEditAccountStatus] = useState<'Active' | 'Suspended' | 'Pending'>('Active');
  const [editAssignedStaff, setEditAssignedStaff] = useState('');

  // Fetch staff accounts & invitations from backend API
  const loadStaffData = async () => {
    setIsLoadingStaffData(true);
    try {
      const [staffData, invData] = await Promise.all([
        api.getStaffAccounts(),
        api.getStaffInvitations(),
      ]);
      setStaffAccounts(staffData);
      setInvitations(invData);
    } catch (e) {
      console.error('Error fetching staff data:', e);
    } finally {
      setIsLoadingStaffData(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  // Filter logic
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'All' || agent.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const filteredStaff = staffAccounts.filter((staff) => {
    return (
      staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.positionTitle && staff.positionTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filteredInvitations = invitations.filter((inv) => {
    return (
      inv.invitationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.positionTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const pendingInvitationsCount = invitations.filter((i) => i.status === 'Pending').length;

  const openEditModal = (agent: AgentProfile) => {
    setEditingAgent(agent);
    setEditFullName(agent.fullName);
    setEditEmail(agent.email);
    setEditRegion(agent.region);
    setEditPosition(agent.position);
    setEditAccountStatus(agent.accountStatus);
    setEditAssignedStaff(agent.assignedStaff || 'Elena Ramos');
  };

  const handleSaveEdit = () => {
    if (!editingAgent) return;
    onUpdateAgent(editingAgent.affiliateCode, {
      fullName: editFullName,
      email: editEmail,
      region: editRegion,
      position: editPosition,
      accountStatus: editAccountStatus,
      assignedStaff: editAssignedStaff,
    });
    setEditingAgent(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'agent') {
        if (onDeleteAgent) {
          await onDeleteAgent(deleteTarget.idOrCode, deleteTarget.fullName);
        }
      } else {
        await api.deleteStaffAccount(deleteTarget.idOrCode, currentUser.fullName, currentUserRole);
        setStaffAccounts((prev) => prev.filter((s) => s.id !== deleteTarget.idOrCode));
        setNotificationToast({
          message: `Staff account ${deleteTarget.idOrCode} for ${deleteTarget.fullName} deleted.`,
          type: 'info',
        });
      }
      setDeleteTarget(null);
    } catch (err: any) {
      alert(`Failed to delete account: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Resend invitation email
  const handleResendInvitation = async (inv: StaffInvitation) => {
    setActionLoadingId(inv.id);
    try {
      await api.resendStaffInvitation(inv.id, currentUser.fullName);
      setNotificationToast({
        message: `Official staff appointment notification email re-sent to ${inv.recipientEmail}.`,
        type: 'success',
      });
      await loadStaffData();
    } catch (err: any) {
      setNotificationToast({
        message: err.message || 'Failed to resend invitation email.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Manually accept / activate invitation now
  const handleAcceptInvitation = async (inv: StaffInvitation) => {
    setActionLoadingId(inv.id);
    try {
      const res = await api.acceptStaffInvitation(inv.id, currentUser.fullName);
      setNotificationToast({
        message: `Activated ${res.staffAccount.role} account (${res.staffAccount.id}) for ${inv.recipientName}.`,
        type: 'success',
      });
      await loadStaffData();
      setStaffSubtab('active');
    } catch (err: any) {
      setNotificationToast({
        message: err.message || 'Failed to activate invitation.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Revoke invitation
  const handleRevokeInvitation = async (inv: StaffInvitation) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke the staff invitation for ${inv.recipientName} (${inv.recipientEmail})?`
      )
    ) {
      return;
    }

    setActionLoadingId(inv.id);
    try {
      await api.revokeStaffInvitation(inv.id, currentUser.fullName);
      setNotificationToast({
        message: `Staff invitation for ${inv.recipientName} has been revoked.`,
        type: 'info',
      });
      await loadStaffData();
    } catch (err: any) {
      setNotificationToast({
        message: err.message || 'Failed to revoke invitation.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Export to CSV matching the Google Sheets 19-column schema
  const handleExportCSV = () => {
    const headers = [
      'Affiliate Code',
      'Full Name',
      'Email Address',
      'Region',
      'Position',
      'Registration Date',
      'Account Status',
      'Accreditation Status',
      'Accreditation Start Date',
      'Accreditation Expiry Date',
      'Last Accreditation Date',
      'Application Type',
      'Application Status',
      'Approval Status',
      'Profile Completion',
      'ID Verification Status',
      'Contract Status',
      'Renewal Eligibility',
      'Last Updated',
      'Firebase User ID',
    ];

    const rows = agents.map((a) => [
      a.affiliateCode,
      `"${a.fullName.replace(/"/g, '""')}"`,
      a.email,
      `"${a.region}"`,
      `"${a.position}"`,
      formatDate(a.registrationDate),
      a.accountStatus,
      a.accreditationStatus,
      formatDate(a.accreditationStartDate) || 'N/A',
      formatDate(a.accreditationExpiryDate) || 'N/A',
      formatDate(a.lastAccreditationDate) || 'N/A',
      a.accreditationStatus === 'Expired' ? 'Renewal' : 'New',
      a.accreditationStatus === 'Active' ? 'Approved' : a.accreditationStatus,
      a.accreditationStatus === 'Active' ? 'Approved' : 'Pending',
      `${a.profileCompletion}%`,
      a.accreditationStatus === 'Active' ? 'Verified' : 'Pending',
      a.accreditationStatus === 'Active' ? 'Generated' : 'Pending',
      a.renewalEligibility ? 'Eligible' : 'Not Eligible',
      formatDateTime(new Date().toISOString()),
      a.firebaseUserId,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Megaworld_Agents_Database_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationToast && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition animate-fade-in ${
            notificationToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notificationToast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{notificationToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-slate-400 hover:text-slate-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-bold text-slate-900">
                Personnel & Agents Database System
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Synchronized with Google Sheets • Bi-directional database of affiliate agents, staff roles, and official appointment invitations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Import Button: Accessible ONLY by Staff and Admin */}
            {(currentUserRole?.toLowerCase() === 'admin' ||
              currentUserRole?.toLowerCase() === 'staff' ||
              currentUser.role?.toLowerCase() === 'admin' ||
              currentUser.role?.toLowerCase() === 'staff') && (
              <button
                type="button"
                id="import-agents-spreadsheet-btn"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                Import from Google Spreadsheet
              </button>
            )}

            {/* Admin Invite Button */}
            {currentUserRole === 'Admin' && (
              <button
                type="button"
                id="invite-staff-btn"
                onClick={() => {
                  setInvitationTargetAgent(null);
                  setIsInviteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#002B66] hover:bg-blue-950 rounded-lg shadow-xs transition"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                Invite Member to Staff & Grant Role
              </button>
            )}

            <button
              type="button"
              id="sync-sheets-btn"
              onClick={onSyncGoogleSheets}
              disabled={isSyncingSheets}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-950 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              {isSyncingSheets ? 'Syncing...' : 'Sync with Google Sheets'}
            </button>

            <button
              type="button"
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" /> Export to CSV / Sheets
            </button>
          </div>
        </div>

        {/* Sync status ribbon */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Connected Sheet ID: <strong>{settings.googleSpreadsheetId}</strong> • Status:{' '}
              <strong className="uppercase">{settings.sheetsSyncStatus}</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-800">
            Last Synced: {settings.lastSheetsSyncTimestamp ? formatDateTime(settings.lastSheetsSyncTimestamp) : 'Just now'}
          </span>
        </div>

        {/* Primary Subtabs: Agents Database vs Google Spreadsheet vs Admin & Staff Accounts */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubtab('agents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubtab === 'agents'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Affiliate Agents ({agents.length})
          </button>
          <button
            type="button"
            id="tab-spreadsheet-btn"
            onClick={() => setActiveSubtab('spreadsheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubtab === 'spreadsheet'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Google Spreadsheet Monitor
          </button>
          <button
            type="button"
            onClick={() => setActiveSubtab('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubtab === 'staff'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin & Staff Accounts ({staffAccounts.length})
            {pendingInvitationsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold text-[10px] rounded-full">
                {pendingInvitationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Staff sub-navigation tabs (Active Staff vs Pending Invitations) */}
        {activeSubtab === 'staff' && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setStaffSubtab('active')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  staffSubtab === 'active'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Active Staff & Admins ({staffAccounts.length})
              </button>
              <button
                type="button"
                onClick={() => setStaffSubtab('pending')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  staffSubtab === 'pending'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" /> Pending Invitations ({pendingInvitationsCount})
                {pendingInvitationsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              {staffSubtab === 'pending' ? (
                <span>Manage dispatched invitations sent to member registered emails</span>
              ) : (
                <span>Manage active staff accounts, roles, and administrative permissions</span>
              )}
            </div>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeSubtab === 'agents'
                  ? 'Search by Code (e.g. IPA-AP2-000001) or Name...'
                  : staffSubtab === 'pending'
                  ? 'Search invitation code, member name, or email...'
                  : 'Search by Name, ID, or Email...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          {activeSubtab === 'agents' ? (
            <div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-700"
              >
                <option value="All">Filter by Region/Territory</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center text-xs text-slate-500">
              <UserCheck className="w-3.5 h-3.5 text-blue-900 mr-1.5" />
              <span>
                {staffSubtab === 'pending'
                  ? 'Invitations delivered via official Megaworld mail'
                  : 'Full administrator & staff management'}
              </span>
            </div>
          )}

          <div className="text-right flex items-center justify-end text-xs text-slate-500">
            <span>
              {activeSubtab === 'agents'
                ? `${filteredAgents.length} Agents Registered`
                : staffSubtab === 'pending'
                ? `${filteredInvitations.length} Staff Invitations`
                : `${filteredStaff.length} Admin & Staff Accounts`}
            </span>
          </div>
        </div>
      </div>

      {/* Main View Switching */}
      {activeSubtab === 'agents' ? (
        /* Spreadsheet Replica Grid */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Affiliate Code</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Full Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Email Address</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Region</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Position</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Reg. Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Account Status</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Accreditation Status</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Start Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Expiry Date (4 Mo)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Renewal Eligibility</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredAgents.map((agent, index) => {
                  const isActive = agent.accreditationStatus === 'Active';
                  const isExpiring = agent.accreditationStatus === 'Expiring Soon';
                  const isExpired = agent.accreditationStatus === 'Expired';

                  return (
                    <tr key={agent.affiliateCode} className="hover:bg-blue-50/40 transition">
                      <td className="py-2 px-3 border-r border-slate-100 text-slate-400">{index + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-100 font-bold text-blue-950">
                        {agent.affiliateCode}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans font-semibold text-slate-900">
                        {agent.fullName}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans text-slate-600">
                        {agent.email}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans text-slate-700">
                        {agent.region}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans text-slate-700">
                        {agent.position}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 text-slate-500">
                        {formatDate(agent.registrationDate)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <span className="text-emerald-700 font-semibold">{agent.accountStatus}</span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : isExpiring
                              ? 'bg-amber-100 text-amber-800'
                              : isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {agent.accreditationStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 text-slate-700">
                        {formatDate(agent.accreditationStartDate) || '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 text-slate-700 font-semibold">
                        {formatDate(agent.accreditationExpiryDate) || '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        {agent.renewalEligibility ? (
                          <span className="text-emerald-700 font-bold">Eligible</span>
                        ) : (
                          <span className="text-slate-400">Locked</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-2">
                          {/* Admin Invite Member to Staff */}
                          {currentUserRole === 'Admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                setInvitationTargetAgent(agent);
                                setIsInviteModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                              title="Invite this member to become Staff & Grant Role"
                            >
                              <UserPlus className="w-3 h-3 text-emerald-600" />
                              Make Staff
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(agent)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 hover:text-blue-700 hover:underline"
                            title="Edit Agent Details"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                idOrCode: agent.affiliateCode,
                                fullName: agent.fullName,
                                type: 'agent',
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 hover:underline"
                            title="Delete Agent Account"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : staffSubtab === 'pending' ? (
        /* Pending Invitations Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200">Invitation Token</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Invited Member</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Registered Email (Dispatched)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Role & Title</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Department</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Dispatched Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                      No staff invitations found. Click "Invite Member to Staff & Grant Role" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-2 px-3 border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-950 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {inv.invitationCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCode(inv.invitationCode, inv.id)}
                            className="text-slate-400 hover:text-blue-900"
                            title="Copy Invitation Code"
                          >
                            {copiedCodeId === inv.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <div className="font-semibold text-slate-900">{inv.recipientName}</div>
                        {inv.affiliateCode && (
                          <div className="text-[10px] text-slate-400 font-mono">{inv.affiliateCode}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-blue-900 shrink-0" />
                          <span>{inv.recipientEmail}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Delivered via Megaworld Mail
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.role === 'Admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {inv.role}
                        </span>
                        <div className="text-[10px] text-slate-600 mt-0.5">{inv.positionTitle}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans text-slate-700">
                        {inv.department}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 text-slate-500 font-sans text-[10px]">
                        <div>{formatDate(inv.createdAt)}</div>
                        <div className="text-slate-400">By {inv.invitedBy}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'Revoked'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Email Transcript */}
                          <button
                            type="button"
                            onClick={() => setViewingEmailInvitation(inv)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 hover:text-blue-700 hover:underline px-1.5 py-1 rounded hover:bg-blue-50"
                            title="View Dispatched Email Notification Transcript"
                          >
                            <Eye className="w-3 h-3" /> View Email
                          </button>

                          {/* Resend Email */}
                          {inv.status === 'Pending' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === inv.id}
                              onClick={() => handleResendInvitation(inv)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-900 hover:underline px-1.5 py-1 rounded hover:bg-amber-50 disabled:opacity-50"
                              title="Resend email notification to recipient"
                            >
                              <RotateCcw className={`w-3 h-3 ${actionLoadingId === inv.id ? 'animate-spin' : ''}`} />
                              Resend
                            </button>
                          )}

                          {/* Manual Activate */}
                          {inv.status === 'Pending' && currentUserRole === 'Admin' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === inv.id}
                              onClick={() => handleAcceptInvitation(inv)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline px-1.5 py-1 rounded hover:bg-emerald-50 disabled:opacity-50"
                              title="Activate member as Staff immediately"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              Activate Now
                            </button>
                          )}

                          {/* Revoke */}
                          {inv.status === 'Pending' && currentUserRole === 'Admin' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === inv.id}
                              onClick={() => handleRevokeInvitation(inv)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 hover:underline px-1.5 py-1 rounded hover:bg-rose-50 disabled:opacity-50"
                              title="Revoke staff invitation"
                            >
                              <X className="w-3 h-3" /> Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSubtab === 'spreadsheet' ? (
        <GoogleSpreadsheetMonitoring
          agents={agents}
          applications={[]}
          settings={settings}
          staffAccounts={staffAccounts}
          onSyncGoogleSheets={onSyncGoogleSheets}
          isSyncing={isSyncingSheets}
          onOpenImport={() => setIsImportModalOpen(true)}
          currentUserRole={currentUserRole}
        />
      ) : (
        /* Admin & Active Staff Accounts Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200">Account ID</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Official Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Email Address</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">System Role</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Designation & Department</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Granted Privileges</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Status</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Last Login</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                      No admin or staff accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-2 px-3 border-r border-slate-100 font-bold text-blue-950">
                        {staff.id}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans font-semibold text-slate-900">
                        {staff.fullName}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans text-slate-600">
                        {staff.email}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            staff.role === 'Admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {staff.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {staff.positionTitle || (staff.role === 'Admin' ? 'Super Administrator' : 'Staff Coordinator')}
                        </div>
                        <div className="text-slate-500 text-[10px]">{staff.department}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {staff.permissions?.canReviewApplications && (
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[9px]">
                              Review Apps
                            </span>
                          )}
                          {staff.permissions?.canManageContracts && (
                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-800 rounded text-[9px]">
                              Contracts
                            </span>
                          )}
                          {staff.permissions?.canEditAgents && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded text-[9px]">
                              Agents DB
                            </span>
                          )}
                          {staff.permissions?.canOverrideAccreditation && (
                            <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 rounded text-[9px]">
                              Overrides
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-sans">
                        <span className="text-emerald-700 font-semibold">{staff.status}</span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 text-slate-500">
                        {staff.lastLogin}
                      </td>
                      <td className="py-2 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-2">
                          {currentUserRole === 'Admin' && staff.id !== 'ADM-001' && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  idOrCode: staff.id,
                                  fullName: staff.fullName,
                                  type: 'staff',
                                  role: staff.role,
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 rounded hover:bg-rose-50 transition"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3 h-3" /> Delete Account
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Agent Record Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold">{editingAgent.affiliateCode}</span>
                <h3 className="font-bold text-base">Edit Agent Record (Staff/Admin)</h3>
              </div>
              <button
                onClick={() => setEditingAgent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Region</label>
                  <select
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value as Region)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Position</label>
                  <select
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value as Position)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editAccountStatus}
                    onChange={(e) => setEditAccountStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Staff Reviewer</label>
                  <input
                    type="text"
                    value={editAssignedStaff}
                    onChange={(e) => setEditAssignedStaff(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAgent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-base">Permanently Delete Account</h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                Are you sure you want to permanently delete the{' '}
                <strong>
                  {deleteTarget.type === 'staff' ? `${deleteTarget.role || 'Staff/Admin'} Account` : 'Agent Account'}
                </strong>{' '}
                for:
              </p>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                <p>
                  Name: <strong className="text-slate-900 font-sans">{deleteTarget.fullName}</strong>
                </p>
                <p>
                  Identifier: <strong className="text-blue-900">{deleteTarget.idOrCode}</strong>
                </p>
                <p>
                  Type: <span className="capitalize">{deleteTarget.type}</span>
                </p>
              </div>

              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                Warning: This action will permanently remove login access and wipe associated records. This action cannot be reversed.
              </p>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : 'Confirm Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInvitationTargetAgent(null);
        }}
        agents={agents}
        preselectedAgent={invitationTargetAgent}
        currentUser={currentUser}
        onInvitationSent={(newInv) => {
          setInvitations((prev) => [newInv, ...prev]);
          setStaffSubtab('pending');
          setNotificationToast({
            message: `Staff invitation successfully dispatched to ${newInv.recipientEmail}.`,
            type: 'success',
          });
        }}
      />

      {/* View Dispatched Email Modal */}
      <ViewDispatchedEmailModal
        isOpen={Boolean(viewingEmailInvitation)}
        onClose={() => setViewingEmailInvitation(null)}
        invitation={viewingEmailInvitation}
      />

      {/* Import Agents Modal (Staff & Admin Only) */}
      <ImportAgentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        agents={agents}
        onImportComplete={(importedAgents, message) => {
          setNotificationToast({
            message,
            type: 'success',
          });
          if (onRefreshData) {
            onRefreshData();
          }
        }}
        currentUserRole={currentUserRole}
        currentUser={currentUser}
        settings={settings}
      />
    </div>
  );
};
