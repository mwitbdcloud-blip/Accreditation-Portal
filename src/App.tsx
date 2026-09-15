import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Users,
  FileCheck,
  Database,
  Award,
  Clock,
  BarChart3,
  ShieldCheck,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Layers,
  FileText,
  User,
  Zap,
} from 'lucide-react';
import {
  AgentProfile,
  AccreditationApplication,
  AccreditationRecord,
  PositionAccessRequest,
  AuditLog,
  NotificationItem,
  SystemSettings,
  Region,
  Position,
  PositionContractTemplate,
} from './types';
import { api } from './services/api';

// Components
import { AuthView } from './components/AuthView';
import { AgentDashboard } from './components/AgentDashboard';
import { AccreditationForm } from './components/AccreditationForm';
import { AdminOverview } from './components/AdminOverview';
import { ApplicationsManager } from './components/ApplicationsManager';
import { AgentsDatabaseView } from './components/AgentsDatabaseView';
import { PositionRequestsView } from './components/PositionRequestsView';
import { ExpiryMonitoringView } from './components/ExpiryMonitoringView';
import { ReportsView } from './components/ReportsView';
import { AuditTrailView } from './components/AuditTrailView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { ContractManagementView } from './components/ContractManagementView';
import { ExternalResourcesView } from './components/ExternalResourcesView';
import { ContractModal } from './components/ContractModal';
import { NotificationsModal } from './components/NotificationsModal';
import { MegaworldLogo } from './components/MegaworldLogo';
import { ProfileEditorModal, ProfileData } from './components/ProfileEditorModal';

