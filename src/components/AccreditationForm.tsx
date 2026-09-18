import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Upload,
  User,
  CreditCard,
  Users,
  FileCheck,
  Camera,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AgentProfile,
  AccreditationApplication,
  Position,
  ApplicationType,
} from '../types';
import { formatDate, calculateAgeFromDob } from '../utils/dateFormatter';
import { SignaturePad } from './SignaturePad';
import { api } from '../services/api';

interface AccreditationFormProps {
  agent: AgentProfile;
  existingApplication?: AccreditationApplication | null;
  onSubmitSuccess: () => void;
  onRequestPositionAccess: (position: Position) => void;
}

export const AccreditationForm: React.FC<AccreditationFormProps> = ({
  agent,
  existingApplication,
  onSubmitSuccess,
  onRequestPositionAccess,
}) => {
  // Selected position & type
  const [selectedPosition, setSelectedPosition] = useState<Position>(
    (agent.position as Position) || 'Marketing Associate'
  );

  const isRenewalEligible = agent.renewalEligibility || agent.accreditationStatus === 'Expired' || agent.accreditationStatus === 'Expiring Soon';
  const hasActiveRecord = agent.accreditationStatus === 'Active' || agent.accreditationStatus === 'Expiring Soon';

  const [applicationType, setApplicationType] = useState<ApplicationType>(
    isRenewalEligible ? 'Renewal' : 'New'
  );

  // Form Fields - Personal Details (Initialize with existing application or leave blank for new registrants)
  // Initial Form State - personal details with agent profile fallback
  const initialPersonal = existingApplication?.personalDetails || agent.personalDetails;
  const initialBank = existingApplication?.bankDetails || agent.bankDetails;
  const initialTeam = existingApplication?.teamDetails || agent.teamDetails;

  const [firstName, setFirstName] = useState(initialPersonal?.firstName || agent.fullName.split(' ')[0] || '');
  const [middleName, setMiddleName] = useState(initialPersonal?.middleName || '');
  const [lastName, setLastName] = useState(initialPersonal?.lastName || agent.fullName.split(' ').slice(1).join(' ') || '');
  const [suffix, setSuffix] = useState(initialPersonal?.suffix || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialPersonal?.dateOfBirth || '');
  const [age, setAge] = useState<number | string>(() => {
    if (initialPersonal?.age) return initialPersonal.age;
    if (initialPersonal?.dateOfBirth) {
      return calculateAgeFromDob(initialPersonal.dateOfBirth);
    }
    return '';
  });
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other' | ''>((initialPersonal?.sex as any) || '');
  const [civilStatus, setCivilStatus] = useState(initialPersonal?.civilStatus || '');
  const [citizenship, setCitizenship] = useState(initialPersonal?.citizenship || initialPersonal?.nationality || '');
  const [nationality, setNationality] = useState(initialPersonal?.nationality || '');
  const [residentialAddress, setResidentialAddress] = useState(initialPersonal?.residentialAddress || '');
  const [country, setCountry] = useState(initialPersonal?.country || '');
  const [state, setState] = useState(initialPersonal?.state || '');
  const [telephoneNumber, setTelephoneNumber] = useState(initialPersonal?.telephoneNumber || '');
  const [mobileNumber, setMobileNumber] = useState(initialPersonal?.mobileNumber || agent.mobileNumber || '');
  const [emailAddress, setEmailAddress] = useState(initialPersonal?.emailAddress || agent.email || '');
  const [tin, setTin] = useState(initialPersonal?.tin || '');
  const [lastContractPeriod, setLastContractPeriod] = useState(initialPersonal?.lastContractPeriod || '');
  const [idMatchConfirmed, setIdMatchConfirmed] = useState(initialPersonal?.idMatchConfirmed || false);

  // Bank Details (with agent profile fallback)
  const [bankName, setBankName] = useState(initialBank?.bankName || '');
  const [accountName, setAccountName] = useState(initialBank?.accountName || agent.fullName || '');
  const [accountNumber, setAccountNumber] = useState(initialBank?.accountNumber || '');
  const [bankAddress, setBankAddress] = useState(initialBank?.bankAddress || '');
  const [swiftCode, setSwiftCode] = useState(initialBank?.swiftCode || '');

  // Team Details & Leadership Hierarchy (with agent profile fallback)
  const [teamName, setTeamName] = useState(initialTeam?.teamName || '');
  const [upline, setUpline] = useState(initialTeam?.upline || '');
  const [teamLeader, setTeamLeader] = useState(initialTeam?.teamLeader || '');
  const [brokerGroup, setBrokerGroup] = useState(initialTeam?.brokerGroup || `Megaworld International ${agent.region} Hub`);

  // Leadership chains
  const [seniorMarketingAssociate, setSeniorMarketingAssociate] = useState(
    initialTeam?.leadership?.seniorMarketingAssociate || ''
  );
  const [marketingManager, setMarketingManager] = useState(
    initialTeam?.leadership?.marketingManager || ''
  );
  const [marketingDirector, setMarketingDirector] = useState(
    initialTeam?.leadership?.marketingDirector || ''
  );
  const [assistanceCountryManager, setAssistanceCountryManager] = useState(
    initialTeam?.leadership?.assistanceCountryManager || ''
  );
  const [countryManager, setCountryManager] = useState(
    initialTeam?.leadership?.countryManager || ''
  );
  const [seniorCountryManager, setSeniorCountryManager] = useState(
    initialTeam?.leadership?.seniorCountryManager || ''
  );
  const [assistanceVicePresident, setAssistanceVicePresident] = useState(
    initialTeam?.leadership?.assistanceVicePresident || ''
  );
  const [vicePresident, setVicePresident] = useState(
    initialTeam?.leadership?.vicePresident || ''
  );
  const [seniorVicePresident, setSeniorVicePresident] = useState(
    initialTeam?.leadership?.seniorVicePresident || ''
  );
  const [referrerName, setReferrerName] = useState(
    initialTeam?.leadership?.referrerName || ''
  );
  const [referrerPosition, setReferrerPosition] = useState(
    initialTeam?.leadership?.referrerPosition || 'Senior Marketing Associate'
  );

  // Sync state when agent or existingApplication changes
  useEffect(() => {
    if (existingApplication) {
      setFirstName(existingApplication.personalDetails?.firstName || agent.fullName.split(' ')[0] || '');
      setMiddleName(existingApplication.personalDetails?.middleName || '');
      setLastName(existingApplication.personalDetails?.lastName || agent.fullName.split(' ').slice(1).join(' ') || '');
      setSuffix(existingApplication.personalDetails?.suffix || '');
      const initialDob = existingApplication.personalDetails?.dateOfBirth || '';
      setDateOfBirth(initialDob);
      const appAge = existingApplication.personalDetails?.age;
      if (appAge !== undefined && appAge !== null && appAge !== '') {
        setAge(appAge);
      } else if (initialDob) {
        setAge(calculateAgeFromDob(initialDob));
      } else {
        setAge('');
      }
      setSex((existingApplication.personalDetails?.sex as any) || '');
      setCivilStatus(existingApplication.personalDetails?.civilStatus || '');
      setCitizenship(existingApplication.personalDetails?.citizenship || existingApplication.personalDetails?.nationality || '');
      setNationality(existingApplication.personalDetails?.nationality || '');
      setResidentialAddress(existingApplication.personalDetails?.residentialAddress || '');
      setCountry(existingApplication.personalDetails?.country || '');
      setState(existingApplication.personalDetails?.state || '');
      setTelephoneNumber(existingApplication.personalDetails?.telephoneNumber || '');
      setMobileNumber(existingApplication.personalDetails?.mobileNumber || agent.mobileNumber || '');
      setEmailAddress(existingApplication.personalDetails?.emailAddress || agent.email || '');
      setTin(existingApplication.personalDetails?.tin || '');
      setLastContractPeriod(existingApplication.personalDetails?.lastContractPeriod || '');
      setIdMatchConfirmed(existingApplication.personalDetails?.idMatchConfirmed || false);

      setBankName(existingApplication.bankDetails?.bankName || '');
      setAccountName(existingApplication.bankDetails?.accountName || agent.fullName || '');
      setAccountNumber(existingApplication.bankDetails?.accountNumber || '');
      setBankAddress(existingApplication.bankDetails?.bankAddress || '');
      setSwiftCode(existingApplication.bankDetails?.swiftCode || '');

      setTeamName(existingApplication.teamDetails?.teamName || '');
      setUpline(existingApplication.teamDetails?.upline || '');
      setTeamLeader(existingApplication.teamDetails?.teamLeader || '');
      setBrokerGroup(existingApplication.teamDetails?.brokerGroup || `Megaworld International ${agent.region} Hub`);

      const l = existingApplication.teamDetails?.leadership;
      setSeniorMarketingAssociate(l?.seniorMarketingAssociate || '');
      setMarketingManager(l?.marketingManager || '');
      setMarketingDirector(l?.marketingDirector || '');
      setAssistanceCountryManager(l?.assistanceCountryManager || '');
      setCountryManager(l?.countryManager || '');
      setSeniorCountryManager(l?.seniorCountryManager || '');
      setAssistanceVicePresident(l?.assistanceVicePresident || '');
      setVicePresident(l?.vicePresident || '');
      setSeniorVicePresident(l?.seniorVicePresident || '');
      setReferrerName(l?.referrerName || '');
      setReferrerPosition(l?.referrerPosition || 'Senior Marketing Associate');

      setIdPhotoUrl(existingApplication.idPhotoUrl || '');
      setIdPhotoName(existingApplication.idPhotoName || '');
      setGovernmentIdUrl(existingApplication.governmentIdUrl || '');
      setGovernmentIdName(existingApplication.governmentIdName || '');
      setESignatureUrl(existingApplication.eSignatureUrl || '');
      setESignatureConfirmed(existingApplication.eSignatureConfirmed || false);
      setDeclarationAccepted(existingApplication.declarationAccepted || false);
    } else {
      // Fall back to agent profile data if available (e.g. renewal after batch CSV import)
      if (agent.personalDetails) {
        const p = agent.personalDetails;
        setFirstName(p.firstName || agent.fullName.split(' ')[0] || '');
        setMiddleName(p.middleName || '');
        setLastName(p.lastName || agent.fullName.split(' ').slice(1).join(' ') || '');
        setSuffix(p.suffix || '');
        const initialDob = p.dateOfBirth || '';
        setDateOfBirth(initialDob);
        if (p.age !== undefined && p.age !== null && p.age !== '') {
          setAge(p.age);
        } else if (initialDob) {
          setAge(calculateAgeFromDob(initialDob));
        }
        setSex((p.sex as any) || '');
        setCivilStatus(p.civilStatus || '');
        setCitizenship(p.citizenship || p.nationality || '');
        setNationality(p.nationality || '');
        setResidentialAddress(p.residentialAddress || '');
        setCountry(p.country || '');
        setState(p.state || '');
        setTelephoneNumber(p.telephoneNumber || '');
        setMobileNumber(p.mobileNumber || agent.mobileNumber || '');
        setEmailAddress(p.emailAddress || agent.email || '');
        setTin(p.tin || '');
        setLastContractPeriod(p.lastContractPeriod || '');
        setIdMatchConfirmed(p.idMatchConfirmed || false);
      }
      if (agent.bankDetails) {
        const b = agent.bankDetails;
        setBankName(b.bankName || '');
        setAccountName(b.accountName || agent.fullName || '');
        setAccountNumber(b.accountNumber || '');
        setBankAddress(b.bankAddress || '');
        setSwiftCode(b.swiftCode || '');
      }
      if (agent.teamDetails) {
        const t = agent.teamDetails;
        setTeamName(t.teamName || '');
        setUpline(t.upline || '');
        setTeamLeader(t.teamLeader || '');
        setBrokerGroup(t.brokerGroup || `Megaworld International ${agent.region} Hub`);
        const l = t.leadership;
        if (l) {
          setSeniorMarketingAssociate(l.seniorMarketingAssociate || '');
          setMarketingManager(l.marketingManager || '');
          setMarketingDirector(l.marketingDirector || '');
          setAssistanceCountryManager(l.assistanceCountryManager || '');
          setCountryManager(l.countryManager || '');
          setSeniorCountryManager(l.seniorCountryManager || '');
          setAssistanceVicePresident(l.assistanceVicePresident || '');
          setVicePresident(l.vicePresident || '');
          setSeniorVicePresident(l.seniorVicePresident || '');
          setReferrerName(l.referrerName || '');
          setReferrerPosition(l.referrerPosition || 'Senior Marketing Associate');
        }
      }
    }
  }, [existingApplication, agent]);

  // Documents
  const [idPhotoUrl, setIdPhotoUrl] = useState(existingApplication?.idPhotoUrl || '');
  const [idPhotoName, setIdPhotoName] = useState(existingApplication?.idPhotoName || '');
  const [governmentIdUrl, setGovernmentIdUrl] = useState(existingApplication?.governmentIdUrl || '');
  const [governmentIdName, setGovernmentIdName] = useState(existingApplication?.governmentIdName || '');
  const [idBelongsConfirmed, setIdBelongsConfirmed] = useState(false);

  // Signature
  const [eSignatureUrl, setESignatureUrl] = useState(existingApplication?.eSignatureUrl || '');
  const [eSignatureConfirmed, setESignatureConfirmed] = useState(existingApplication?.eSignatureConfirmed || false);

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(existingApplication?.declarationAccepted || false);
  const [allInfoReviewed, setAllInfoReviewed] = useState(false);

  // Loading & Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Auto-assemble Full Name
  const calculatedFullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');

  // Automatically calculate age when registrant indicates Date of Birth
  const handleDateOfBirthChange = (dobValue: string) => {
    setDateOfBirth(dobValue);
    const computedAge = calculateAgeFromDob(dobValue);
    if (computedAge !== '') {
      setAge(computedAge);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'id') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'photo') {
        setIdPhotoUrl(result);
        setIdPhotoName(file.name);
      } else {
        setGovernmentIdUrl(result);
        setGovernmentIdName(file.name);
        setIdBelongsConfirmed(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Position authorization checks
  const isPositionUnlocked = (pos: Position) => {
    return pos === 'Marketing Associate' || agent.unlockedPositions?.includes(pos);
  };

  // Form validity for checklist
  const isPersonalComplete = Boolean(
    firstName && lastName && dateOfBirth && residentialAddress && mobileNumber && emailAddress && idMatchConfirmed
  );
  // Bank details are optional during initial accreditation
  const isBankComplete = Boolean(!bankName || (bankName && accountName && accountNumber));

  // Leadership hierarchy validation based on selected position
  const isLeadershipComplete = (() => {
    // Executive leadership roles marked with (*) in the UI for all positions
    const hasCoreExecutives = Boolean(
      assistanceCountryManager?.trim() &&
      countryManager?.trim() &&
      seniorCountryManager?.trim() &&
      assistanceVicePresident?.trim() &&
      vicePresident?.trim() &&
      seniorVicePresident?.trim()
    );

    if (!hasCoreExecutives) return false;

    if (selectedPosition === 'Marketing Associate') {
      return Boolean(
        seniorMarketingAssociate?.trim() &&
        marketingManager?.trim() &&
        marketingDirector?.trim()
      );
    }

    if (selectedPosition === 'Marketing Manager') {
      return Boolean(marketingDirector?.trim());
    }

    return true;
  })();

  // Team Details is complete if Territory Head is provided AND either:
  // 1) All required leadership hierarchy roles for the position are provided, OR
  // 2) An established upline or team structure exists
  const isTeamComplete = Boolean(
    teamName?.trim() && (isLeadershipComplete || upline?.trim() || teamLeader?.trim())
  );

  const isPhotoComplete = Boolean(idPhotoUrl);
  const isSignatureComplete = Boolean(eSignatureUrl && eSignatureConfirmed);
  const isIdComplete = Boolean(governmentIdUrl && idBelongsConfirmed);

  const canSubmit =
    isPersonalComplete &&
    isBankComplete &&
    isTeamComplete &&
    isPhotoComplete &&
    isSignatureComplete &&
    isIdComplete &&
    allInfoReviewed &&
    declarationAccepted;

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setErrorMessage('Please complete all required items in the Accreditation Checklist before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: Partial<AccreditationApplication> = {
        affiliateCode: agent.affiliateCode,
        applicationType,
        position: selectedPosition,
        region: agent.region,
        personalDetails: {
          firstName,
          middleName,
          lastName,
          suffix,
          fullName: calculatedFullName,
          dateOfBirth,
          age: age ? Number(age) : undefined,
          sex: sex as any,
          civilStatus,
          citizenship,
          nationality,
          residentialAddress,
          country,
          state,
          telephoneNumber,
          mobileNumber,
          emailAddress,
          tin,
          lastContractPeriod,
          idMatchConfirmed,
        },
        bankDetails: {
          bankName,
          accountName,
          accountNumber,
          bankAddress,
          swiftCode,
        },
        teamDetails: {
          teamName: teamName?.trim() || 'Direct Team',
          upline: upline?.trim() || seniorMarketingAssociate?.trim() || referrerName?.trim() || teamName?.trim() || 'Megaworld International Direct',
          teamLeader: teamLeader?.trim() || marketingManager?.trim() || marketingDirector?.trim() || teamName?.trim() || 'Regional Head',
          brokerGroup: brokerGroup?.trim() || `Megaworld International ${agent.region} Hub`,
          leadership: {
            seniorMarketingAssociate: seniorMarketingAssociate?.trim() || '',
            marketingManager: marketingManager?.trim() || '',
            marketingDirector: marketingDirector?.trim() || '',
            assistanceCountryManager: assistanceCountryManager?.trim() || '',
            countryManager: countryManager?.trim() || '',
            seniorCountryManager: seniorCountryManager?.trim() || '',
            assistanceVicePresident: assistanceVicePresident?.trim() || '',
            vicePresident: vicePresident?.trim() || '',
            seniorVicePresident: seniorVicePresident?.trim() || '',
            referrerName: referrerName?.trim() || '',
            referrerPosition: referrerPosition?.trim() || 'Senior Marketing Associate',
          },
        },
        idPhotoUrl,
        idPhotoName: idPhotoName || '1x1_photo.jpg',
        governmentIdUrl,
        governmentIdName: governmentIdName || 'valid_government_id.pdf',
        idVerificationStatus: 'Pending',
        eSignatureUrl,
        eSignatureConfirmed,
        declarationAccepted,
      };

      const result = await api.submitApplication(payload);
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit accreditation.');
      }

      onSubmitSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="accreditation-section" className="space-y-8">
      {/* Permanent Identity Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 shadow-md border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400/20 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                Affiliate Identity
              </span>
              <span className="text-xs text-slate-300">Preserved Across All 4-Month Renewals</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              IPA Code: <span className="font-mono text-amber-400">{agent.affiliateCode}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Registered for <strong>{agent.region}</strong> • Status:{' '}
              <span className="inline-block font-semibold px-2 py-0.5 rounded bg-white/10 text-white">
                {agent.accreditationStatus}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-xs">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <p className="font-semibold text-white">4-Month Accreditation Cycle</p>
              <p className="text-slate-300 text-[11px]">
                {agent.accreditationStartDate && agent.accreditationExpiryDate
                  ? `${formatDate(agent.accreditationStartDate)} → ${formatDate(agent.accreditationExpiryDate)}`
                  : 'Start date + 4 months upon approval'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Position Cards (MA, MM, MD) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">1. Select Accreditation Position</h3>
            <p className="text-xs text-slate-500">Marketing Associate is available by default; higher tiers require approval.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Marketing Associate */}
          <div
            onClick={() => setSelectedPosition('Marketing Associate')}
            className={`cursor-pointer relative p-5 rounded-xl border-2 transition-all ${
              selectedPosition === 'Marketing Associate'
                ? 'border-blue-900 bg-blue-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                Available
              </span>
              {selectedPosition === 'Marketing Associate' && (
                <CheckCircle2 className="w-5 h-5 text-blue-900" />
              )}
            </div>
            <h4 className="font-bold text-slate-900 text-base">MARKETING ASSOCIATE</h4>
            <p className="text-xs text-slate-600 mt-1">
              First Level for International Property Affiliates.
            </p>
          </div>

          {/* Marketing Manager */}
          <div
            className={`relative p-5 rounded-xl border-2 transition-all ${
              isPositionUnlocked('Marketing Manager')
                ? selectedPosition === 'Marketing Manager'
                  ? 'border-blue-900 bg-blue-50/50 shadow-sm cursor-pointer'
                  : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                : 'border-slate-200 bg-slate-50/70 opacity-90'
            }`}
            onClick={() => {
              if (isPositionUnlocked('Marketing Manager')) {
                setSelectedPosition('Marketing Manager');
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isPositionUnlocked('Marketing Manager')
                    ? 'text-emerald-800 bg-emerald-100'
                    : 'text-amber-800 bg-amber-100 flex items-center gap-1'
                }`}
              >
                {!isPositionUnlocked('Marketing Manager') && <Lock className="w-3 h-3" />}
                {isPositionUnlocked('Marketing Manager') ? 'Approved / Unlocked' : 'Approval Required'}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">MARKETING MANAGER</h4>
            <p className="text-xs text-slate-600 mt-1">
              Second Level. Requires BD Staff or Admin authorization based on sales performance and Territory Approval.
            </p>

            {!isPositionUnlocked('Marketing Manager') && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestPositionAccess('Marketing Manager');
                  }}
                  className="w-full text-xs font-semibold text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 py-1.5 px-2.5 rounded-lg transition text-center"
                >
                  Request Manager Approval
                </button>
              </div>
            )}
          </div>

          {/* Marketing Director */}
          <div
            className={`relative p-5 rounded-xl border-2 transition-all ${
              isPositionUnlocked('Marketing Director')
                ? selectedPosition === 'Marketing Director'
                  ? 'border-blue-900 bg-blue-50/50 shadow-sm cursor-pointer'
                  : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                : 'border-slate-200 bg-slate-50/70 opacity-90'
            }`}
            onClick={() => {
              if (isPositionUnlocked('Marketing Director')) {
                setSelectedPosition('Marketing Director');
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isPositionUnlocked('Marketing Director')
                    ? 'text-emerald-800 bg-emerald-100'
                    : 'text-amber-800 bg-amber-100 flex items-center gap-1'
                }`}
              >
                {!isPositionUnlocked('Marketing Director') && <Lock className="w-3 h-3" />}
                {isPositionUnlocked('Marketing Director') ? 'Approved / Unlocked' : 'Approval Required'}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">MARKETING DIRECTOR</h4>
            <p className="text-xs text-slate-600 mt-1">
              Third Level. Requires BD Staff or Admin authorization based on sales performance and Territory Approval.
            </p>

            {!isPositionUnlocked('Marketing Director') && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestPositionAccess('Marketing Director');
                  }}
                  className="w-full text-xs font-semibold text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 py-1.5 px-2.5 rounded-lg transition text-center"
                >
                  Request Director Approval
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Type Selection: New vs Renewal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">2. Type of Contract</h3>
        <p className="text-xs text-slate-500 mb-4">
          Select whether this is your first accreditation cycle or a 4-month renewal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setApplicationType('New')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              applicationType === 'New'
                ? 'border-blue-900 bg-blue-50/40 text-blue-950 font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">NEW ACCREDITATION</span>
              {applicationType === 'New' && <CheckCircle2 className="w-4 h-4 text-blue-900" />}
            </div>
            <p className="text-xs text-slate-500 font-normal mt-1">
              For initial registration or when entering a brand new position tier.
            </p>
          </button>

          <button
            type="button"
            disabled={!isRenewalEligible && hasActiveRecord}
            onClick={() => setApplicationType('Renewal')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              !isRenewalEligible && hasActiveRecord
                ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200'
                : applicationType === 'Renewal'
                ? 'border-emerald-700 bg-emerald-50/40 text-emerald-950 font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">RENEWAL ACCREDITATION</span>
                {isRenewalEligible && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Unlocked
                  </span>
                )}
              </div>
              {applicationType === 'Renewal' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
            </div>
            <p className="text-xs text-slate-500 font-normal mt-1">
              {!isRenewalEligible && hasActiveRecord
                ? 'Renewal automatically unlocks when 4-month term reaches expiry window.'
                : 'Pre-fills previous approved details. Preserves permanent Affiliate Code.'}
            </p>
          </button>
        </div>

        {applicationType === 'Renewal' && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <RefreshCw className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Renewal Mode Active</p>
              <p className="text-slate-600 mt-0.5">
                Please review all pre-filled information carefully before submitting your renewal application.
                If details have changed (e.g. residential address or bank account), you may edit them below.
                Your IPA Code (<strong>{agent.affiliateCode}</strong>) remains your permanent identity.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step Navigation Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] text-xs">
          {[
            { num: 1, label: 'Personal Details', icon: User, complete: isPersonalComplete },
            { num: 2, label: 'Bank Details', icon: CreditCard, complete: isBankComplete },
            { num: 3, label: 'Team Details', icon: Users, complete: isTeamComplete },
            { num: 4, label: '1x1 Photo', icon: Camera, complete: isPhotoComplete },
            { num: 5, label: 'E-Signature', icon: FileCheck, complete: isSignatureComplete },
            { num: 6, label: 'Valid ID / Passport', icon: FileText, complete: isIdComplete },
            { num: 7, label: 'Checklist & Submit', icon: ShieldCheck, complete: canSubmit },
          ].map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : step.complete
                    ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
                {step.complete && !isActive && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmitApplication} className="space-y-6">
        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-900" /> Personal Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Required for the Sales Agency Agreement (SAA) and official identity records.
              </p>
            </div>

            {/* Warning banner */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Strict Legal Name & Birthdate Validation</p>
                <p className="text-amber-800 mt-0.5">
                  Your Full Name and Date of Birth must exactly match the information shown on your submitted valid government ID or passport. This is required to prevent duplicate accreditation records.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Maria Cristina"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Alcantara"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Santos"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Jr., III"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Assembled Legal Name: </span>
              <strong className="text-slate-900 font-semibold">{calculatedFullName || '(Please enter first & last name)'}</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => handleDateOfBirthChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Age *</label>
                  {age !== '' && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Auto-calculated
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min={18}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/60"
                  placeholder="Auto-calculated from DOB"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sex *</label>
                <select
                  required
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="">-- Select Sex --</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Civil Status *</label>
                <select
                  required
                  value={civilStatus}
                  onChange={(e) => setCivilStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="">-- Select Civil Status --</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Citizenship *</label>
                <input
                  type="text"
                  required
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Filipino"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Identification Number (TIN) (Optional)</label>
                <input
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. 245-891-304-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone Number (Landline) (Optional)</label>
                <input
                  type="tel"
                  value={telephoneNumber}
                  onChange={(e) => setTelephoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. +63 2 8555 1234"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. +63 917 555 1234"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address *</label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Residential / Mailing Address *</label>
              <textarea
                rows={2}
                required
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                placeholder="Unit/Street, Barangay/District, City, Country"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Philippines"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province / Region *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Metro Manila"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Contract Period (Complete date format, e.g. January 01, 2026)</label>
                <input
                  type="text"
                  value={lastContractPeriod}
                  onChange={(e) => setLastContractPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. January 01, 2026"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={idMatchConfirmed}
                  onChange={(e) => setIdMatchConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs text-slate-700 font-medium">
                  I confirm that my personal information (Full Legal Name & Date of Birth) exactly matches my submitted valid government ID or passport.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-xs"
              >
                Proceed to Bank Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Bank Details */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-900" /> Bank Details for Commission Disbursements (Optional)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Designated financial information for international and local commission processing. (You may provide this now or update later).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name (Optional)</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. BDO Unibank, BPI, HSBC, Citibank"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name (Optional)</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Exact name registered with bank"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Number / IBAN (Optional)</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. 1092837465"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Branch / Address (Optional)</label>
                <input
                  type="text"
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Branch city or postal address"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-xs"
              >
                Proceed to Team Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Team Details */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-900" /> Team Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Designated sales group and upline structure within Megaworld International.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Territory Head *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="e.g. Territory Head Name"
                />
              </div>
            </div>

            {/* Position-Specific Team & Leadership Hierarchy Section */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950">
                    Official Leadership Hierarchy for {selectedPosition}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    These leaders will appear directly on your generated accreditation contract and witnessing page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isTeamComplete ? (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Required Fields Pending
                    </span>
                  )}
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                    {selectedPosition === 'Marketing Associate'
                      ? '9 Leadership Roles + Referral'
                      : selectedPosition === 'Marketing Manager'
                      ? '7 Leadership Roles'
                      : '6 Executive Directorate Roles'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 1. Senior Marketing Associate (Only for Marketing Associate) */}
                {selectedPosition === 'Marketing Associate' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Senior Marketing Associate *
                    </label>
                    <input
                      type="text"
                      required
                      value={seniorMarketingAssociate}
                      onChange={(e) => setSeniorMarketingAssociate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      placeholder="e.g. Ricardo Gomez"
                    />
                  </div>
                )}

                {/* 2. Marketing Manager (Only for Marketing Associate) */}
                {selectedPosition === 'Marketing Associate' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Marketing Manager *
                    </label>
                    <input
                      type="text"
                      required
                      value={marketingManager}
                      onChange={(e) => setMarketingManager(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      placeholder="e.g. Jonathan Cruz"
                    />
                  </div>
                )}

                {/* 3. Marketing Director (For Marketing Associate and Marketing Manager) */}
                {(selectedPosition === 'Marketing Associate' || selectedPosition === 'Marketing Manager') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Marketing Director *
                    </label>
                    <input
                      type="text"
                      required
                      value={marketingDirector}
                      onChange={(e) => setMarketingDirector(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      placeholder="e.g. Victoria Del Rosario"
                    />
                  </div>
                )}

                {/* 4. Assistance Country Manager (For All Positions) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assistance Country Manager *
                  </label>
                  <input
                    type="text"
                    required
                    value={assistanceCountryManager}
                    onChange={(e) => setAssistanceCountryManager(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="e.g. Ferdinand Marcos Jr."
                  />
                </div>

                {/* 5. Country Manager (For All Positions) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country Manager *
                  </label>
                  <input
                    type="text"
                    required
                    value={countryManager}
                    onChange={(e) => setCountryManager(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="e.g. Eduardo Valenzuela"
                  />
                </div>

                {/* 6. Senior Country Manager (For All Positions) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Senior Country Manager *
                  </label>
                  <input
                    type="text"
                    required
                    value={seniorCountryManager}
                    onChange={(e) => setSeniorCountryManager(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="e.g. Grace P. Tan"
                  />
                </div>

                {/* 7. Assistance Vice President (For All Positions) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assistance Vice President *
                  </label>
                  <input
                    type="text"
                    required
                    value={assistanceVicePresident}
                    onChange={(e) => setAssistanceVicePresident(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="e.g. Roberto De Leon"
                  />
                </div>

                {/* 8. Vice President (For All Positions) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vice President *
                  </label>
                  <input
                    type="text"
                    required
                    value={vicePresident}
                    onChange={(e) => setVicePresident(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="e.g. Ma. Lourdes Santos"
                  />
                </div>

                {/* 9. Senior Vice President (For All Positions) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Senior Vice President *
                  </label>
                  <input
                    type="text"
                    required
                    value={seniorVicePresident}
                    onChange={(e) => setSeniorVicePresident(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="e.g. Antonio Morales"
                  />
                </div>

                {/* Referral Form details for Marketing Associate */}
                {selectedPosition === 'Marketing Associate' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Name of Referrer (Referral Form)
                      </label>
                      <input
                        type="text"
                        value={referrerName}
                        onChange={(e) => setReferrerName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        placeholder="e.g. Ricardo Gomez"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Position of Referrer (Referral Form)
                      </label>
                      <input
                        type="text"
                        value={referrerPosition}
                        onChange={(e) => setReferrerPosition(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        placeholder="e.g. Senior Marketing Associate"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-xs"
              >
                Proceed to 1x1 Photo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 1x1 Photo Upload */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-900" /> 1x1 ID Photo Submission
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Plain background, clear front-facing portrait, professional appearance (JPG or PNG).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
              {/* Photo preview */}
              <div className="relative w-36 h-36 rounded-xl border-2 border-slate-300 bg-white shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                {idPhotoUrl ? (
                  <img src={idPhotoUrl} alt="1x1 Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <User className="w-12 h-12 mx-auto mb-1 text-slate-300" />
                    <span className="text-[11px] block">No Photo Selected</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Upload from Device (JPG or PNG only, Max 10MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                  />
                  {idPhotoName && (
                    <p className="text-xs text-emerald-700 font-medium mt-1">Selected: {idPhotoName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-xs"
              >
                Proceed to E-Signature <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: E-Signature */}
        {currentStep === 5 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-900" /> Electronic Signature
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Draw your signature using your mouse or touchscreen. This will be embedded onto your official Sales Agreement contract.
              </p>
            </div>

            <SignaturePad
              initialValue={eSignatureUrl}
              onSave={(dataUrl) => {
                setESignatureUrl(dataUrl);
                setESignatureConfirmed(Boolean(dataUrl));
              }}
            />

            <div className="pt-3 border-t border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={eSignatureConfirmed}
                  onChange={(e) => setESignatureConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs text-slate-700 font-medium">
                  I confirm that this electronic signature represents my legal signature and may be used for my accreditation documents and official Sales Agency Agreement.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-xs"
              >
                Proceed to Valid ID / Passport <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Government ID / Passport */}
        {currentStep === 6 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-900" /> Valid Government ID / Passport
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload a clear copy of your passport or government-issued identification card (JPG or PNG only).
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Upload Government ID / Passport Document (JPG or PNG only)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileUpload(e, 'id')}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                />
              </div>

              {/* ID preview */}
              {governmentIdUrl && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-12 bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={governmentIdUrl} alt="ID Document Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{governmentIdName || 'Valid ID Document'}</p>
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Document Attached & Ready for BD Verification
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={idBelongsConfirmed}
                    onChange={(e) => setIdBelongsConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    I confirm that the submitted ID/passport is valid and belongs to me.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-xs"
              >
                Proceed to Checklist & Submit <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Final Checklist & Submit */}
        {currentStep === 7 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-900" /> Accreditation Submission Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please verify all requirements before submitting for Admin / BD Staff review.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Checklist items */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-medium text-xs text-slate-800">
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${isPersonalComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  Personal Details completed
                </span>
                <span className={isPersonalComplete ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {isPersonalComplete ? 'Complete' : 'Incomplete'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${isBankComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  Bank Details (Optional)
                </span>
                <span className={bankName ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'}>
                  {bankName ? 'Provided' : 'Optional (Can update later)'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${isTeamComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  Team Details completed
                </span>
                <div className="flex items-center gap-2">
                  <span className={isTeamComplete ? 'text-emerald-700 font-bold' : 'text-amber-600 font-semibold'}>
                    {isTeamComplete ? 'Complete' : 'Incomplete'}
                  </span>
                  {!isTeamComplete && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] text-blue-900 underline font-medium hover:text-blue-700"
                    >
                      Fill Step 3
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${isPhotoComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  1x1 ID Photo uploaded
                </span>
                <span className={isPhotoComplete ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {isPhotoComplete ? 'Attached' : 'Missing'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${isSignatureComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  E-Signature completed & confirmed
                </span>
                <span className={isSignatureComplete ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {isSignatureComplete ? 'Signed' : 'Unsigned'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${isIdComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  Valid Government ID / Passport uploaded
                </span>
                <span className={isIdComplete ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {isIdComplete ? 'Attached' : 'Missing'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${idMatchConfirmed ? 'text-emerald-600' : 'text-slate-300'}`} />
                  Personal information matches ID
                </span>
                <span className={idMatchConfirmed ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {idMatchConfirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Mandatory checkboxes before final submit button */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={allInfoReviewed}
                  onChange={(e) => setAllInfoReviewed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs text-slate-800 font-medium">
                  ☑ I have reviewed all personal details, banking accounts, and uploaded documents, and certify they are accurate.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs text-slate-800 font-medium leading-relaxed">
                  I declare that all information provided herein have been made by me in good faith, verified by me, and to the best of my knowledge and belief, are true and correct as of the date indicated herein; that my signature appearing hereunder is genuine; and that I have not withheld anything which would affect the processing and evaluation of my accreditation. I authorize Megaworld Corporation, its employees, representatives, related companies, and third-party service providers to use, process, and share the information provided herein, with any person or organization, such as banks or other financial institutions, who may assist in the fulfillment of my obligation and to use my contact details to contact me by phone, text, SMS, email, or other electronic communication for marketing of other products or services to provide other services related to my function.
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Back to Documents
              </button>

              <button
                type="submit"
                id="submit-accreditation-btn"
                disabled={!canSubmit || isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Submit {applicationType} Application
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
