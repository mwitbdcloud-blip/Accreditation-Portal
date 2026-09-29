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
  Network,
} from 'lucide-react';
import {
  AccreditationApplication,
  AgentProfile,
  Region,
  Position,
  REGIONS,
  POSITIONS,
  TeamDetails,
  TeamLeadershipDetails,
} from '../types';
import { formatDate } from '../utils/dateFormatter';

const DEFAULT_LEADERSHIP: TeamLeadershipDetails = {
  seniorMarketingAssociate: 'Ricardo Gomez',
  marketingManager: 'Jonathan Cruz',
  marketingDirector: 'Victoria Del Rosario',
  assistanceCountryManager: 'Ferdinand Marcos Jr.',
  countryManager: 'Eduardo Valenzuela',
  seniorCountryManager: 'Grace P. Tan',
  assistanceVicePresident: 'Roberto De Leon',
  vicePresident: 'Ma. Lourdes Santos',
  seniorVicePresident: 'Antonio Morales',
  referrerName: 'Ricardo Gomez',
  referrerPosition: 'Senior Marketing Associate',
};

const resolveTeamLeadership = (app: AccreditationApplication): TeamLeadershipDetails => {
  const l = app.teamDetails?.leadership || {};
  return {
    seniorMarketingAssociate: l.seniorMarketingAssociate || app.teamDetails?.upline || DEFAULT_LEADERSHIP.seniorMarketingAssociate,
    marketingManager: l.marketingManager || app.teamDetails?.teamLeader || DEFAULT_LEADERSHIP.marketingManager,
    marketingDirector: l.marketingDirector || DEFAULT_LEADERSHIP.marketingDirector,
    assistanceCountryManager: l.assistanceCountryManager || DEFAULT_LEADERSHIP.assistanceCountryManager,
    countryManager: l.countryManager || DEFAULT_LEADERSHIP.countryManager,
    seniorCountryManager: l.seniorCountryManager || DEFAULT_LEADERSHIP.seniorCountryManager,
    assistanceVicePresident: l.assistanceVicePresident || DEFAULT_LEADERSHIP.assistanceVicePresident,
    vicePresident: l.vicePresident || DEFAULT_LEADERSHIP.vicePresident,
    seniorVicePresident: l.seniorVicePresident || DEFAULT_LEADERSHIP.seniorVicePresident,
    referrerName: l.referrerName || app.teamDetails?.upline || DEFAULT_LEADERSHIP.referrerName,
    referrerPosition: l.referrerPosition || DEFAULT_LEADERSHIP.referrerPosition,
  };
};

