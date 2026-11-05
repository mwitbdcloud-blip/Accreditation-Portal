import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Database,
  Mail,
  Flame,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  FolderOpen,
  FileCheck2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { SystemSettings } from '../types';
import { firebaseConfig } from '../services/firebaseConfig';
import { api } from '../services/api';

interface SystemSettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (updated: Partial<SystemSettings>) => Promise<void> | void;
  currentUserRole: string;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  settings,
  onSaveSettings,
  currentUserRole,
}) => {
  // Safe helper to extract reminder intervals
  const getInitialIntervals = (s?: SystemSettings): string => {
    const list = s?.reminderIntervalsDays || s?.reminderIntervalDays || [30, 15, 7, 0];
    return Array.isArray(list) ? list.join(', ') : '30, 15, 7, 0';
  };

  // State initialization with defensive fallbacks to prevent undefined read crashes
  const [durationMonths, setDurationMonths] = useState<number>(settings?.accreditationDurationMonths || 4);
  const [renewalWindowDays, setRenewalWindowDays] = useState<number>(settings?.renewalWindowDaysBeforeExpiry ?? 30);
  const [reminderDays, setReminderDays] = useState<string>(getInitialIntervals(settings));
  const [autoRenewalUnlock, setAutoRenewalUnlock] = useState<boolean>(settings?.autoRenewalUnlock ?? true);

  const [spreadsheetId, setSpreadsheetId] = useState<string>(settings?.googleSpreadsheetId || 'International Property Affiliates — Agents Database');
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(settings?.googleAppsScriptUrl || '');
  const [driveFolderId, setDriveFolderId] = useState<string>(settings?.googleDriveFolderId || settings?.googleDriveRootFolderId || '0B_MegaWorldAgents_GlobalRoot');
  const [contractTemplateName, setContractTemplateName] = useState<string>(settings?.contractTemplateName || 'Megaworld Sales Agreement Agency');
  const [autoSyncGoogleSheets, setAutoSyncGoogleSheets] = useState<boolean>(settings?.autoSyncGoogleSheets ?? true);

  const [preventDuplicateIdentities, setPreventDuplicateIdentities] = useState<boolean>(settings?.preventDuplicateIdentities ?? true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState<boolean>(settings?.emailNotificationsEnabled ?? true);
  const [auditRetentionYears, setAuditRetentionYears] = useState<number>(settings?.auditRetentionYears ?? 5);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(settings?.maintenanceMode ?? false);

  // Sync state whenever settings prop updates from remote / parent
  useEffect(() => {
    if (settings) {
      setDurationMonths(settings.accreditationDurationMonths || 4);
      setRenewalWindowDays(settings.renewalWindowDaysBeforeExpiry ?? 30);
      setReminderDays(getInitialIntervals(settings));
      setAutoRenewalUnlock(settings.autoRenewalUnlock ?? true);

      setSpreadsheetId(settings.googleSpreadsheetId || 'International Property Affiliates — Agents Database');
      setAppsScriptUrl(settings.googleAppsScriptUrl || '');
      setDriveFolderId(settings.googleDriveFolderId || settings.googleDriveRootFolderId || '0B_MegaWorldAgents_GlobalRoot');
      setContractTemplateName(settings.contractTemplateName || 'Megaworld Sales Agreement Agency');
      setAutoSyncGoogleSheets(settings.autoSyncGoogleSheets ?? true);

      setPreventDuplicateIdentities(settings.preventDuplicateIdentities ?? true);
      setEmailNotificationsEnabled(settings.emailNotificationsEnabled ?? true);
      setAuditRetentionYears(settings.auditRetentionYears ?? 5);
      setMaintenanceMode(settings.maintenanceMode ?? false);
    }
  }, [settings]);

  // Save status & operation states
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sheets sync trigger state
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncResult, setSheetsSyncResult] = useState<string | null>(null);

  // Sample data purge state
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    setSheetsSyncResult(null);
    try {
      const res = await api.syncGoogleSheets('System Administrator (Settings Console)');
      setSheetsSyncResult(res.message || `Successfully synced ${res.recordsSynced} records to Google Spreadsheet.`);
    } catch (err: any) {
      setSheetsSyncResult(err?.message || 'Google Sheets sync request failed.');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handlePurgeSampleData = async () => {
    if (
      !window.confirm(
        'Confirm purge of all sample demo records from database and storage? Only uploaded files from Staff/Admin and real registered agents will remain active.'
      )
    ) {
      return;
    }
    setIsPurging(true);
    setPurgeStatus(null);
    try {
      const res = await api.purgeSampleData('System Administrator', currentUserRole);
      setPurgeStatus(res.message);
    } catch (err: any) {
      setPurgeStatus(err.message || 'Failed to purge sample records.');
    } finally {
      setIsPurging(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setIsSaved(false);

    const parsedIntervals = reminderDays
      .split(',')
      .map((d) => parseInt(d.trim(), 10))
      .filter((n) => !isNaN(n));

    const updatedPayload: Partial<SystemSettings> = {
      accreditationDurationMonths: Number(durationMonths) || 4,
      renewalWindowDaysBeforeExpiry: Number(renewalWindowDays) || 30,
      reminderIntervalsDays: parsedIntervals.length > 0 ? parsedIntervals : [30, 15, 7, 0],
      reminderIntervalDays: parsedIntervals.length > 0 ? parsedIntervals : [30, 15, 7, 0],
      googleSpreadsheetId: spreadsheetId.trim(),
      googleAppsScriptUrl: appsScriptUrl.trim(),
      googleDriveFolderId: driveFolderId.trim(),
      googleDriveRootFolderId: driveFolderId.trim(),
      contractTemplateName: contractTemplateName.trim(),
      autoSyncGoogleSheets,
      autoRenewalUnlock,
      preventDuplicateIdentities,
      emailNotificationsEnabled,
      auditRetentionYears: Number(auditRetentionYears) || 5,
      maintenanceMode,
    };

    try {
      await onSaveSettings(updatedPayload);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save system settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="system-settings-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">System Configuration & Enterprise Integrations</h2>
          </div>
          <p className="text-xs text-slate-500">
            Super-admin parameters controlling the 4-month accreditation lifecycle, Google Workspace connectors, and compliance audit policies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Admin Privileges Active
          </span>
        </div>
      </div>

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System settings updated and synchronized across backend and Firestore cloud database.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Accreditation Lifecycle Engine */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-900" /> 1. Accreditation Lifecycle Engine
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Core Accreditation Policy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Accreditation Term Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enforces the standard 4-month cycle: Expiry Date = Start Date + 4 Months.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Renewal Window (Days Before Expiry)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={renewalWindowDays}
                onChange={(e) => setRenewalWindowDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Agents may begin submitting renewals when within this number of days before expiry (default: 30 days).
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Expiry Reminder Schedules (Days Before Expiry)
              </label>
              <input
                type="text"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="30, 15, 7, 0"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Comma-separated days remaining to dispatch automated notifications to agents and uplines (e.g. 30, 15, 7, 0).
              </p>
            </div>

            <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <label htmlFor="auto-renewal-unlock" className="font-semibold text-slate-800 cursor-pointer block">
                  Automatic Renewal Application Unlock
                </label>
                <p className="text-[11px] text-slate-500">
                  Automatically unlocks the Accreditation Tab for active agents once within the renewal window.
                </p>
              </div>
              <input
                type="checkbox"
                id="auto-renewal-unlock"
                checked={autoRenewalUnlock}
                onChange={(e) => setAutoRenewalUnlock(e.target.checked)}
                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Google Workspace Integrations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" /> 2. Google Workspace & Cloud Connectors
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Sheets, Drive & Docs API</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Sheets Agents Database ID / Name
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Spreadsheet identifier: "International Property Affiliates — Agents Database"
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Apps Script Webhook URL
              </label>
              <input
                type="text"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Deployed Apps Script Webhook endpoint for automated real-time two-way synchronization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Drive Root Documents Folder
                </label>
                <input
                  type="text"
                  value={driveFolderId}
                  onChange={(e) => setDriveFolderId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Root folder ID: /Agents/{'{Region}'}/{'{AffiliateCode}'}/
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contract Template Name
                </label>
                <input
                  type="text"
                  value={contractTemplateName}
                  onChange={(e) => setContractTemplateName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Template: Megaworld Sales Agreement Agency
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <label htmlFor="auto-sync-sheets" className="font-semibold text-slate-800 cursor-pointer block">
                  Automatic Google Sheets Synchronization
                </label>
                <p className="text-[11px] text-slate-500">
                  Automatically sync agent status, accreditation expiry, and profile details to Google Sheets on changes.
                </p>
              </div>
              <input
                type="checkbox"
                id="auto-sync-sheets"
                checked={autoSyncGoogleSheets}
                onChange={(e) => setAutoSyncGoogleSheets(e.target.checked)}
                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900 cursor-pointer"
              />
            </div>

            {/* Live Sheets Sync Trigger Box */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Google Sheets Database Status</span>
                <p className="text-[11px] text-emerald-800">
                  Status: <strong>{settings?.sheetsSyncStatus || 'Synced'}</strong>
                  {settings?.lastSheetsSyncTimestamp && (
                    <span className="ml-2 text-slate-500">
                      • Last synced: {new Date(settings.lastSheetsSyncTimestamp).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSyncSheets}
                disabled={isSyncingSheets}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                {isSyncingSheets ? 'Syncing...' : 'Sync to Google Sheets Now'}
              </button>
            </div>

            {sheetsSyncResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sheetsSyncResult}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Security, Compliance & Identity Protection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" /> 3. Security, Identity Protection & Compliance
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Enterprise Hardening</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <label htmlFor="prevent-dup-toggle" className="font-semibold text-slate-800 cursor-pointer block">
                  Prevent Duplicate Identities (TIN & Govt IDs)
                </label>
                <p className="text-[11px] text-slate-500">
                  Enforces uniqueness across Tax Identification Numbers (TIN) to block duplicate agent registrations.
                </p>
              </div>
              <input
                type="checkbox"
                id="prevent-dup-toggle"
                checked={preventDuplicateIdentities}
                onChange={(e) => setPreventDuplicateIdentities(e.target.checked)}
                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900 cursor-pointer shrink-0 ml-3"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <label htmlFor="email-notif-toggle" className="font-semibold text-slate-800 cursor-pointer block">
                  Automated Email Notifications (Gmail API)
                </label>
                <p className="text-[11px] text-slate-500">
                  Sends automated notifications for accreditation approvals, revision requests, and expiry reminders.
                </p>
              </div>
              <input
                type="checkbox"
                id="email-notif-toggle"
                checked={emailNotificationsEnabled}
                onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900 cursor-pointer shrink-0 ml-3"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Audit Trail Retention Policy (Years)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={auditRetentionYears}
                onChange={(e) => setAuditRetentionYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Standard compliance archive period for security logs and transaction audits.
              </p>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              maintenanceMode ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <label htmlFor="maintenance-mode-toggle" className="font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  System Maintenance Mode
                </label>
                <p className="text-[11px] text-slate-500">
                  When enabled, displays scheduled maintenance banner and prevents non-admin modifications.
                </p>
              </div>
              <input
                type="checkbox"
                id="maintenance-mode-toggle"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-600 cursor-pointer shrink-0 ml-3"
              />
            </div>
          </div>
        </div>

        {/* 4. Firebase Cloud Infrastructure */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> 4. Firebase Cloud Infrastructure & Firestore
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Provisioned & Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Firebase Project ID</span>
              <p className="font-mono font-bold text-slate-800">{firebaseConfig.projectId || 'ai-studio-internationalpro-ea982487-c8e2-4a99-91a0-0087fa7a1970'}</p>
              <p className="text-[11px] text-slate-500">Cloud Region: asia-southeast1 (Singapore)</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Firestore Database ID</span>
              <p className="font-mono font-bold text-slate-800 text-[11px] truncate">{firebaseConfig.firestoreDatabaseId || 'default'}</p>
              <p className="text-[11px] text-slate-500">Security Rules: Hardened Multi-Role RBAC</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Authentication Services</span>
              <p className="font-semibold text-slate-800">Email/Password & Google Identity Services</p>
              <p className="text-[11px] text-slate-500">Domain: {firebaseConfig.authDomain}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Cloud Storage Bucket</span>
              <p className="font-mono font-bold text-slate-800">{firebaseConfig.storageBucket || 'ai-studio-internationalpro-ea982487-c8e2-4a99-91a0-0087fa7a1970.firebasestorage.app'}</p>
              <p className="text-[11px] text-slate-500">Secure storage for Govt IDs, Passports & SAA PDFs</p>
            </div>
          </div>
        </div>

        {/* 5. Published Data Hygiene & Sample Records Policy */}
        <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-900 text-white rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">5. Published Website Data Policy</h3>
                <p className="text-xs text-slate-500">
                  Ensures only real uploaded files from Staff/Admin and genuine registered agents reflect on the live portal.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              Clean Published Mode Active
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              <strong>Data Isolation Rule:</strong> On the published website, mock sample data is automatically suppressed so new agents are never confused by simulated demo profiles. The registry only displays agent profiles and accreditation documents uploaded directly by Staff or Admin, and self-registered agents.
            </p>
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <span className="text-slate-500 text-[11px]">
                Need to purge lingering local or cloud demo records from prior sessions?
              </span>
              <button
                type="button"
                onClick={handlePurgeSampleData}
                disabled={isPurging}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isPurging ? 'Purging...' : 'Purge All Sample / Demo Data'}
              </button>
            </div>
            {purgeStatus && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{purgeStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved & Synced Successfully
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            id="save-settings-btn"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save System Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
