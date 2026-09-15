import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Edit,
  ShieldCheck,
  Download,
  Calendar,
  User,
  CreditCard,
  Users,
  Camera,
  FileCheck,
  Trash2,
} from 'lucide-react';
import {
  AccreditationApplication,
  AgentProfile,
  Region,
  Position,
  REGIONS,
  POSITIONS,
} from '../types';
import { formatDate } from '../utils/dateFormatter';

interface ApplicationsManagerProps {
  applications: AccreditationApplication[];
  agents: AgentProfile[];
  onReviewApplication: (
    id: string,
    action: 'Approve' | 'Reject' | 'Revision Required',
    notes?: string
  ) => void;
  onViewContractForApp: (app: AccreditationApplication) => void;
  onDeleteApplication?: (id: string) => void;
  currentUserRole: string;
}

export const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({
  applications,
  agents,
  onReviewApplication,
  onViewContractForApp,
  onDeleteApplication,
  currentUserRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Selected application for detail review modal
  const [selectedApp, setSelectedApp] = useState<AccreditationApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approve' | 'Reject' | 'Revision Required' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalDetails.emailAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = regionFilter === 'All' || app.region === regionFilter;
    const matchesPosition = positionFilter === 'All' || app.position === positionFilter;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesType = typeFilter === 'All' || app.applicationType === typeFilter;

    return matchesSearch && matchesRegion && matchesPosition && matchesStatus && matchesType;
  });

  const handleExecuteReview = async () => {
    if (!selectedApp || !reviewAction) return;
    setIsProcessing(true);
    await onReviewApplication(selectedApp.id, reviewAction, reviewNotes);
    setIsProcessing(false);
    setSelectedApp(null);
    setReviewAction(null);
    setReviewNotes('');
  };

  return (
    <div id="applications-manager-view" className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, verify government documents, approve accreditations, and trigger official Sales Agreement contract generation.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg border border-blue-200">
            Showing {filteredApps.length} of {applications.length} Applications
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Code, Name, Email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          {/* Region filter */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-700"
            >
              <option value="All">All Regions (15)</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Position filter */}
          <div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-700"
            >
              <option value="All">All Positions</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted / Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Revision Required">Revision Required</option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-700"
            >
              <option value="All">All Types (New / Renewal)</option>
              <option value="New">New Accreditation</option>
              <option value="Renewal">Renewal Application</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Affiliate Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">ID Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No applications found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-950">
                        {app.affiliateCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{app.personalDetails.fullName}</span>
                        <span className="text-[11px] text-slate-400">{app.personalDetails.emailAddress}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{app.region}</td>
                      <td className="py-3.5 px-4 text-slate-700">{app.position}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.applicationType === 'Renewal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {app.applicationType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(app.dateSubmitted)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Under Review' || app.status === 'Submitted'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'Revision Required'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            app.idVerificationStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {app.idVerificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition"
                            title="Review Application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {app.status === 'Approved' && (
                            <button
                              type="button"
                              onClick={() => onViewContractForApp(app)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="View Generated Contract"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          {(currentUserRole === 'Admin' || currentUserRole === 'Staff') && onDeleteApplication && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete application ${app.id} for ${app.personalDetails.fullName}?`
                                  )
                                ) {
                                  onDeleteApplication(app.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 font-mono">{selectedApp.affiliateCode}</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-white/20">
                    {selectedApp.applicationType} Accreditation
                  </span>
                </div>
                <h3 className="text-base font-bold mt-0.5">{selectedApp.personalDetails.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Review status summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Position</span>
                  <strong className="text-slate-900">{selectedApp.position}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Region</span>
                  <strong className="text-slate-900">{selectedApp.region}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status</span>
                  <strong className="text-slate-900">{selectedApp.status}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Date Submitted</span>
                  <strong className="text-slate-900">{formatDate(selectedApp.dateSubmitted)}</strong>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-900" /> Personal Identity
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Full Legal Name:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalDetails.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Birth:</span>
                    <span className="font-semibold text-slate-800">{formatDate(selectedApp.personalDetails.dateOfBirth)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nationality:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalDetails.nationality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contact Mobile:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalDetails.mobileNumber}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Residential Address:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalDetails.residentialAddress}</span>
                  </div>
                </div>
              </div>

              {/* Bank & Team Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-900" /> Banking Details
                  </h4>
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div>
                      <span className="text-slate-400 block">Bank Name:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.bankDetails.bankName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Account Name:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.bankDetails.accountName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Account Number:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.bankDetails.accountNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-900" /> Team & Leadership
                  </h4>
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div>
                      <span className="text-slate-400 block">Team:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.teamDetails.teamName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Upline / Recruiter:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.teamDetails.upline}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Leader / Manager:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.teamDetails.teamLeader || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Review: 1x1 Photo & Government ID & E-Signature */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-900" /> Uploaded Document Verification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1x1 Photo */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-500 font-semibold block mb-2">1x1 ID Photo</span>
                    {selectedApp.idPhotoUrl ? (
                      <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden border border-slate-300">
                        <img src={selectedApp.idPhotoUrl} alt="1x1" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        Missing
                      </div>
                    )}
                  </div>

                  {/* Government ID */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-500 font-semibold block mb-2">Valid ID / Passport</span>
                    {selectedApp.governmentIdUrl ? (
                      <div className="w-32 h-24 mx-auto rounded-lg overflow-hidden border border-slate-300">
                        <img src={selectedApp.governmentIdUrl} alt="ID Document" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-24 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        Missing
                      </div>
                    )}
                  </div>

                  {/* E-Signature */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-500 font-semibold block mb-2">Electronic Signature</span>
                    {selectedApp.eSignatureUrl ? (
                      <div className="w-32 h-24 mx-auto rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center bg-slate-50">
                        <img src={selectedApp.eSignatureUrl} alt="Signature" className="max-h-16 object-contain" />
                      </div>
                    ) : (
                      <div className="w-32 h-24 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        Unsigned
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Notes Input */}
              <div className="space-y-1.5 pt-2">
                <label className="block font-semibold text-slate-800">
                  Reviewer Notes / Feedback (Sent to applicant on rejection/revision)
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Verified Philippine passport. Full name and birthdate matched. Proceeding with 4-month accreditation approval."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReviewAction('Revision Required');
                    setTimeout(() => handleExecuteReview(), 50);
                  }}
                  disabled={isProcessing}
                  className="px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition"
                >
                  Request Revision
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReviewAction('Reject');
                    setTimeout(() => handleExecuteReview(), 50);
                  }}
                  disabled={isProcessing}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition"
                >
                  Reject Application
                </button>

                <button
                  type="button"
                  id="approve-application-modal-btn"
                  onClick={() => {
                    setReviewAction('Approve');
                    setTimeout(() => handleExecuteReview(), 50);
                  }}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve & Generate Contract (4 Mo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
