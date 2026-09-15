import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, CheckCircle2, Database, Mail, FileText } from 'lucide-react';
import { SystemSettings } from '../types';

interface SystemSettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (updated: Partial<SystemSettings>) => void;
  currentUserRole: string;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  settings,
  onSaveSettings,
  currentUserRole,
}) => {
  const [durationMonths, setDurationMonths] = useState(settings.accreditationDurationMonths);
  const [spreadsheetId, setSpreadsheetId] = useState(settings.googleSpreadsheetId);
  const [driveFolderId, setDriveFolderId] = useState(settings.googleDriveRootFolderId);
  const [contractTemplateName, setContractTemplateName] = useState(settings.contractTemplateName);
  const [reminderDays, setReminderDays] = useState(settings.reminderIntervalDays.join(', '));
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(settings.emailNotificationsEnabled);
  const [auditRetentionYears, setAuditRetentionYears] = useState(settings.auditRetentionYears);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIntervals = reminderDays
      .split(',')
      .map((d) => parseInt(d.trim(), 10))
      .filter((n) => !isNaN(n));

    onSaveSettings({
      accreditationDurationMonths: Number(durationMonths),
      googleSpreadsheetId: spreadsheetId,
      googleDriveRootFolderId: driveFolderId,
      contractTemplateName,
      reminderIntervalDays: parsedIntervals,
      emailNotificationsEnabled,
      auditRetentionYears: Number(auditRetentionYears),
      maintenanceMode,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div id="system-settings-view" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
            <Settings className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold text-slate-900">System Configuration & Enterprise Integrations</h2>
        </div>
        <p className="text-xs text-slate-500">
          Super-admin parameters controlling the 4-month accreditation lifecycle, Google Workspace connectors, and compliance audit policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Accreditation Policy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-900" /> Accreditation Lifecycle Engine
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Accreditation Term Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                max="12"
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
                Expiry Reminder Schedules (Days Before Expiry)
              </label>
              <input
                type="text"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="30, 15, 7, 0"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Comma-separated days remaining to dispatch automated notifications.</p>
            </div>
          </div>
        </div>

        {/* Google Workspace Integrations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" /> Phase 2: Google Workspace Connectors
          </h3>

          <div className="space-y-3 text-xs">
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
              <p className="text-[11px] text-slate-400 mt-1">Spreadsheet filename: "International Property Affiliates — Agents Database"</p>
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
                <p className="text-[11px] text-slate-400 mt-1">Folder hierarchy: /Agents/{'{Region}'}/{'{AffiliateCode}'}/</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Docs Contract Template
                </label>
                <input
                  type="text"
                  value={contractTemplateName}
                  onChange={(e) => setContractTemplateName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Template: Megaworld Sales Agreement Agency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Compliance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-700" /> Notifications & Compliance Retention
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="email-notif-toggle"
                checked={emailNotificationsEnabled}
                onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900"
              />
              <label htmlFor="email-notif-toggle" className="font-semibold text-slate-800 cursor-pointer">
                Enable Automated Email Notifications (Gmail API)
              </label>
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
            </div>
          </div>
        </div>

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
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
