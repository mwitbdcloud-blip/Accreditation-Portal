import React, { useState } from 'react';
import {
  X,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  Mail,
  ShieldCheck,
  User,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AgentProfile } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/dateFormatter';

interface AgentCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentProfile | null;
  currentUser: any;
  onUpdateAgent?: (updated: AgentProfile) => void;
  showToast: (msg: string) => void;
}

export const AgentCredentialsModal: React.FC<AgentCredentialsModalProps> = ({
  isOpen,
  onClose,
  agent,
  currentUser,
  onUpdateAgent,
  showToast,
}) => {
  if (!isOpen || !agent) return null;

  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [currentTempPass, setCurrentTempPass] = useState<string>(
    agent.tempPassword || `Mega@${agent.affiliateCode.split('-').pop() || '2026'}`
  );
  const [lastEmailSentAt, setLastEmailSentAt] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSendCredentialsEmail = async () => {
    setIsSendingEmail(true);
    try {
      const response = await api.sendAgentCredentials(agent.affiliateCode, {
        customNote: customNote.trim() || undefined,
        operatorName: currentUser?.displayName || currentUser?.fullName || 'BD Staff',
        operatorRole: currentUser?.role || 'Staff',
      });

      setLastEmailSentAt(new Date().toLocaleTimeString());
      showToast(response.message || `Credentials email dispatched to ${agent.email}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch credentials email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResetTempPassword = async () => {
    setIsResettingPass(true);
    try {
      const response = await api.resetAgentTempPassword(
        agent.affiliateCode,
        customPasswordInput.trim() || undefined,
        currentUser?.displayName || currentUser?.fullName || 'BD Staff',
        currentUser?.role || 'Staff'
      );

      setCurrentTempPass(response.tempPassword);
      setCustomPasswordInput('');
      if (onUpdateAgent) {
        onUpdateAgent({
          ...agent,
          tempPassword: response.tempPassword,
        });
      }
      showToast(`Temporary password updated: ${response.tempPassword}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password.');
    } finally {
      setIsResettingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 bg-[#002B66] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Agent Access & Temporary Credentials
                <span className="text-[11px] font-semibold bg-amber-400 text-blue-950 px-2 py-0.5 rounded-full">
                  Staff & Admin Control
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Affiliate Code is the agent's primary access point. Send renewal credentials & temporary password.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Permanent Affiliate Code Hero Access Point Card */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                  Primary Access Point • Permanent Affiliate Code
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-blue-950 tracking-tight mt-0.5">
                  {agent.affiliateCode}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  The agent logs in directly to the Creative Portal using this permanent Affiliate Code as their user identity.
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(agent.affiliateCode, 'Affiliate Code')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition shadow-2xs"
                >
                  {copiedField === 'Affiliate Code' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-500 font-medium">Permanent Record</span>
              </div>
            </div>
          </div>

          {/* Agent Information Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Full Legal Name</span>
              <span className="font-semibold text-slate-900">{agent.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Registered Email</span>
              <span className="font-semibold text-slate-900">{agent.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Region & Position</span>
              <span className="font-semibold text-slate-800">
                {agent.region} • {agent.position}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Accreditation Status</span>
              <span
                className={`font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                  agent.accreditationStatus === 'Active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : agent.accreditationStatus === 'Expiring Soon'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {agent.accreditationStatus} (Expires: {formatDate(agent.accreditationExpiryDate) || '4 Months'})
              </span>
            </div>
          </div>

          {/* Temporary Password Viewing & Management Card */}
          <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Active Temporary Password for Agent Login
                </h4>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                Renewal Access Enabled
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Current Temp Pass:</span>
                <span className="font-mono font-bold text-base text-slate-900 tracking-wider">
                  {isPasswordVisible ? currentTempPass : '••••••••••••'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                  title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                >
                  {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(currentTempPass, 'Temporary Password')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-md transition"
                >
                  {copiedField === 'Temporary Password' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Pass
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Reset or Set Custom Password */}
            <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={customPasswordInput}
                onChange={(e) => setCustomPasswordInput(e.target.value)}
                placeholder="Custom password (optional, min 6 chars)"
                className="w-full sm:flex-1 px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={handleResetTempPassword}
                disabled={isResettingPass}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResettingPass ? 'animate-spin' : ''}`} />
                {customPasswordInput ? 'Set Custom Password' : 'Auto-Generate New Password'}
              </button>
            </div>
          </div>

          {/* Email Dispatch Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-900" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Dispatch Renewal Credentials Email
                </h4>
              </div>
              {lastEmailSentAt && (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sent today at {lastEmailSentAt}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600">
              Staff and Admin can send an official automated email directly to{' '}
              <strong className="text-blue-950 font-semibold">{agent.email}</strong> containing their permanent
              Affiliate Code and temporary password for access and accreditation renewal.
            </p>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Custom Message / Instructions to Agent (Optional)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                rows={2}
                placeholder="e.g. Please log in with this temporary password to finalize your 4-month accreditation renewal contract."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            {/* Email Preview Card */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Email Content Preview:</div>
              <div className="font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                <div>
                  <strong>To:</strong> {agent.email}
                </div>
                <div>
                  <strong>Subject:</strong> Megaworld International: Credentials & Temporary Password for Portal Access (
                  {agent.affiliateCode})
                </div>
                <div className="text-slate-600 pt-1 border-t border-slate-200 text-[10px]">
                  Dear {agent.fullName},<br />
                  Your Megaworld International Affiliate access credentials are:<br />
                  • <strong>Access Point (Affiliate Code):</strong> {agent.affiliateCode}<br />
                  • <strong>Temporary Password:</strong> {currentTempPass}<br />
                  Log in at the Creative Portal to renew your accreditation.
                </div>
              </div>
            </div>

            <button
              type="button"
              id="send-agent-credentials-email-btn"
              onClick={handleSendCredentialsEmail}
              disabled={isSendingEmail}
              className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSendingEmail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching Official Credentials Email...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-300" /> Send Credentials Email with Temporary Password
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Operator: <strong>{currentUser?.displayName || currentUser?.fullName || 'Staff'}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
