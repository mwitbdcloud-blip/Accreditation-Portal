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
  Save,
  Lock,
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
import { formatDate, calculateAgeFromDob } from '../utils/dateFormatter';

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
  onUpdateApplicationDetails?: (
    id: string,
    updatedData: Partial<AccreditationApplication>
  ) => Promise<void> | void;
  onViewContractForApp: (app: AccreditationApplication) => void;
  onDeleteApplication?: (id: string) => void;
  currentUserRole: string;
}

export const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({
  applications,
  agents,
  onReviewApplication,
  onUpdateApplicationDetails,
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
  
  // Editable fields for Staff & Admin corrections
  const [editablePersonalDetails, setEditablePersonalDetails] = useState<any>(null);
  const [editableBankDetails, setEditableBankDetails] = useState<any>(null);
  const [editableTeamDetails, setEditableTeamDetails] = useState<TeamDetails | null>(null);
  const [editableDocPhotoUrl, setEditableDocPhotoUrl] = useState<string | null>(null);
  const [editableGovernmentIdUrl, setEditableGovernmentIdUrl] = useState<string | null>(null);
  const [editableESignatureUrl, setEditableESignatureUrl] = useState<string | null>(null);
  const [editableDocStatus, setEditableDocStatus] = useState<string>('Pending');

  // Edit mode toggles per section
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingHierarchy, setIsEditingHierarchy] = useState(false);
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);
  const [isSavingCorrections, setIsSavingCorrections] = useState(false);
  const [correctionSuccessMsg, setCorrectionSuccessMsg] = useState<string | null>(null);

  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenReviewModal = (app: AccreditationApplication) => {
    setSelectedApp(app);
    const p = app.personalDetails;
    const b = app.bankDetails;
    setEditablePersonalDetails({
      firstName: p?.firstName || p?.fullName?.split(' ')[0] || '',
      middleName: p?.middleName || '',
      lastName: p?.lastName || p?.fullName?.split(' ').slice(1).join(' ') || '',
      suffix: p?.suffix || '',
      fullName: p?.fullName || '',
      dateOfBirth: p?.dateOfBirth || '',
      age: p?.age ?? (p?.dateOfBirth ? calculateAgeFromDob(p.dateOfBirth) : ''),
      sex: p?.sex || '',
      civilStatus: p?.civilStatus || '',
      citizenship: p?.citizenship || p?.nationality || '',
      tin: p?.tin || '',
      telephoneNumber: p?.telephoneNumber || '',
      mobileNumber: p?.mobileNumber || '',
      emailAddress: p?.emailAddress || '',
      residentialAddress: p?.residentialAddress || '',
      country: p?.country || '',
      state: p?.state || '',
    });
    setEditableBankDetails({
      bankName: b?.bankName || '',
      accountName: b?.accountName || '',
      accountNumber: b?.accountNumber || '',
      bankAddress: b?.bankAddress || '',
      swiftCode: b?.swiftCode || '',
    });
    setEditableTeamDetails({
      teamName: app.teamDetails?.teamName || 'Team Apex Horizon',
      brokerGroup: app.teamDetails?.brokerGroup || 'Megaworld International AP2 Hub',
      upline: app.teamDetails?.upline || 'Ricardo Gomez',
      teamLeader: app.teamDetails?.teamLeader || 'Victoria Del Rosario',
      leadership: resolveTeamLeadership(app),
    });
    setEditableDocPhotoUrl(app.idPhotoUrl || null);
    setEditableGovernmentIdUrl(app.governmentIdUrl || null);
    setEditableESignatureUrl(app.eSignatureUrl || null);
    setEditableDocStatus(app.idVerificationStatus || 'Pending');
    setIsEditingPersonal(false);
    setIsEditingBank(false);
    setIsEditingHierarchy(false);
    setIsEditingDocuments(false);
    setCorrectionSuccessMsg(null);
    setReviewNotes(app.reviewNotes || '');
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
    setEditablePersonalDetails(null);
    setEditableBankDetails(null);
    setEditableTeamDetails(null);
    setEditableDocPhotoUrl(null);
    setEditableGovernmentIdUrl(null);
    setEditableESignatureUrl(null);
    setIsEditingPersonal(false);
    setIsEditingBank(false);
    setIsEditingHierarchy(false);
    setIsEditingDocuments(false);
    setCorrectionSuccessMsg(null);
    setReviewNotes('');
  };

  const handlePersonalFieldChange = (field: string, value: any) => {
    if (!editablePersonalDetails) return;
    const next = { ...editablePersonalDetails, [field]: value };
    if (['firstName', 'middleName', 'lastName', 'suffix'].includes(field)) {
      next.fullName = [next.firstName, next.middleName, next.lastName, next.suffix].filter(Boolean).join(' ');
    }
    if (field === 'dateOfBirth') {
      const calcAge = calculateAgeFromDob(value);
      if (calcAge !== '') next.age = calcAge;
    }
    setEditablePersonalDetails(next);
  };

  const handleBankFieldChange = (field: string, value: any) => {
    if (!editableBankDetails) return;
    setEditableBankDetails({ ...editableBankDetails, [field]: value });
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

  const handleFileUploadHelper = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCorrections = async () => {
    if (!selectedApp) return;
    setIsSavingCorrections(true);
    setCorrectionSuccessMsg(null);

    const updatedPersonal = editablePersonalDetails ? {
      ...selectedApp.personalDetails,
      ...editablePersonalDetails,
      fullName: [
        editablePersonalDetails.firstName,
        editablePersonalDetails.middleName,
        editablePersonalDetails.lastName,
        editablePersonalDetails.suffix,
      ].filter(Boolean).join(' ') || editablePersonalDetails.fullName,
      nationality: editablePersonalDetails.citizenship || selectedApp.personalDetails.nationality,
    } : selectedApp.personalDetails;

    const updatedBank = editableBankDetails ? {
      ...selectedApp.bankDetails,
      ...editableBankDetails,
    } : selectedApp.bankDetails;

    const updatedTeam = editableTeamDetails || selectedApp.teamDetails;

    const payload: Partial<AccreditationApplication> = {
      personalDetails: updatedPersonal,
      bankDetails: updatedBank,
      teamDetails: updatedTeam,
      idVerificationStatus: editableDocStatus as any,
    };

    if (editableDocPhotoUrl !== null) {
      payload.idPhotoUrl = editableDocPhotoUrl;
    }
    if (editableGovernmentIdUrl !== null) {
      payload.governmentIdUrl = editableGovernmentIdUrl;
    }
    if (editableESignatureUrl !== null) {
      payload.eSignatureUrl = editableESignatureUrl;
    }

    try {
      if (onUpdateApplicationDetails) {
        await onUpdateApplicationDetails(selectedApp.id, payload);
      }
      setSelectedApp((prev) => prev ? { ...prev, ...payload } : null);
      setCorrectionSuccessMsg('Application data corrections saved successfully.');
      setTimeout(() => setCorrectionSuccessMsg(null), 4000);
      setIsEditingPersonal(false);
      setIsEditingBank(false);
      setIsEditingHierarchy(false);
      setIsEditingDocuments(false);
    } catch (err: any) {
      console.error('Failed to save corrections:', err);
    } finally {
      setIsSavingCorrections(false);
    }
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

    const updatedPersonal = editablePersonalDetails ? {
      ...selectedApp.personalDetails,
      ...editablePersonalDetails,
      fullName: [
        editablePersonalDetails.firstName,
        editablePersonalDetails.middleName,
        editablePersonalDetails.lastName,
        editablePersonalDetails.suffix,
      ].filter(Boolean).join(' ') || editablePersonalDetails.fullName,
      nationality: editablePersonalDetails.citizenship || selectedApp.personalDetails.nationality,
    } : selectedApp.personalDetails;

    const updatedBank = editableBankDetails ? {
      ...selectedApp.bankDetails,
      ...editableBankDetails,
    } : selectedApp.bankDetails;

    const updatedTeam = editableTeamDetails || selectedApp.teamDetails;

    if (onUpdateApplicationDetails && (isEditingPersonal || isEditingBank || isEditingHierarchy || isEditingDocuments)) {
      try {
        const patchPayload: Partial<AccreditationApplication> = {
          personalDetails: updatedPersonal,
          bankDetails: updatedBank,
          teamDetails: updatedTeam,
          idVerificationStatus: editableDocStatus as any,
        };
        if (editableDocPhotoUrl !== null) patchPayload.idPhotoUrl = editableDocPhotoUrl;
        if (editableGovernmentIdUrl !== null) patchPayload.governmentIdUrl = editableGovernmentIdUrl;
        if (editableESignatureUrl !== null) patchPayload.eSignatureUrl = editableESignatureUrl;

        await onUpdateApplicationDetails(selectedApp.id, patchPayload);
      } catch (e) {
        console.error('Error saving pending edits before review:', e);
      }
    }

    await onReviewApplication(
      selectedApp.id,
      action,
      reviewNotes,
      updatedTeam
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
                              title="View Generated Sales Agency Agreement (SAA)"
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
              {/* Staff/Admin Correction Console Banner */}
              <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-950">Staff & Admin Data Correction Console</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Submitted application records are locked against edits by agents. As an authorized <strong>{currentUserRole}</strong>, you can change, revise, or edit any details (Personal, Bank, Team, Documents) if correction is needed.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const willEnable = !isEditingPersonal || !isEditingBank || !isEditingHierarchy || !isEditingDocuments;
                      setIsEditingPersonal(willEnable);
                      setIsEditingBank(willEnable);
                      setIsEditingHierarchy(willEnable);
                      setIsEditingDocuments(willEnable);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-blue-300 text-blue-900 hover:bg-blue-50 transition shadow-2xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {isEditingPersonal && isEditingBank && isEditingHierarchy && isEditingDocuments ? 'Exit Edit Mode' : 'Edit All Sections'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCorrections}
                    disabled={isSavingCorrections}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingCorrections ? 'Saving...' : 'Save Corrections'}
                  </button>
                </div>
              </div>

              {/* Toast / Notification when saved */}
              {correctionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{correctionSuccessMsg}</span>
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-900" /> Personal Identity & Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                      isEditingPersonal
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Edit className="w-3 h-3" />
                    {isEditingPersonal ? 'Lock Personal Details' : 'Edit Personal Details'}
                  </button>
                </div>

                {!isEditingPersonal ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Full Legal Name:</span>
                      <strong className="text-slate-900 text-xs">{editablePersonalDetails?.fullName || selectedApp.personalDetails.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Date of Birth & Age:</span>
                      <strong className="text-slate-900 text-xs">
                        {formatDate(editablePersonalDetails?.dateOfBirth || selectedApp.personalDetails.dateOfBirth)}
                        {(editablePersonalDetails?.age || selectedApp.personalDetails.age) ? ` (${editablePersonalDetails?.age || selectedApp.personalDetails.age} yrs old)` : ''}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Sex & Civil Status:</span>
                      <strong className="text-slate-900 text-xs">
                        {editablePersonalDetails?.sex || selectedApp.personalDetails.sex || '—'} / {editablePersonalDetails?.civilStatus || selectedApp.personalDetails.civilStatus || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Citizenship:</span>
                      <strong className="text-slate-900 text-xs">{editablePersonalDetails?.citizenship || selectedApp.personalDetails.citizenship || selectedApp.personalDetails.nationality}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">TIN (Tax ID):</span>
                      <strong className="text-slate-900 text-xs font-mono">{editablePersonalDetails?.tin || selectedApp.personalDetails.tin || 'Not Provided'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Contact Mobile:</span>
                      <strong className="text-slate-900 text-xs">{editablePersonalDetails?.mobileNumber || selectedApp.personalDetails.mobileNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Landline:</span>
                      <strong className="text-slate-900 text-xs">{editablePersonalDetails?.telephoneNumber || selectedApp.personalDetails.telephoneNumber || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email Address:</span>
                      <strong className="text-slate-900 text-xs">{editablePersonalDetails?.emailAddress || selectedApp.personalDetails.emailAddress}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Country & State:</span>
                      <strong className="text-slate-900 text-xs">{editablePersonalDetails?.state || selectedApp.personalDetails.state || '—'}, {editablePersonalDetails?.country || selectedApp.personalDetails.country || '—'}</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-slate-400 block text-[11px]">Residential Address:</span>
                      <strong className="text-slate-900 text-xs">{editablePersonalDetails?.residentialAddress || selectedApp.personalDetails.residentialAddress}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">First Name</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.firstName || ''}
                          onChange={(e) => handlePersonalFieldChange('firstName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Middle Name</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.middleName || ''}
                          onChange={(e) => handlePersonalFieldChange('middleName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Last Name</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.lastName || ''}
                          onChange={(e) => handlePersonalFieldChange('lastName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Suffix</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.suffix || ''}
                          onChange={(e) => handlePersonalFieldChange('suffix', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. Jr."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Date of Birth</label>
                        <input
                          type="date"
                          value={editablePersonalDetails?.dateOfBirth || ''}
                          onChange={(e) => handlePersonalFieldChange('dateOfBirth', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Age</label>
                        <input
                          type="number"
                          value={editablePersonalDetails?.age || ''}
                          onChange={(e) => handlePersonalFieldChange('age', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Sex</label>
                        <select
                          value={editablePersonalDetails?.sex || ''}
                          onChange={(e) => handlePersonalFieldChange('sex', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        >
                          <option value="">Select Sex</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Civil Status</label>
                        <select
                          value={editablePersonalDetails?.civilStatus || ''}
                          onChange={(e) => handlePersonalFieldChange('civilStatus', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        >
                          <option value="">Select Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Separated">Separated</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Citizenship</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.citizenship || ''}
                          onChange={(e) => handlePersonalFieldChange('citizenship', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">TIN (Tax ID)</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.tin || ''}
                          onChange={(e) => handlePersonalFieldChange('tin', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Mobile Number</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.mobileNumber || ''}
                          onChange={(e) => handlePersonalFieldChange('mobileNumber', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Email Address</label>
                        <input
                          type="email"
                          value={editablePersonalDetails?.emailAddress || ''}
                          onChange={(e) => handlePersonalFieldChange('emailAddress', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Country</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.country || ''}
                          onChange={(e) => handlePersonalFieldChange('country', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">State / Province</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.state || ''}
                          onChange={(e) => handlePersonalFieldChange('state', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Landline</label>
                        <input
                          type="text"
                          value={editablePersonalDetails?.telephoneNumber || ''}
                          onChange={(e) => handlePersonalFieldChange('telephoneNumber', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Residential Address</label>
                      <input
                        type="text"
                        value={editablePersonalDetails?.residentialAddress || ''}
                        onChange={(e) => handlePersonalFieldChange('residentialAddress', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Banking Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-900" /> Banking Details for Disbursements
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingBank((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                      isEditingBank
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Edit className="w-3 h-3" />
                    {isEditingBank ? 'Lock Bank Details' : 'Edit Bank Details'}
                  </button>
                </div>

                {!isEditingBank ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Bank Name:</span>
                      <strong className="text-slate-900 text-xs">{editableBankDetails?.bankName || selectedApp.bankDetails.bankName || 'Not Provided'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Account Name:</span>
                      <strong className="text-slate-900 text-xs">{editableBankDetails?.accountName || selectedApp.bankDetails.accountName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Account Number:</span>
                      <strong className="text-slate-900 text-xs font-mono">{editableBankDetails?.accountNumber || selectedApp.bankDetails.accountNumber || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Bank Branch / Address:</span>
                      <strong className="text-slate-900 text-xs">{editableBankDetails?.bankAddress || selectedApp.bankDetails.bankAddress || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Swift Code:</span>
                      <strong className="text-slate-900 text-xs font-mono">{editableBankDetails?.swiftCode || selectedApp.bankDetails.swiftCode || '—'}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Bank Name</label>
                        <input
                          type="text"
                          value={editableBankDetails?.bankName || ''}
                          onChange={(e) => handleBankFieldChange('bankName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Account Holder Name</label>
                        <input
                          type="text"
                          value={editableBankDetails?.accountName || ''}
                          onChange={(e) => handleBankFieldChange('accountName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Bank Account Number</label>
                        <input
                          type="text"
                          value={editableBankDetails?.accountNumber || ''}
                          onChange={(e) => handleBankFieldChange('accountNumber', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Bank Branch / Address</label>
                        <input
                          type="text"
                          value={editableBankDetails?.bankAddress || ''}
                          onChange={(e) => handleBankFieldChange('bankAddress', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Swift Code (Optional)</label>
                        <input
                          type="text"
                          value={editableBankDetails?.swiftCode || ''}
                          onChange={(e) => handleBankFieldChange('swiftCode', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-900" /> Uploaded Document Verification & Corrections
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Agent submissions are locked. Authorized Staff and Admins can replace photos, government IDs, signatures, or update verification statuses.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600">ID Status:</span>
                      <select
                        value={editableDocStatus}
                        onChange={(e) => setEditableDocStatus(e.target.value)}
                        className="text-xs font-semibold bg-white border border-slate-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-900 text-slate-800"
                      >
                        <option value="Pending">Pending Review</option>
                        <option value="Verified">Verified Official</option>
                        <option value="Invalid">Invalid / Unclear</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingDocuments((prev) => !prev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                        isEditingDocuments
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Edit className="w-3 h-3" />
                      {isEditingDocuments ? 'Lock Documents' : 'Edit Documents'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1x1 Photo */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-bold text-xs">1x1 ID Photo</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 font-semibold">
                          Formal Attire
                        </span>
                      </div>
                      {(editableDocPhotoUrl || selectedApp.idPhotoUrl) ? (
                        <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden border border-slate-300 relative shadow-2xs">
                          <img
                            src={editableDocPhotoUrl || selectedApp.idPhotoUrl}
                            alt="1x1"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          Missing Photo
                        </div>
                      )}
                    </div>

                    {isEditingDocuments && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <label className="cursor-pointer block text-center px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-semibold rounded border border-blue-200 transition">
                          <span>Upload / Replace Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUploadHelper(f, setEditableDocPhotoUrl);
                            }}
                          />
                        </label>
                        {editableDocPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditableDocPhotoUrl(null)}
                            className="text-[10px] text-rose-600 hover:underline block mx-auto"
                          >
                            Revert Photo
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Government ID */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-bold text-xs">Valid Government ID / Passport</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          editableDocStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : editableDocStatus === 'Invalid'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {editableDocStatus}
                        </span>
                      </div>
                      {(editableGovernmentIdUrl || selectedApp.governmentIdUrl) ? (
                        <div className="w-36 h-24 mx-auto rounded-lg overflow-hidden border border-slate-300 relative shadow-2xs">
                          <img
                            src={editableGovernmentIdUrl || selectedApp.governmentIdUrl}
                            alt="ID Document"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-36 h-24 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          Missing Document
                        </div>
                      )}
                    </div>

                    {isEditingDocuments && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <label className="cursor-pointer block text-center px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-semibold rounded border border-blue-200 transition">
                          <span>Upload / Replace ID Document</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUploadHelper(f, setEditableGovernmentIdUrl);
                            }}
                          />
                        </label>
                        {editableGovernmentIdUrl && (
                          <button
                            type="button"
                            onClick={() => setEditableGovernmentIdUrl(null)}
                            className="text-[10px] text-rose-600 hover:underline block mx-auto"
                          >
                            Revert ID Document
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* E-Signature */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-bold text-xs">Electronic Signature</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                          Contract Signer
                        </span>
                      </div>
                      {(editableESignatureUrl || selectedApp.eSignatureUrl) ? (
                        <div className="w-36 h-24 mx-auto rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center bg-slate-50 relative shadow-2xs">
                          <img
                            src={editableESignatureUrl || selectedApp.eSignatureUrl}
                            alt="Signature"
                            className="max-h-20 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-36 h-24 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          Unsigned
                        </div>
                      )}
                    </div>

                    {isEditingDocuments && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <label className="cursor-pointer block text-center px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-semibold rounded border border-blue-200 transition">
                          <span>Upload / Replace Signature</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUploadHelper(f, setEditableESignatureUrl);
                            }}
                          />
                        </label>
                        {editableESignatureUrl && (
                          <button
                            type="button"
                            onClick={() => setEditableESignatureUrl(null)}
                            className="text-[10px] text-rose-600 hover:underline block mx-auto"
                          >
                            Revert Signature
                          </button>
                        )}
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
                  <ShieldCheck className="w-4 h-4" /> Approve & Generate SAA Agreement (4 Mo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
