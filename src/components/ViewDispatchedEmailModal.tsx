import React from 'react';
import { StaffInvitation } from '../types';
import { X, Mail, CheckCircle2, Copy, Check } from 'lucide-react';
import { MegaworldLogo } from './MegaworldLogo';

interface ViewDispatchedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: StaffInvitation | null;
}

export const ViewDispatchedEmailModal: React.FC<ViewDispatchedEmailModalProps> = ({
  isOpen,
  onClose,
  invitation,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !invitation) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitation.invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div className="px-6 py-4 bg-[#002B66] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm">Dispatched Email Notification Transcript</h3>
              <p className="text-[11px] text-blue-100/75">
                Sent to registered email: {invitation.recipientEmail}
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

        <div className="p-6 space-y-4 text-xs">
          {/* Dispatch metadata banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Status: <strong>{invitation.emailDispatchLog.status}</strong> • Channel:{' '}
                <strong>{invitation.emailDispatchLog.deliveryChannel}</strong>
              </span>
            </div>
            <span className="text-[10px] text-emerald-700">
              {new Date(invitation.emailDispatchLog.sentAt).toLocaleString()}
            </span>
          </div>

          {/* Email Headers */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
            <div>
              <strong className="text-slate-500">From:</strong> Megaworld International Accreditation Board &lt;accreditation-board@megaworldinternational.com&gt;
            </div>
            <div>
              <strong className="text-slate-500">To:</strong> {invitation.recipientName} &lt;{invitation.recipientEmail}&gt;
            </div>
            <div>
              <strong className="text-slate-500">Subject:</strong> {invitation.emailDispatchLog.subject}
            </div>
            <div>
              <strong className="text-slate-500">Dispatched By:</strong> {invitation.invitedBy} ({invitation.invitedByEmail})
            </div>
          </div>

          {/* Email Body Card */}
          <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3 font-sans">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <div className="w-7 h-7">
                <MegaworldLogo className="w-7 h-7 text-[#002B66]" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">MEGAWORLD INTERNATIONAL</div>
                <div className="text-[10px] text-amber-700 font-medium">Official Staff Appointment & Role Grant</div>
              </div>
            </div>

            <p className="text-slate-800 font-semibold">
              Dear {invitation.recipientName},
            </p>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              You have been officially invited by <strong>{invitation.invitedBy}</strong> to assume the role of{' '}
              <strong className="text-blue-900">{invitation.positionTitle}</strong> in the{' '}
              <strong>{invitation.department}</strong> unit at Megaworld International.
            </p>

            {invitation.customMessage && (
              <div className="p-3 bg-amber-50 rounded-lg border-l-2 border-amber-500 text-amber-900 italic text-[11px]">
                "{invitation.customMessage}"
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-800 text-[11px]">Active Permissions Granted:</div>
              <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
                {invitation.permissions.canReviewApplications && <li>Review & Approve Affiliate Applications</li>}
                {invitation.permissions.canManageContracts && <li>Contracts & SAA Template Endorsements</li>}
                {invitation.permissions.canEditAgents && <li>Access & Update Affiliate Database</li>}
                {invitation.permissions.canOverrideAccreditation && <li>Manual Accreditation Status Overrides</li>}
                {invitation.permissions.canViewReports && <li>Access Executive Analytics & Expiry Reports</li>}
                {invitation.permissions.canManageSettings && <li>System Configuration & Google Sheets Sync</li>}
                {invitation.permissions.canInviteStaff && <li>Invite Staff & Grant Member Roles</li>}
              </ul>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center space-y-2">
              <div className="text-[11px] text-blue-950 font-medium">Official Invitation Token:</div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-xs bg-white px-3 py-1 rounded border border-blue-300 text-blue-950">
                  {invitation.invitationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-1 text-[11px] bg-blue-900 text-white rounded font-medium flex items-center gap-1 hover:bg-blue-950"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Close Transcript
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