interface ApplicationsManagerProps {
  applications: AccreditationApplication[];
  agents: AgentProfile[];
  onReviewApplication: (
    id: string,
    action: 'Approve' | 'Reject' | 'Revision Required',
    notes?: string,
    updatedTeamDetails?: TeamDetails
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
  const [editableTeamDetails, setEditableTeamDetails] = useState<TeamDetails | null>(null);
  const [isEditingHierarchy, setIsEditingHierarchy] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenReviewModal = (app: AccreditationApplication) => {
    setSelectedApp(app);
    setEditableTeamDetails({
      teamName: app.teamDetails?.teamName || 'Team Apex Horizon',
      brokerGroup: app.teamDetails?.brokerGroup || 'Megaworld International AP2 Hub',
      upline: app.teamDetails?.upline || 'Ricardo Gomez',
      teamLeader: app.teamDetails?.teamLeader || 'Victoria Del Rosario',
      leadership: resolveTeamLeadership(app),
    });
    setIsEditingHierarchy(false);
    setReviewNotes(app.reviewNotes || '');
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
    setEditableTeamDetails(null);
    setIsEditingHierarchy(false);
    setReviewNotes('');
  };

  const handleLeadershipFieldChange = (field: keyof TeamLeadershipDetails, value: string) => {
    if (!editableTeamDetails) return;
    setEditableTeamDetails({
      ...editableTeamDetails,
      leadership: {
        ...editableTeamDetails.leadership,
        [field]: value,
      },
    });
  };

  const handleTeamFieldChange = (field: keyof TeamDetails, value: string) => {
    if (!editableTeamDetails) return;
    setEditableTeamDetails({
      ...editableTeamDetails,
      [field]: value,
    });
  };

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

  const handleExecuteReview = async (action: 'Approve' | 'Reject' | 'Revision Required') => {
    if (!selectedApp) return;
    setIsProcessing(true);
    await onReviewApplication(
      selectedApp.id,
      action,
      reviewNotes,
      editableTeamDetails || undefined
    );
    setIsProcessing(false);
    handleCloseModal();
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
                            onClick={() => handleOpenReviewModal(app)}
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
          <div className="relative w-full max-w-4xl my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
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
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-slate-700">
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
                    <span className="text-slate-400 block">Date of Birth & Age:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(selectedApp.personalDetails.dateOfBirth)}
                      {selectedApp.personalDetails.age ? ` (${selectedApp.personalDetails.age} yrs old)` : ''}
                    </span>
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

              {/* Banking Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-900" /> Banking Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bank Name:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.bankDetails.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Name:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.bankDetails.accountName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Number:</span>
                    <span className="font-semibold text-slate-800 font-mono">{selectedApp.bankDetails.accountNumber}</span>
                  </div>
                </div>
              </div>

              {/* Team and Leadership Complete Structure & Hierarchy */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-900" /> Team & Leadership Complete Hierarchy Structure
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Official reporting hierarchy, witnessing signatories, and unit structure for sales agreement contract generation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 flex items-center gap-1">
                      <Network className="w-3 h-3" /> Complete Hierarchy Structure
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingHierarchy((prev) => !prev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                        isEditingHierarchy
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Edit className="w-3 h-3" />
                      {isEditingHierarchy ? 'Lock Hierarchy' : 'Edit Hierarchy'}
                    </button>
                  </div>
                </div>

                {/* Team Affiliation & Unit Reporting */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Team Affiliation & Unit Leadership
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Position: {selectedApp.position}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Team Name</span>
                      {isEditingHierarchy ? (
                        <input
                          type="text"
                          value={editableTeamDetails?.teamName || ''}
                          onChange={(e) => handleTeamFieldChange('teamName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      ) : (
                        <strong className="text-slate-900 text-xs block">{editableTeamDetails?.teamName || 'Team Apex Horizon'}</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Broker Group / Hub</span>
                      {isEditingHierarchy ? (
                        <input
                          type="text"
                          value={editableTeamDetails?.brokerGroup || ''}
                          onChange={(e) => handleTeamFieldChange('brokerGroup', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      ) : (
                        <strong className="text-slate-900 text-xs block">{editableTeamDetails?.brokerGroup || 'Megaworld International AP2 Hub'}</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Direct Upline / Recruiter</span>
                      {isEditingHierarchy ? (
                        <input
                          type="text"
                          value={editableTeamDetails?.upline || ''}
                          onChange={(e) => handleTeamFieldChange('upline', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      ) : (
                        <strong className="text-slate-900 text-xs block">{editableTeamDetails?.upline || 'Ricardo Gomez'}</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Team Leader / Unit Manager</span>
                      {isEditingHierarchy ? (
                        <input
                          type="text"
                          value={editableTeamDetails?.teamLeader || ''}
                          onChange={(e) => handleTeamFieldChange('teamLeader', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      ) : (
                        <strong className="text-slate-900 text-xs block">{editableTeamDetails?.teamLeader || 'Victoria Del Rosario'}</strong>
                      )}
                    </div>
                  </div>
                </div>

                {/* Complete Leadership Hierarchy Tree */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                    <span>Official Complete Leadership Hierarchy (Signatories & Reporting)</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                      Contract Signatories Ready
                    </span>
                  </div>

                  {/* Level 1: Executive Directorate */}
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-950">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        Level 1: Executive Directorate
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[9px] font-semibold">
                        Top Executive Management
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-indigo-900 font-bold">Senior Vice President</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded font-mono font-bold">SVP</span>
                        </div>
                        {isEditingHierarchy ? (
                          <input
                            type="text"
                            value={editableTeamDetails?.leadership?.seniorVicePresident || ''}
                            onChange={(e) => handleLeadershipFieldChange('seniorVicePresident', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                          />
                        ) : (
                          <strong className="text-slate-900 text-xs block truncate">{editableTeamDetails?.leadership?.seniorVicePresident || 'Antonio Morales'}</strong>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-indigo-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-indigo-900 font-bold">Vice President</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded font-mono font-bold">VP</span>
                        </div>
                        {isEditingHierarchy ? (
                          <input
                            type="text"
                            value={editableTeamDetails?.leadership?.vicePresident || ''}
                            onChange={(e) => handleLeadershipFieldChange('vicePresident', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                          />
                        ) : (
                          <strong className="text-slate-900 text-xs block truncate">{editableTeamDetails?.leadership?.vicePresident || 'Ma. Lourdes Santos'}</strong>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-indigo-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-indigo-900 font-bold">Assistance Vice President</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded font-mono font-bold">AVP</span>
                        </div>
                        {isEditingHierarchy ? (
                          <input
                            type="text"
                            value={editableTeamDetails?.leadership?.assistanceVicePresident || ''}
                            onChange={(e) => handleLeadershipFieldChange('assistanceVicePresident', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                          />
                        ) : (
                          <strong className="text-slate-900 text-xs block truncate">{editableTeamDetails?.leadership?.assistanceVicePresident || 'Roberto De Leon'}</strong>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Level 2: Regional & Country Directorate */}
                  <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-950">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        Level 2: Regional & Country Directorate
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[9px] font-semibold">
                        Regional Country Heads
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="bg-white p-2.5 rounded-lg border border-blue-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-blue-900 font-bold">Senior Country Manager</span>
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-1 rounded font-mono font-bold">SCM</span>
                        </div>
                        {isEditingHierarchy ? (
                          <input
                            type="text"
                            value={editableTeamDetails?.leadership?.seniorCountryManager || ''}
                            onChange={(e) => handleLeadershipFieldChange('seniorCountryManager', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                          />
                        ) : (
                          <strong className="text-slate-900 text-xs block truncate">{editableTeamDetails?.leadership?.seniorCountryManager || 'Grace P. Tan'}</strong>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-blue-900 font-bold">Country Manager</span>
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-1 rounded font-mono font-bold">CM</span>
                        </div>
                        {isEditingHierarchy ? (
                          <input
                            type="text"
                            value={editableTeamDetails?.leadership?.countryManager || ''}
                            onChange={(e) => handleLeadershipFieldChange('countryManager', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                          />
                        ) : (
                          <strong className="text-slate-900 text-xs block truncate">{editableTeamDetails?.leadership?.countryManager || 'Eduardo Valenzuela'}</strong>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-blue-900 font-bold">Assistance Country Manager</span>
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-1 rounded font-mono font-bold">ACM</span>
                        </div>
                        {isEditingHierarchy ? (
                          <input
                            type="text"
                            value={editableTeamDetails?.leadership?.assistanceCountryManager || ''}
                            onChange={(e) => handleLeadershipFieldChange('assistanceCountryManager', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                          />
                        ) : (
                          <strong className="text-slate-900 text-xs block truncate">{editableTeamDetails?.leadership?.assistanceCountryManager || 'Ferdinand Marcos Jr.'}</strong>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Level 3 & Level 4: Division Directorate & Field Supervision */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Level 3: Division Directorate */}
                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Level 3: Division Directorate
                        </span>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[9px] font-semibold">
                          Branch Heads
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 shadow-2xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-amber-900 font-bold">Marketing Director</span>
                            <span className="text-[9px] bg-amber-50 text-amber-800 px-1 rounded font-mono font-bold">MD</span>
                          </div>
                          {isEditingHierarchy ? (
                            <input
                              type="text"
                              value={editableTeamDetails?.leadership?.marketingDirector || ''}
                              onChange={(e) => handleLeadershipFieldChange('marketingDirector', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                            />
                          ) : (
                            <strong className="text-slate-900 text-xs block">{editableTeamDetails?.leadership?.marketingDirector || 'Victoria Del Rosario'}</strong>
                          )}
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 shadow-2xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-amber-900 font-bold">Marketing Manager</span>
                            <span className="text-[9px] bg-amber-50 text-amber-800 px-1 rounded font-mono font-bold">MM</span>
                          </div>
                          {isEditingHierarchy ? (
                            <input
                              type="text"
                              value={editableTeamDetails?.leadership?.marketingManager || ''}
                              onChange={(e) => handleLeadershipFieldChange('marketingManager', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                            />
                          ) : (
                            <strong className="text-slate-900 text-xs block">{editableTeamDetails?.leadership?.marketingManager || 'Jonathan Cruz'}</strong>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Level 4: Field Supervision & Referral Witnessing */}
                    <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-950">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Level 4: Field Unit & Witnessing
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-semibold">
                          Unit & Witness
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-emerald-900 font-bold">Senior Marketing Associate</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1 rounded font-mono font-bold">SMA</span>
                          </div>
                          {isEditingHierarchy ? (
                            <input
                              type="text"
                              value={editableTeamDetails?.leadership?.seniorMarketingAssociate || ''}
                              onChange={(e) => handleLeadershipFieldChange('seniorMarketingAssociate', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                            />
                          ) : (
                            <strong className="text-slate-900 text-xs block">{editableTeamDetails?.leadership?.seniorMarketingAssociate || 'Ricardo Gomez'}</strong>
                          )}
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-emerald-900 font-bold">Referrer Witnessing Signatory</span>
                            <span className="text-[9px] text-slate-400 font-mono">{editableTeamDetails?.leadership?.referrerPosition || 'Senior Marketing Associate'}</span>
                          </div>
                          {isEditingHierarchy ? (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <input
                                type="text"
                                placeholder="Referrer Name"
                                value={editableTeamDetails?.leadership?.referrerName || ''}
                                onChange={(e) => handleLeadershipFieldChange('referrerName', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                              />
                              <input
                                type="text"
                                placeholder="Referrer Position"
                                value={editableTeamDetails?.leadership?.referrerPosition || ''}
                                onChange={(e) => handleLeadershipFieldChange('referrerPosition', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
                              />
                            </div>
                          ) : (
                            <strong className="text-slate-900 text-xs block truncate">
                              {editableTeamDetails?.leadership?.referrerName || 'Ricardo Gomez'}
                            </strong>
                          )}
                        </div>
                      </div>
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
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteReview('Revision Required')}
                  disabled={isProcessing}
                  className="px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition disabled:opacity-50"
                >
                  Request Revision
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteReview('Reject')}
                  disabled={isProcessing}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition disabled:opacity-50"
                >
                  Reject Application
                </button>

                <button
                  type="button"
                  id="approve-application-modal-btn"
                  onClick={() => handleExecuteReview('Approve')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition disabled:opacity-50"
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
