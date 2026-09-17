import React, { useState } from 'react';
import {
  AgentProfile,
  StaffPermissions,
  StaffInvitation,
} from '../types';
import {
  Mail,
  ShieldCheck,
  UserPlus,
  Building,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Eye,
  Send,
  X,
  User,
  ExternalLink,
} from 'lucide-react';
import { MegaworldLogo } from './MegaworldLogo';
import { formatDateTime } from '../utils/dateFormatter';
import { api } from '../services/api';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentProfile[];
  preselectedAgent?: AgentProfile | null;
  onInvitationSent: (invitation: StaffInvitation) => void;
  currentUser: {
    fullName: string;
    email: string;
    role: string;
  };
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({
  isOpen,
  onClose,
  agents,
  preselectedAgent,
  onInvitationSent,
  currentUser,
}) => {
  const [selectionMode, setSelectionMode] = useState<'existing' | 'manual'>(
    preselectedAgent ? 'existing' : 'existing'
  );
  const [selectedAgentCode, setSelectedAgentCode] = useState<string>(
    preselectedAgent?.affiliateCode || ''
  );
  const [recipientName, setRecipientName] = useState<string>(
    preselectedAgent?.fullName || ''
  );
  const [recipientEmail, setRecipientEmail] = useState<string>(
    preselectedAgent?.email || ''
  );
  const [affiliateCode, setAffiliateCode] = useState<string>(
    preselectedAgent?.affiliateCode || ''
  );

  const [role, setRole] = useState<'Staff' | 'Admin'>('Staff');
  const [department, setDepartment] = useState<string>('BD Operations & Accreditation');
  const [positionTitle, setPositionTitle] = useState<string>('BD Operations Coordinator');
  const [customMessage, setCustomMessage] = useState<string>(
    'You have been appointed to join the Megaworld International Business Development Staff. Please activate your account using your registered credentials.'
  );

  const [permissions, setPermissions] = useState<StaffPermissions>({
    canReviewApplications: true,
    canManageContracts: false,
    canEditAgents: true,
    canOverrideAccreditation: false,
    canViewReports: true,
    canManageSettings: false,
    canInviteStaff: false,
  });

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<StaffInvitation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync when preselectedAgent changes
  React.useEffect(() => {
    if (preselectedAgent) {
      setSelectedAgentCode(preselectedAgent.affiliateCode);
      setRecipientName(preselectedAgent.fullName);
      setRecipientEmail(preselectedAgent.email);
      setAffiliateCode(preselectedAgent.affiliateCode);
      setSelectionMode('existing');
    }
  }, [preselectedAgent]);

  if (!isOpen) return null;

  const handleSelectAgent = (code: string) => {
    setSelectedAgentCode(code);
    const agent = agents.find((a) => a.affiliateCode === code);
    if (agent) {
      setRecipientName(agent.fullName);
      setRecipientEmail(agent.email);
      setAffiliateCode(agent.affiliateCode);
    } else {
      setSelectedAgentCode('');
    }
  };

  const handlePermissionToggle = (key: keyof StaffPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recipientName.trim()) {
      setErrorMessage('Please enter the recipient full legal name.');
      return;
    }
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      setErrorMessage('Please provide a valid registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim().toLowerCase(),
        affiliateCode: affiliateCode ? affiliateCode.trim() : undefined,
        role,
        positionTitle,
        department,
        permissions,
        customMessage: customMessage.trim(),
        operatorName: currentUser.fullName || 'Super Administrator',
        operatorEmail: currentUser.email || 'admin@megaworld.com',
      };

      const result = await api.inviteStaff(payload);
      if (!result.success || !result.invitation) {
        throw new Error(result.message || 'Failed to dispatch staff invitation.');
      }

      setDispatchResult(result.invitation);
      onInvitationSent(result.invitation);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInvitationCode = () => {
    if (!dispatchResult) return;
    navigator.clipboard.writeText(dispatchResult.invitationCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header with Megaworld Navy */}
        <div className="px-6 py-4 bg-[#002B66] text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Invite Member to Staff & Grant Role
              </h2>
              <p className="text-[11px] text-blue-100/80">
                Official Appointment with notification sent via their registered email address
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Dispatched Confirmation Screen */}
        {dispatchResult ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Official Staff Invitation Dispatched!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                A formal appointment notification has been delivered to the member’s registered email address at{' '}
                <strong className="text-blue-900 font-semibold">{dispatchResult.recipientEmail}</strong>.
              </p>
            </div>

            {/* Delivery Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Notification Recipient:</span>
                <span className="font-bold text-slate-900">
                  {dispatchResult.recipientName} ({dispatchResult.recipientEmail})
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Assigned System Role:</span>
                <span className="font-semibold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                  {dispatchResult.role} ({dispatchResult.positionTitle})
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Department / Unit:</span>
                <span className="font-semibold text-slate-800">{dispatchResult.department}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Delivery Channel:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Official Megaworld Mail Server (SMTP)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Official Invitation Code:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    {dispatchResult.invitationCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyInvitationCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Email Transcript Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 px-4 py-2 font-semibold text-slate-700 flex items-center justify-between">
                <span>Dispatched Email Transcript</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  Delivered • {formatDateTime(dispatchResult.emailDispatchLog.sentAt)}
                </span>
              </div>
              <div className="p-4 bg-white space-y-2 text-slate-600">
                <p className="font-bold text-slate-800">
                  Subject: {dispatchResult.emailDispatchLog.subject}
                </p>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 italic text-[11px] leading-relaxed">
                  "{dispatchResult.emailDispatchLog.bodyPreview}"
                </div>
                <p className="text-[10px] text-slate-400">
                  Note: The invited member can activate their role immediately or sign in using their registered credentials.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDispatchResult(null);
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#002B66] hover:bg-blue-950 rounded-xl shadow-xs transition"
              >
                Done & Return to Accounts
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Member Selection Mode */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                1. Select Member or Input Registered Email
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectionMode('existing')}
                  className={`py-2 px-3 rounded-lg font-semibold text-xs border transition flex items-center justify-center gap-1.5 ${
                    selectionMode === 'existing'
                      ? 'bg-blue-50 border-blue-900 text-blue-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Existing Affiliate / Agent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode('manual');
                    setSelectedAgentCode('');
                  }}
                  className={`py-2 px-3 rounded-lg font-semibold text-xs border transition flex items-center justify-center gap-1.5 ${
                    selectionMode === 'manual'
                      ? 'bg-blue-50 border-blue-900 text-blue-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Manual Email Entry
                </button>
              </div>

              {selectionMode === 'existing' ? (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Choose from Registered Agents Database ({agents.length} members):
                  </label>
                  <select
                    value={selectedAgentCode}
                    onChange={(e) => handleSelectAgent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="">-- Select an affiliate agent to promote --</option>
                    {agents.map((ag) => (
                      <option key={ag.affiliateCode} value={ag.affiliateCode}>
                        {ag.fullName} • {ag.affiliateCode} ({ag.email}) - {ag.position} [{ag.region}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Member Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Maria Corazon Santos"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="member@domain.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">
                  Notification and invitation activation code will be sent to this email.
                </span>
              </div>
            </div>

            {/* Role & Department Designation */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">
                2. Role & Department Assignment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white font-bold text-blue-950"
                  >
                    <option value="Staff">Staff (Operational Access)</option>
                    <option value="Admin">Admin (Full Administrative Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Designation Title</label>
                  <input
                    type="text"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    placeholder="e.g. BD Operations Coordinator"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                  >
                    <option value="BD Operations & Accreditation">BD Operations & Accreditation</option>
                    <option value="Contracts & Legal Compliance">Contracts & Legal Compliance</option>
                    <option value="International Sales Operations">International Sales Operations</option>
                    <option value="Executive Administration">Executive Administration</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Granular Access Rights & Permissions */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                3. Granted Access Rights & Permissions Matrix
              </label>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Specify exactly which management and operational privileges are granted to this staff member:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canReviewApplications}
                    onChange={() => handlePermissionToggle('canReviewApplications')}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Review & Approve Applications</span>
                    <span className="text-[10px] text-slate-500">Screen submissions, verify KYC documents, and approve.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canManageContracts}
                    onChange={() => handlePermissionToggle('canManageContracts')}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Contract & SAA Management</span>
                    <span className="text-[10px] text-slate-500">Upload contract templates, review signed SAAs.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canEditAgents}
                    onChange={() => handlePermissionToggle('canEditAgents')}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Agents Database & Metadata</span>
                    <span className="text-[10px] text-slate-500">Access spreadsheet replica, edit agent details & status.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canOverrideAccreditation}
                    onChange={() => handlePermissionToggle('canOverrideAccreditation')}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Manual Accreditation Grant</span>
                    <span className="text-[10px] text-slate-500">Fast-forward expiry evaluation, manual override.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canViewReports}
                    onChange={() => handlePermissionToggle('canViewReports')}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Executive Reports & Expiry Alerts</span>
                    <span className="text-[10px] text-slate-500">View 4-month expiry forecasts and regional metrics.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canManageSettings}
                    onChange={() => handlePermissionToggle('canManageSettings')}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">System Settings & Sheets Sync</span>
                    <span className="text-[10px] text-slate-500">Configure Google Apps Script & sync automation.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Onboarding Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Personalized Onboarding Note to Member (Included in Email Notification)
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                placeholder="Enter an optional onboarding message..."
              />
            </div>

            {/* Live Email Notification Preview Toggle */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-left font-semibold text-slate-700 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-900" />
                  Live Preview: Notification Sent via Registered Email ({recipientEmail || 'member email'})
                </span>
                <span className="text-[10px] text-blue-900 font-bold underline">
                  {showEmailPreview ? 'Hide Preview' : 'Show Preview'}
                </span>
              </button>

              {showEmailPreview && (
                <div className="p-4 bg-white border-t border-slate-200 space-y-3 font-sans">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                    <div>
                      <strong className="text-slate-500">From:</strong> Megaworld International Accreditation Board &lt;accreditation-board@megaworldinternational.com&gt;
                    </div>
                    <div>
                      <strong className="text-slate-500">To:</strong> {recipientName || 'Member Name'} &lt;{recipientEmail || 'member@domain.com'}&gt;
                    </div>
                    <div>
                      <strong className="text-slate-500">Subject:</strong> Official Appointment: Megaworld International BD Staff Invitation ({positionTitle || 'Staff'})
                    </div>
                  </div>

                  {/* Mock Email Body */}
                  <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                      <div className="w-8 h-8">
                        <MegaworldLogo className="w-8 h-8 text-[#002B66]" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">MEGAWORLD INTERNATIONAL</div>
                        <div className="text-[10px] text-amber-700 font-medium">Business Development Operations</div>
                      </div>
                    </div>

                    <p className="text-slate-800">
                      Dear <strong>{recipientName || 'Valued Member'}</strong>,
                    </p>

                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      You have been officially invited by <strong>{currentUser.fullName}</strong> to join the Megaworld International BD Staff as{' '}
                      <strong className="text-blue-900">{positionTitle}</strong> in the{' '}
                      <strong>{department}</strong>.
                    </p>

                    {customMessage && (
                      <div className="p-2.5 bg-amber-50 rounded border-l-2 border-amber-500 text-amber-900 italic text-[11px]">
                        "{customMessage}"
                      </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-semibold text-slate-700 text-[11px] mb-1.5">Granted Access Privileges:</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                        {permissions.canReviewApplications && <li>Review & Screen Affiliate Applications</li>}
                        {permissions.canManageContracts && <li>Manage Contracts & Official SAA Endorsements</li>}
                        {permissions.canEditAgents && <li>Access & Update Affiliate Database</li>}
                        {permissions.canOverrideAccreditation && <li>Manual Accreditation Status Overrides</li>}
                        {permissions.canViewReports && <li>Access Executive Analytics & Expiry Reports</li>}
                        {permissions.canManageSettings && <li>System Configuration & Database Synchronization</li>}
                      </ul>
                    </div>

                    <div className="text-center pt-2">
                      <span className="inline-block px-4 py-2 bg-[#002B66] text-white font-bold rounded-lg text-xs shadow-xs">
                        Activate Staff Access & Log In
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Your permanent credentials and registered email ({recipientEmail || 'member@domain.com'}) are linked to this staff role.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-1 pt-3 flex items-center justify-between border-t border-slate-200">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                Action logged in official system Audit Trail
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002B66] hover:bg-blue-950 rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Dispatching Notification...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      Send Official Invitation via Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