export default function App() {
  // Authentication session state
  const [currentUser, setCurrentUser] = useState<{
    role: 'Agent' | 'Staff' | 'Admin';
    email: string;
    affiliateCode?: string;
    displayName: string;
    photoUrl?: string;
  } | null>(null);

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Application Data States
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [applications, setApplications] = useState<AccreditationApplication[]>([]);
  const [accreditations, setAccreditations] = useState<AccreditationRecord[]>([]);
  const [positionRequests, setPositionRequests] = useState<PositionAccessRequest[]>([]);
  const [positionContracts, setPositionContracts] = useState<PositionContractTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    accreditationDurationMonths: 4,
    googleSpreadsheetId: 'International Property Affiliates — Agents Database',
    googleDriveRootFolderId: '0B_MegaWorldAgents_GlobalRoot',
    contractTemplateName: 'Megaworld Sales Agreement Agency',
    reminderIntervalDays: [30, 15, 7, 0],
    emailNotificationsEnabled: true,
    auditRetentionYears: 5,
    maintenanceMode: false,
    sheetsSyncStatus: 'Connected',
  });

  // UI state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Contract Modal Viewer
  const [contractModalData, setContractModalData] = useState<{
    isOpen: boolean;
    application?: AccreditationApplication;
    agent?: AgentProfile;
    contractText?: string;
  }>({
    isOpen: false,
  });

  // Current active agent profile if currentUser is Agent
  const matchedAgent = agents.find(
    (a) =>
      (currentUser?.email && a.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.affiliateCode && a.affiliateCode === currentUser.affiliateCode)
  );

  // If matchedAgent exists, ensure its fullName reflects currentUser.displayName if available
  const currentAgent = matchedAgent
    ? {
        ...matchedAgent,
        fullName: currentUser?.displayName || matchedAgent.fullName,
      }
    : null;

  // Synthesized fallback agent so Agent Dashboard always renders with the registrant's Full Legal Name
  const fallbackAgent: AgentProfile = {
    affiliateCode: currentUser?.affiliateCode || 'IPA-AP2-000001',
    firebaseUserId: 'usr_current',
    fullName: currentUser?.displayName || 'Registered Affiliate',
    email: currentUser?.email || 'agent@megaworld.com',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    role: 'agent',
    registrationDate: new Date().toISOString().split('T')[0],
    accountStatus: 'Active',
    profileCompletion: 25,
    currentAccreditationId: 'acc_001',
    accreditationStatus: 'Pending',
    renewalEligibility: false,
    unlockedPositions: ['Marketing Associate'],
    assignedStaff: 'Elena Ramos (BD Staff)',
  };

  const activeAgent = currentAgent || (currentUser?.role === 'Agent' ? fallbackAgent : null);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all core data
  const loadPortalData = useCallback(async () => {
    try {
      const [agentsData, appsData, posData, logsData, notifsData, settsData, contractsData] = await Promise.all([
        api.getAgents().catch(() => []),
        api.getApplications().catch(() => []),
        api.getPositionRequests().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getNotifications(currentUser?.affiliateCode, currentUser?.role).catch(() => []),
        api.getSettings().catch(() => null),
        api.getPositionContracts().catch(() => []),
      ]);

      setAgents(agentsData);
      setApplications(appsData);
      setPositionRequests(posData);
      setAuditLogs(logsData);
      setNotifications(notifsData);
      if (settsData) setSettings(settsData);
      if (contractsData && contractsData.length > 0) {
        setPositionContracts(contractsData);
      }

      // If current user is an agent, load their specific accreditation history
      if (currentUser?.affiliateCode) {
        const agentDetail = await api.getAgent(currentUser.affiliateCode).catch(() => null);
        if (agentDetail?.accreditations) {
          setAccreditations(agentDetail.accreditations);
        }
      }
    } catch (err) {
      console.error('Failed to load portal data', err);
    }
  }, [currentUser?.affiliateCode, currentUser?.role]);

  const handleContractUpdated = (updated: PositionContractTemplate) => {
    setPositionContracts((prev) => {
      const idx = prev.findIndex((p) => p.position === updated.position);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
  };

  // Initial load
  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Handle Login
  const handleLogin = async (email: string, password = 'password123') => {
    setIsLoadingAuth(true);
    try {
      const res = await api.login(email, password);
      const user = res.user;

      const userRoleStr = (user.role || '').toLowerCase();
      const normalizedRole: 'Agent' | 'Staff' | 'Admin' =
        userRoleStr.includes('admin')
          ? 'Admin'
          : userRoleStr.includes('staff')
          ? 'Staff'
          : 'Agent';

      const displayName =
        user.displayName || user.fullName || (normalizedRole === 'Agent' ? 'Maria Cristina Santos' : normalizedRole);

      setCurrentUser({
        role: normalizedRole,
        email: user.email,
        affiliateCode: user.affiliateCode,
        displayName,
        photoUrl: user.photoUrl,
      });

      setActiveTab(normalizedRole === 'Agent' ? 'dashboard' : 'overview');
      showToast(`Signed in as ${displayName} (${normalizedRole})`);
      await loadPortalData();
    } catch (err: any) {
      showToast(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Handle Registration
  const handleRegister = async (data: {
    fullName: string;
    email: string;
    mobileNumber?: string;
    password?: string;
    region: Region;
    position: Position;
    accreditationStartDate?: string;
    accreditationExpiryDate?: string;
  }) => {
    setIsLoadingAuth(true);
    try {
      const res = await api.register({
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        password: data.password || 'password123',
        region: data.region,
        position: data.position,
        accreditationStartDate: data.accreditationStartDate,
        accreditationExpiryDate: data.accreditationExpiryDate,
      });

      if (res.agent) {
        setAgents((prev) => [res.agent, ...prev.filter((a) => a.affiliateCode !== res.agent.affiliateCode)]);
      }

      setCurrentUser({
        role: 'Agent',
        email: data.email,
        affiliateCode: res.affiliateCode,
        displayName: data.fullName,
      });

      setActiveTab('dashboard');
      showToast(`Welcome! Your permanent Affiliate Code is ${res.affiliateCode}`);
      await loadPortalData();
    } catch (err: any) {
      showToast(err.message || 'Registration failed');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    showToast('Signed out of International Property Affiliates Portal.');
  };

  // Accreditation Form submission
  const handleSubmitAccreditation = async (formData: Partial<AccreditationApplication>) => {
    try {
      const res = await api.submitApplication(formData);
      showToast('Accreditation application submitted for BD Staff review.');

      const legalName =
        formData.personalDetails?.fullName ||
        [
          formData.personalDetails?.firstName,
          formData.personalDetails?.middleName,
          formData.personalDetails?.lastName,
          formData.personalDetails?.suffix,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

      if (legalName) {
        setCurrentUser((prev) => (prev ? { ...prev, displayName: legalName } : prev));
        setAgents((prev) =>
          prev.map((a) =>
            (currentUser?.email && a.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
            (currentUser?.affiliateCode && a.affiliateCode === currentUser.affiliateCode)
              ? { ...a, fullName: legalName }
              : a
          )
        );
      }

      await loadPortalData();
      setActiveTab('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application');
    }
  };

  // Review Application (Approve / Reject / Revision)
  const handleReviewApplication = async (
    id: string,
    action: 'Approve' | 'Reject' | 'Revision Required',
    notes?: string
  ) => {
    try {
      const res = await api.reviewApplication(
        id,
        action,
        currentUser?.displayName || 'BD Staff',
        currentUser?.role || 'Staff',
        notes
      );
      showToast(`Application ${id} marked as ${action}. 4-month accreditation record & contract updated.`);
      await loadPortalData();
    } catch (err: any) {
      showToast(err.message || 'Review failed');
    }
  };

  // Review Position Request
  const handleReviewPositionRequest = async (id: string, action: 'Approve' | 'Reject') => {
    try {
      await api.reviewPositionRequest(id, action, currentUser?.displayName || 'Admin');
      showToast(`Position request ${action.toLowerCase()}d.`);
      await loadPortalData();
    } catch (err: any) {
      showToast(err.message || 'Failed to process request');
    }
  };

  // Fast forward simulation for testing 4-month expiry & auto renewal
  const handleFastForwardTime = async (months: number) => {
    try {
      const res = await api.simulateFastForward(months, currentUser?.affiliateCode);
      showToast(res.message);
      await loadPortalData();
    } catch (err: any) {
      showToast('Simulation failed');
    }
  };

  // Google Sheets Sync
  const handleSyncGoogleSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const res = await api.syncGoogleSheets(currentUser?.displayName);
      showToast(`Synced ${res.recordsSynced} records to Google Spreadsheet.`);
      await loadPortalData();
    } catch (err: any) {
      showToast('Google Sheets sync failed');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Update Agent from Google Sheets View
  const handleUpdateAgent = async (code: string, updatedData: Partial<AgentProfile>) => {
    try {
      await api.updateAgent(code, {
        ...updatedData,
        editorName: currentUser?.displayName,
        editorRole: currentUser?.role,
      });
      showToast(`Updated record for ${code}. Changes synchronized.`);
      await loadPortalData();
    } catch (err: any) {
      showToast('Failed to update agent record');
    }
  };

  // Save Settings
  const handleSaveSettings = async (updated: Partial<SystemSettings>) => {
    try {
      await api.updateSettings(updated);
      showToast('System settings updated and synchronized.');
      await loadPortalData();
    } catch (err: any) {
      showToast('Failed to update settings');
    }
  };

  // Notification actions
  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsRead = async () => {
    for (const notif of notifications) {
      if (!notif.read) await api.markNotificationRead(notif.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Open Contract Modal for Agent
  const handleOpenAgentContract = () => {
    const targetAgent = activeAgent || currentAgent;
    if (!targetAgent) return;
    const latestApproved = applications.find(
      (a) => a.affiliateCode === targetAgent.affiliateCode && a.status === 'Approved'
    ) || applications.find((a) => a.affiliateCode === targetAgent.affiliateCode);

    setContractModalData({
      isOpen: true,
      agent: targetAgent,
      application: latestApproved,
      contractText: latestApproved?.contractUrl,
    });
  };

  // Profile management: Edit full name, email, password, photo profile
  const handleSaveProfile = async (profileData: ProfileData) => {
    try {
      await api.updateProfile(profileData);
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: profileData.fullName,
              email: profileData.email,
              photoUrl: profileData.photoUrl,
            }
          : null
      );
      if (currentUser?.role === 'Agent' && currentUser.affiliateCode) {
        setAgents((prev) =>
          prev.map((a) =>
            a.affiliateCode === currentUser.affiliateCode
              ? { ...a, fullName: profileData.fullName, email: profileData.email }
              : a
          )
        );
      }
      showToast('Profile credentials updated successfully.');
      setIsProfileOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Delete Agent account handler
  const handleDeleteAgent = async (affiliateCode: string) => {
    try {
      await api.deleteAgent(affiliateCode);
      setAgents((prev) => prev.filter((a) => a.affiliateCode !== affiliateCode));
      setApplications((prev) => prev.filter((a) => a.affiliateCode !== affiliateCode));
      showToast(`Agent account ${affiliateCode} deleted successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete agent account');
    }
  };

  // Delete Application handler
  const handleDeleteApplication = async (id: string) => {
    try {
      await api.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast(`Application ${id} deleted successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete application');
    }
  };

  // Switch persona helper for convenient testing
  const handleSwitchPersona = (role: 'Agent' | 'Staff' | 'Admin') => {
    if (role === 'Agent') {
      handleLogin('agent@megaworld.com', 'password123');
    } else if (role === 'Staff') {
      handleLogin('staff@megaworld.com', 'staff123');
    } else {
      handleLogin('admin@megaworld.com', 'admin123');
    }
  };

  // Open Contract Modal for specific App in Admin Table
  const handleOpenContractForApp = (app: AccreditationApplication) => {
    const targetAgent = agents.find((a) => a.affiliateCode === app.affiliateCode);
    setContractModalData({
      isOpen: true,
      agent: targetAgent,
      application: app,
      contractText: app.contractUrl,
    });
  };

  // If not logged in, render the Auth View
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onRegister={handleRegister} isLoading={isLoadingAuth} />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Identity */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-900 text-white rounded-xl shadow-xs flex items-center justify-center">
                <MegaworldLogo variant="emblem-only" theme="dark" size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                    International Property Affiliates
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                    Megaworld
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                  Accreditation Portal
                </p>
              </div>
            </div>

            {/* User Session Info & Action Controls */}
            <div className="flex items-center gap-3">
              {/* Persona Quick Switcher - Hidden from agents for privacy */}
              {currentUser.role === 'Admin' && (
                <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Dev Switch:</span>
                  <button
                    type="button"
                    id="switch-persona-agent"
                    onClick={() => handleSwitchPersona('Agent')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      currentUser.role === 'Agent' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Agent
                  </button>
                  <button
                    type="button"
                    id="switch-persona-staff"
                    onClick={() => handleSwitchPersona('Staff')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      currentUser.role === 'Staff' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    BD Staff
                  </button>
                  <button
                    type="button"
                    id="switch-persona-admin"
                    onClick={() => handleSwitchPersona('Admin')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      currentUser.role === 'Admin' ? 'bg-white shadow-xs text-purple-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              )}

              {/* IPA Code Tag (for Agents) */}
              {activeAgent && (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    IPA Code
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-950">
                    {activeAgent.affiliateCode}
                  </span>
                </div>
              )}

              {/* Role badge */}
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  currentUser.role === 'Admin'
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : currentUser.role === 'Staff'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                {currentUser.role}
              </span>

              {/* Profile Editor Trigger */}
              <button
                type="button"
                id="edit-profile-btn"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition border border-slate-200 text-left cursor-pointer"
                title="Profile Editor: Change photo, name, email, or password"
              >
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-blue-900"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden sm:flex flex-col pr-1">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-blue-900 font-medium hover:underline flex items-center gap-0.5">
                    Edit Profile
                  </span>
                </div>
              </button>

              {/* Notifications Toggle */}
              <button
                type="button"
                id="notifications-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Sign Out */}
              <button
                type="button"
                id="sign-out-btn"
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-1.5 scrollbar-none text-xs">
            {currentUser.role === 'Agent' ? (
              <>
                <button
                  type="button"
                  id="nav-agent-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Home Tab
                </button>

                <button
                  type="button"
                  id="nav-agent-accreditation"
                  onClick={() => setActiveTab('accreditation')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'accreditation'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Accreditation Tab
                </button>

                <button
                  type="button"
                  id="nav-agent-resources"
                  onClick={() => setActiveTab('resources')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'resources'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Affiliate Portals & Resources
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  id="nav-admin-overview"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Overview
                </button>

                <button
                  type="button"
                  id="nav-admin-applications"
                  onClick={() => setActiveTab('applications')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'applications'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" /> Applications Review ({applications.length})
                </button>

                <button
                  type="button"
                  id="nav-admin-contracts"
                  onClick={() => setActiveTab('contractManagement')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'contractManagement'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Contract & SAA Upload
                </button>

                <button
                  type="button"
                  id="nav-admin-database"
                  onClick={() => setActiveTab('agentsDatabase')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'agentsDatabase'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-emerald-500" /> Agents Database (Sheets)
                </button>

                <button
                  type="button"
                  id="nav-admin-positions"
                  onClick={() => setActiveTab('positionRequests')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'positionRequests'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> Position Requests ({positionRequests.filter((p) => p.status === 'Pending').length})
                </button>

                <button
                  type="button"
                  id="nav-admin-monitoring"
                  onClick={() => setActiveTab('accreditationMonitoring')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'accreditationMonitoring'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> 4-Month Expiry Radar
                </button>

                <button
                  type="button"
                  id="nav-admin-reports"
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'reports'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Reports & Analytics
                </button>

                <button
                  type="button"
                  id="nav-admin-audit"
                  onClick={() => setActiveTab('auditTrail')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'auditTrail'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Audit Trail
                </button>

                {currentUser.role === 'Admin' && (
                  <button
                    type="button"
                    id="nav-admin-settings"
                    onClick={() => setActiveTab('systemSettings')}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'systemSettings'
                        ? 'bg-blue-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" /> System Settings
                  </button>
                )}

                <button
                  type="button"
                  id="nav-admin-resources"
                  onClick={() => setActiveTab('resources')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'resources'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> External Portals
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'Agent' ? (
          /* Agent Views */
          <>
            {(activeTab === 'dashboard' || (!['accreditation', 'resources'].includes(activeTab))) && activeAgent && (
              <AgentDashboard
                agent={activeAgent}
                applications={applications.filter((a) => a.affiliateCode === activeAgent.affiliateCode)}
                accreditations={
                  accreditations.length > 0
                    ? accreditations
                    : [
                        {
                          id: activeAgent.currentAccreditationId || 'acc_001',
                          affiliateCode: activeAgent.affiliateCode,
                          applicationType: 'New',
                          position: activeAgent.position,
                          startDate: activeAgent.accreditationStartDate || '2026-06-15',
                          expiryDate: activeAgent.accreditationExpiryDate || '2026-10-15',
                          status: activeAgent.accreditationStatus || 'Active',
                          daysRemaining: 36,
                          approvedBy: activeAgent.assignedStaff || 'Elena Ramos (BD Staff)',
                          approvedDate: activeAgent.accreditationStartDate || '2026-06-15',
                        },
                      ]
                }
                positionContract={positionContracts.find((c) => c.position === activeAgent.position)}
                onNavigateToAccreditation={() => setActiveTab('accreditation')}
                onViewContract={handleOpenAgentContract}
              />
            )}

            {activeTab === 'accreditation' && activeAgent && (
              <AccreditationForm
                agent={activeAgent}
                existingApplication={applications.find((a) => a.affiliateCode === activeAgent.affiliateCode)}
                onSubmit={handleSubmitAccreditation}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'resources' && <ExternalResourcesView />}
          </>
        ) : (
          /* Staff & Admin Views */
          <>
            {activeTab === 'overview' && (
              <AdminOverview
                agents={agents}
                applications={applications}
                settings={settings}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSyncGoogleSheets={handleSyncGoogleSheets}
                onFastForwardTime={handleFastForwardTime}
                isSyncingSheets={isSyncingSheets}
              />
            )}

            {activeTab === 'applications' && (
              <ApplicationsManager
                applications={applications}
                agents={agents}
                onReviewApplication={handleReviewApplication}
                onViewContractForApp={handleOpenContractForApp}
                onDeleteApplication={handleDeleteApplication}
                currentUserRole={currentUser.role}
              />
            )}

            {activeTab === 'agentsDatabase' && (
              <AgentsDatabaseView
                agents={agents}
                settings={settings}
                onSyncGoogleSheets={handleSyncGoogleSheets}
                isSyncingSheets={isSyncingSheets}
                onUpdateAgent={handleUpdateAgent}
                onDeleteAgent={handleDeleteAgent}
                currentUserRole={currentUser.role}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'positionRequests' && (
              <PositionRequestsView
                requests={positionRequests}
                onReviewRequest={handleReviewPositionRequest}
                currentUserRole={currentUser.role}
              />
            )}

            {activeTab === 'accreditationMonitoring' && (
              <ExpiryMonitoringView
                agents={agents}
                accreditations={accreditations}
                settings={settings}
                onFastForwardTime={handleFastForwardTime}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                agents={agents}
                applications={applications}
                onSyncGoogleSheets={handleSyncGoogleSheets}
              />
            )}

            {activeTab === 'contractManagement' && (
              <ContractManagementView
                positionContracts={positionContracts}
                agents={agents}
                currentUser={currentUser}
                onContractUpdated={handleContractUpdated}
                showToast={showToast}
              />
            )}

            {activeTab === 'auditTrail' && <AuditTrailView auditLogs={auditLogs} />}

            {activeTab === 'systemSettings' && (
              <SystemSettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
                currentUserRole={currentUser.role}
              />
            )}

            {activeTab === 'resources' && <ExternalResourcesView />}
          </>
        )}
      </main>

      {/* Contract Viewer Modal */}
      {contractModalData.isOpen && (
        <ContractModal
          isOpen={contractModalData.isOpen}
          onClose={() => setContractModalData({ isOpen: false })}
          application={contractModalData.application}
          agent={contractModalData.agent}
          contractText={contractModalData.contractText}
          positionContract={positionContracts.find(
            (c) =>
              c.position ===
              (contractModalData.application?.position ||
                contractModalData.agent?.position ||
                'Marketing Associate')
          )}
          currentUserRole={currentUser.role}
        />
      )}

      {/* Profile Editor Modal for User Account */}
      {currentUser && (
        <ProfileEditorModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* In-app Notifications Center Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      {/* Portal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Megaworld International — International Property Affiliates Global Portal
          </span>
          <span className="font-mono text-slate-400">
            Engine: Express + Vite • Permanent Affiliate Code Standard (IPA-[Region]-[ID])
          </span>
        </div>
      </footer>
    </div>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-emerald-400 shrink-0"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
