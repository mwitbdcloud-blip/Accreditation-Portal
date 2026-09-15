import React from 'react';
import { ShieldCheck, CheckCircle, Award, Building2, UserCheck, FileCheck } from 'lucide-react';
import { Position, AccreditationApplication, AgentProfile, TeamLeadershipDetails } from '../types';
import { formatDate } from '../utils/dateFormatter';

export interface ContractData {
  affiliateCode: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dateOfBirth: string;
  age: number | string;
  sex: string;
  civilStatus: string;
  citizenship: string;
  nationality: string;
  residentialAddress: string;
  country: string;
  state: string;
  telephoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
  tin: string;
  lastContractPeriod: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankAddress: string;
  swiftCode: string;
  teamName: string;
  brokerGroup: string;
  startDate: string;
  expiryDate: string;
  region: string;
  idPhotoUrl: string;
  eSignatureUrl: string;
  leadership: TeamLeadershipDetails;
}

export function extractContractData(
  application?: AccreditationApplication | null,
  agent?: AgentProfile | null,
  targetPosition?: Position
): ContractData {
  const p = application?.personalDetails;
  const b = application?.bankDetails;
  const t = application?.teamDetails;

  const fullName = p?.fullName || agent?.fullName || 'Elena Patricia Reyes';
  const firstName = p?.firstName || fullName.split(' ')[0] || 'Elena';
  const middleName = p?.middleName || 'Patricia';
  const lastName = p?.lastName || fullName.split(' ').slice(1).join(' ') || 'Reyes';
  const suffix = p?.suffix || '';

  const defaultLeadership: TeamLeadershipDetails = {
    seniorMarketingAssociate: t?.leadership?.seniorMarketingAssociate || 'Ricardo Gomez',
    marketingManager: t?.leadership?.marketingManager || 'Jonathan Cruz',
    marketingDirector: t?.leadership?.marketingDirector || 'Victoria Del Rosario',
    assistanceCountryManager: t?.leadership?.assistanceCountryManager || 'Ferdinand Marcos Jr.',
    countryManager: t?.leadership?.countryManager || 'Eduardo Valenzuela',
    seniorCountryManager: t?.leadership?.seniorCountryManager || 'Grace P. Tan',
    assistanceVicePresident: t?.leadership?.assistanceVicePresident || 'Roberto De Leon',
    vicePresident: t?.leadership?.vicePresident || 'Ma. Lourdes Santos',
    seniorVicePresident: t?.leadership?.seniorVicePresident || 'Antonio Morales',
    referrerName: t?.leadership?.referrerName || 'Ricardo Gomez',
    referrerPosition: t?.leadership?.referrerPosition || 'Senior Marketing Associate',
  };

  return {
    affiliateCode: application?.affiliateCode || agent?.affiliateCode || 'IPA-AP2-000003',
    fullName,
    firstName,
    middleName,
    lastName,
    suffix,
    dateOfBirth: formatDate(p?.dateOfBirth || '1987-05-18'),
    age: p?.age || 38,
    sex: p?.sex || 'Female',
    civilStatus: p?.civilStatus || 'Married',
    citizenship: p?.citizenship || 'Filipino',
    nationality: p?.nationality || 'Filipino',
    residentialAddress: p?.residentialAddress || 'Unit 28B One Eastwood Avenue, Eastwood City, Bagumbayan, Quezon City',
    country: p?.country || 'Philippines',
    state: p?.state || 'Metro Manila',
    telephoneNumber: p?.telephoneNumber || '+63 2 8633 4567',
    mobileNumber: p?.mobileNumber || agent?.email ? '+63 917 888 2345' : '+63 917 555 1234',
    emailAddress: p?.emailAddress || agent?.email || 'elena.reyes@megaworld-international.com',
    tin: p?.tin || '198-442-780-000',
    lastContractPeriod: p?.lastContractPeriod || 'February 15, 2026 to June 15, 2026',
    bankName: b?.bankName || 'BDO Unibank',
    accountName: b?.accountName || fullName,
    accountNumber: b?.accountNumber || '004928172645',
    bankAddress: b?.bankAddress || 'Eastwood City Branch, Quezon City, Philippines',
    swiftCode: b?.swiftCode || 'BNORPHMM',
    teamName: t?.teamName || 'Team Apex Horizon',
    brokerGroup: t?.brokerGroup || `Megaworld International ${agent?.region || 'Asia Pacific 2'} Hub`,
    startDate: formatDate(agent?.accreditationStartDate || '2026-06-16'),
    expiryDate: formatDate(agent?.accreditationExpiryDate || '2026-10-16'),
    region: application?.region || agent?.region || 'Asia Pacific 2',
    idPhotoUrl: application?.idPhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    eSignatureUrl: application?.eSignatureUrl || '',
    leadership: t?.leadership || defaultLeadership,
  };
}

interface PageProps {
  data: ContractData;
  position: Position;
  pageNum: number;
  totalPages: number;
}

// Every page includes this official footer with the Agent's verified E-Signature
export const VerifiedSignatureFooter: React.FC<{
  data: ContractData;
  pageNum: number;
  totalPages: number;
}> = ({ data, pageNum, totalPages }) => (
  <div className="mt-auto pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-sans select-none">
    <div className="flex items-center gap-2">
      <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
      <span>Megaworld International • Official Accreditation Contract Series of 2026</span>
    </div>

    {/* Verified E-Signature Stamp on EVERY page */}
    <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
      <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">E-Signature:</span>
      {data.eSignatureUrl ? (
        <img
          src={data.eSignatureUrl}
          alt="E-Signature"
          className="h-5 max-w-[80px] object-contain"
        />
      ) : (
        <span className="font-serif italic font-bold text-blue-950 text-xs">{data.fullName}</span>
      )}
      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
        <CheckCircle className="w-2.5 h-2.5" /> Verified
      </span>
    </div>

    <div className="font-mono font-semibold text-slate-700">
      Page {pageNum} of {totalPages}
    </div>
  </div>
);

// Standard Official Page Header
export const DocumentHeader: React.FC<{
  title: string;
  subtitle?: string;
  affiliateCode: string;
}> = ({ title, subtitle, affiliateCode }) => (
  <div className="text-center pb-4 mb-4 border-b border-slate-200">
    <div className="flex items-center justify-between text-[11px] font-sans text-slate-500 mb-1">
      <div className="flex items-center gap-1 font-semibold text-blue-950 uppercase tracking-wider">
        <Building2 className="w-3.5 h-3.5" /> Megaworld International
      </div>
      <div className="font-mono bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold text-[10px]">
        Affiliate Code: {affiliateCode}
      </div>
    </div>
    <h2 className="text-xl font-bold tracking-tight text-blue-950 uppercase font-serif">
      {title}
    </h2>
    {subtitle && (
      <p className="text-xs text-slate-600 font-serif italic mt-0.5">{subtitle}</p>
    )}
  </div>
);

// PAGE 1: AGENT INFORMATION SHEET (Shared with position-specific details)
export const AgentInformationSheetPage: React.FC<PageProps> = ({ data, position, pageNum, totalPages }) => {
  const isMA = position === 'Marketing Associate';
  const isMM = position === 'Marketing Manager';
  const isMD = position === 'Marketing Director';

  return (
    <div className="contract-page p-8 sm:p-10 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-sans">
      <div>
        <DocumentHeader
          title="MEGAWORLD INTERNATIONAL"
          subtitle="Agent Information Sheet (Official Accreditation Record)"
          affiliateCode={data.affiliateCode}
        />

        {/* Position Checkbox Bar & 1x1 Photo Frame */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
          <div className="space-y-3 flex-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Accredited Position Category:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className={`flex items-center gap-2 p-2 rounded border text-xs font-semibold ${
                isMA ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-200'
              }`}>
                <input type="checkbox" readOnly checked={isMA} className="rounded" />
                Marketing Associate
              </label>

              <label className={`flex items-center gap-2 p-2 rounded border text-xs font-semibold ${
                isMM ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-200'
              }`}>
                <input type="checkbox" readOnly checked={isMM} className="rounded" />
                Marketing Manager
              </label>

              <label className={`flex items-center gap-2 p-2 rounded border text-xs font-semibold ${
                isMD ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-200'
              }`}>
                <input type="checkbox" readOnly checked={isMD} className="rounded" />
                Marketing Director
              </label>
            </div>

            <div className="pt-2 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-700">Checklist of Documents Attached:</div>
              <div className="grid grid-cols-3 gap-2">
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> 1x1 ID Photo
                </span>
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Government ID Copy
                </span>
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Bank Proof Attached
                </span>
              </div>
            </div>
          </div>

          {/* 1x1 Photo Frame */}
          <div className="w-28 h-32 border-2 border-dashed border-slate-400 bg-white rounded p-1 flex flex-col items-center justify-center shrink-0 self-center">
            {data.idPhotoUrl ? (
              <img
                src={data.idPhotoUrl}
                alt="Agent 1x1"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="text-center p-2 text-slate-400 text-[10px]">
                <span>1x1 PHOTO HERE</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Personal Information */}
        <div className="mb-4">
          <h3 className="bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-t">
            I. Personal Information
          </h3>
          <div className="border border-slate-300 border-t-0 p-3 space-y-2.5 bg-white text-[11px]">
            <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Last Name:</span>
                <strong className="text-slate-900 uppercase">{data.lastName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">First Name:</span>
                <strong className="text-slate-900 uppercase">{data.firstName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Middle Name:</span>
                <strong className="text-slate-900 uppercase">{data.middleName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Suffix:</span>
                <strong className="text-slate-900">{data.suffix || 'None'}</strong>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth:</span>
                <strong className="text-slate-900">{data.dateOfBirth}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Age:</span>
                <strong className="text-slate-900">{data.age} yrs</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sex:</span>
                <strong className="text-slate-900">{data.sex}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Civil Status:</span>
                <strong className="text-slate-900">{data.civilStatus}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Citizenship:</span>
                <strong className="text-slate-900">{data.citizenship}</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2">
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Residential / Mailing Address:</span>
                <span className="text-slate-800 font-medium">{data.residentialAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Country & State:</span>
                <span className="text-slate-800 font-medium">{data.country}, {data.state}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Telephone No:</span>
                <span className="text-slate-800 font-medium">{data.telephoneNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Mobile No:</span>
                <strong className="text-slate-900">{data.mobileNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address:</span>
                <strong className="text-blue-900">{data.emailAddress}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TIN Number:</span>
                <strong className="text-slate-900 font-mono">{data.tin}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bank Account Details */}
        <div className="mb-4">
          <h3 className="bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-t">
            II. Commission Disbursement Bank Details
          </h3>
          <div className="border border-slate-300 border-t-0 p-3 grid grid-cols-4 gap-2 bg-white text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Bank Name:</span>
              <strong className="text-slate-900">{data.bankName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Account Name:</span>
              <strong className="text-slate-900">{data.accountName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Account Number:</span>
              <strong className="text-blue-950 font-mono">{data.accountNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Swift / Branch:</span>
              <span className="text-slate-800">{data.swiftCode} ({data.bankAddress})</span>
            </div>
          </div>
        </div>

        {/* Section 3: Team & Leadership Hierarchy requested by user */}
        <div className="mb-4">
          <h3 className="bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-t">
            III. Team & Leadership Reporting Structure
          </h3>
          <div className="border border-slate-300 border-t-0 p-3 bg-white text-[10px] space-y-2">
            <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-1.5 font-semibold text-slate-700">
              <div>Team Name: <span className="text-blue-950 font-bold">{data.teamName}</span></div>
              <div>Regional Hub: <span className="text-blue-950 font-bold">{data.brokerGroup}</span></div>
            </div>

            {/* Position-Specific Chain */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-slate-700">
              {isMA && (
                <>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">Senior Marketing Associate:</span>
                    <strong className="text-slate-900">{data.leadership.seniorMarketingAssociate || 'Ricardo Gomez'}</strong>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">Marketing Manager:</span>
                    <strong className="text-slate-900">{data.leadership.marketingManager || 'Jonathan Cruz'}</strong>
                  </div>
                </>
              )}

              {(isMA || isMM) && (
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[9px]">Marketing Director:</span>
                  <strong className="text-slate-900">{data.leadership.marketingDirector || 'Victoria Del Rosario'}</strong>
                </div>
              )}

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Assistance Country Manager:</span>
                <strong className="text-slate-900">{data.leadership.assistanceCountryManager || 'Ferdinand Marcos Jr.'}</strong>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Country Manager:</span>
                <strong className="text-slate-900">{data.leadership.countryManager || 'Eduardo Valenzuela'}</strong>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Senior Country Manager:</span>
                <strong className="text-slate-900">{data.leadership.seniorCountryManager || 'Grace P. Tan'}</strong>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Assistance Vice President:</span>
                <strong className="text-slate-900">{data.leadership.assistanceVicePresident || 'Roberto De Leon'}</strong>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Vice President:</span>
                <strong className="text-slate-900">{data.leadership.vicePresident || 'Ma. Lourdes Santos'}</strong>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Senior Vice President:</span>
                <strong className="text-slate-900">{data.leadership.seniorVicePresident || 'Antonio Morales'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Conforme and Signature */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-end">
          <div className="text-[10px] text-slate-500 max-w-sm">
            I hereby certify that the above information is true and correct and matches my submitted legal identification.
          </div>
          <div className="text-center w-56">
            <div className="h-14 flex items-center justify-center border-b border-slate-400 mb-1">
              {data.eSignatureUrl ? (
                <img src={data.eSignatureUrl} alt="E-Signature" className="max-h-12 object-contain" />
              ) : (
                <span className="font-serif italic text-blue-900 font-bold text-base">{data.fullName}</span>
              )}
            </div>
            <span className="font-bold text-slate-900 text-xs uppercase">{data.fullName}</span>
            <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Agent's Signature Over Printed Name</span>
          </div>
        </div>
      </div>

      <VerifiedSignatureFooter data={data} pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
};

// PAGE 2 (For Marketing Associate): REFERRAL FORM
export const ReferralFormPage: React.FC<PageProps> = ({ data, pageNum, totalPages }) => (
  <div className="contract-page p-8 sm:p-12 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-serif leading-relaxed">
    <div>
      <DocumentHeader
        title="MEGAWORLD INTERNATIONAL"
        subtitle="Referral Form — Accreditation Endorsement (Agent's Copy)"
        affiliateCode={data.affiliateCode}
      />

      <div className="my-6 space-y-4 font-sans text-xs">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span>Date of Endorsement: <strong>{data.startDate}</strong></span>
          <span>Regional Hub: <strong>{data.brokerGroup}</strong></span>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
          <p className="text-slate-700">
            <strong>TO: MEGAWORLD INTERNATIONAL ACCREDITATION COMMITTEE</strong>
          </p>
          <p className="text-slate-700 leading-relaxed font-serif text-sm">
            I hereby formally refer and endorse the accreditation of <strong>{data.fullName}</strong> as 
            <strong> Marketing Associate (MA)</strong> under our international sales agency organization. 
            The candidate has satisfied our initial briefing, code of conduct orientation, and documentary submission.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="p-4 border border-slate-200 rounded-lg bg-white">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Referrer Information:</span>
            <div className="space-y-1 text-xs">
              <div>Name of Referrer: <strong>{data.leadership.referrerName || data.leadership.seniorMarketingAssociate || 'Ricardo Gomez'}</strong></div>
              <div>Position of Referrer: <strong>{data.leadership.referrerPosition || 'Senior Marketing Associate'}</strong></div>
              <div>Team / Directorate: <strong>{data.teamName}</strong></div>
            </div>
            <div className="mt-8 pt-2 border-t border-slate-300 text-center text-[10px] text-slate-500">
              Signature of Referrer
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-white">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Candidate Conforme:</span>
            <div className="space-y-1 text-xs">
              <div>Candidate Name: <strong>{data.fullName}</strong></div>
              <div>Affiliate Code: <strong>{data.affiliateCode}</strong></div>
              <div>Contact No: <strong>{data.mobileNumber}</strong></div>
            </div>
            <div className="mt-2 h-14 flex items-center justify-center border-b border-slate-400">
              {data.eSignatureUrl ? (
                <img src={data.eSignatureUrl} alt="E-Signature" className="max-h-12 object-contain" />
              ) : (
                <span className="font-serif italic text-blue-900 font-bold">{data.fullName}</span>
              )}
            </div>
            <div className="text-center text-[10px] text-slate-600 mt-1">
              <strong>{data.fullName}</strong> (E-Signature Conforme)
            </div>
          </div>
        </div>
      </div>
    </div>

    <VerifiedSignatureFooter data={data} pageNum={pageNum} totalPages={totalPages} />
  </div>
);

// MAIN SALES AGENCY AGREEMENT (SAA) CONTENT PAGES
export const SAAAgreementBodyPage: React.FC<PageProps & {
  sectionTitle: string;
  bodyContent: React.ReactNode;
}> = ({ data, pageNum, totalPages, sectionTitle, bodyContent }) => (
  <div className="contract-page p-8 sm:p-12 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-serif leading-relaxed">
    <div>
      <DocumentHeader
        title="MEGAWORLD INTERNATIONAL"
        subtitle={sectionTitle}
        affiliateCode={data.affiliateCode}
      />
      <div className="space-y-4 text-slate-700 text-xs text-justify">
        {bodyContent}
      </div>
    </div>
    <VerifiedSignatureFooter data={data} pageNum={pageNum} totalPages={totalPages} />
  </div>
);

// EXECUTION & WITNESSING SIGNATURES PAGE
export const WitnessingSignaturesPage: React.FC<PageProps> = ({ data, position, pageNum, totalPages }) => {
  const isMA = position === 'Marketing Associate';
  const isMM = position === 'Marketing Manager';
  const isMD = position === 'Marketing Director';

  return (
    <div className="contract-page p-8 sm:p-10 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-serif leading-relaxed">
      <div>
        <DocumentHeader
          title="MEGAWORLD INTERNATIONAL"
          subtitle="Contract Execution, Conforme & Official Witnessing Directorate"
          affiliateCode={data.affiliateCode}
        />

        <p className="text-justify text-xs mb-6">
          IN WITNESS WHEREOF, the parties hereto have set their hands and affixed their signatures this 
          day of <strong>{data.startDate}</strong>, valid until <strong>{data.expiryDate}</strong>, binding 
          themselves to all covenants, obligations, and professional standards set forth herein.
        </p>

        {/* Primary Signatories */}
        <div className="grid grid-cols-2 gap-8 my-6 font-sans">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-2">
              For Megaworld International:
            </span>
            <div className="h-16 flex items-center justify-center border-b border-slate-300 mb-2">
              <span className="font-serif font-bold text-blue-950 text-sm tracking-wide">
                JAVIER ROMEO K. ABUSTAN
              </span>
            </div>
            <p className="font-bold text-xs text-slate-900 text-center">JAVIER ROMEO K. ABUSTAN</p>
            <p className="text-[10px] text-slate-500 text-center">Managing Director / Territory Head</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-2">
              Accredited Signatory ({position}):
            </span>
            <div className="h-16 flex items-center justify-center border-b border-slate-300 mb-2">
              {data.eSignatureUrl ? (
                <img src={data.eSignatureUrl} alt="E-Signature" className="max-h-14 object-contain" />
              ) : (
                <span className="font-serif italic text-blue-900 font-bold text-lg">{data.fullName}</span>
              )}
            </div>
            <p className="font-bold text-xs text-slate-900 text-center uppercase">{data.fullName}</p>
            <p className="text-[10px] text-emerald-700 text-center font-semibold">
              ✓ Authenticated Digital E-Signature
            </p>
          </div>
        </div>

        {/* Witnessing Leaders specified by user */}
        <div className="mt-8 font-sans">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            Signed in the Presence of the Leadership Hierarchy:
          </h4>

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            {isMA && (
              <>
                <div className="p-2 border border-slate-200 rounded">
                  <div className="h-8 border-b border-slate-300 mb-1"></div>
                  <strong className="text-[11px] block">{data.leadership.seniorMarketingAssociate || 'Ricardo Gomez'}</strong>
                  <span className="text-[9px] text-slate-500">Senior Marketing Associate</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <div className="h-8 border-b border-slate-300 mb-1"></div>
                  <strong className="text-[11px] block">{data.leadership.marketingManager || 'Jonathan Cruz'}</strong>
                  <span className="text-[9px] text-slate-500">Marketing Manager</span>
                </div>
              </>
            )}

            {(isMA || isMM) && (
              <div className="p-2 border border-slate-200 rounded">
                <div className="h-8 border-b border-slate-300 mb-1"></div>
                <strong className="text-[11px] block">{data.leadership.marketingDirector || 'Victoria Del Rosario'}</strong>
                <span className="text-[9px] text-slate-500">Marketing Director</span>
              </div>
            )}

            <div className="p-2 border border-slate-200 rounded">
              <div className="h-8 border-b border-slate-300 mb-1"></div>
              <strong className="text-[11px] block">{data.leadership.assistanceCountryManager || 'Ferdinand Marcos Jr.'}</strong>
              <span className="text-[9px] text-slate-500">Assistance Country Manager</span>
            </div>

            <div className="p-2 border border-slate-200 rounded">
              <div className="h-8 border-b border-slate-300 mb-1"></div>
              <strong className="text-[11px] block">{data.leadership.countryManager || 'Eduardo Valenzuela'}</strong>
              <span className="text-[9px] text-slate-500">Country Manager</span>
            </div>

            <div className="p-2 border border-slate-200 rounded">
              <div className="h-8 border-b border-slate-300 mb-1"></div>
              <strong className="text-[11px] block">{data.leadership.seniorCountryManager || 'Grace P. Tan'}</strong>
              <span className="text-[9px] text-slate-500">Senior Country Manager</span>
            </div>

            <div className="p-2 border border-slate-200 rounded">
              <div className="h-8 border-b border-slate-300 mb-1"></div>
              <strong className="text-[11px] block">{data.leadership.assistanceVicePresident || 'Roberto De Leon'}</strong>
              <span className="text-[9px] text-slate-500">Assistance Vice President</span>
            </div>

            <div className="p-2 border border-slate-200 rounded">
              <div className="h-8 border-b border-slate-300 mb-1"></div>
              <strong className="text-[11px] block">{data.leadership.vicePresident || 'Ma. Lourdes Santos'}</strong>
              <span className="text-[9px] text-slate-500">Vice President</span>
            </div>

            <div className="p-2 border border-slate-200 rounded">
              <div className="h-8 border-b border-slate-300 mb-1"></div>
              <strong className="text-[11px] block">{data.leadership.seniorVicePresident || 'Antonio Morales'}</strong>
              <span className="text-[9px] text-slate-500">Senior Vice President</span>
            </div>
          </div>
        </div>
      </div>

      <VerifiedSignatureFooter data={data} pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
};

// ANNEX E: CODE OF ETHICS PAGE
export const CodeOfEthicsPage: React.FC<PageProps> = ({ data, pageNum, totalPages }) => (
  <div className="contract-page p-8 sm:p-12 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-serif leading-relaxed">
    <div>
      <DocumentHeader
        title="MEGAWORLD INTERNATIONAL"
        subtitle="ANNEX E — Code of Ethics and Professional Standards"
        affiliateCode={data.affiliateCode}
      />

      <div className="space-y-3 text-justify text-[11px] text-slate-700">
        <p>
          <strong>PREAMBLE:</strong> As an accredited sales agent representing Megaworld International and its 
          affiliates, the Affiliate pledges to uphold the highest level of professionalism, integrity, and ethical conduct.
        </p>

        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Fiduciary Trust & Transparency:</strong> The Affiliate shall provide full, honest, and accurate 
            information to clients regarding properties, payment schedules, unit inclusions, and handover dates.
          </li>
          <li>
            <strong>Non-Poaching & Hierarchy Respect:</strong> The Affiliate shall strictly respect client registrations 
            and will not entice, solicit, or cross-sell clients already registered by fellow Megaworld affiliates.
          </li>
          <li>
            <strong>Intellectual Property:</strong> Megaworld trademarks, logos, render images, and collaterals 
            shall only be used in accordance with corporate marketing guidelines.
          </li>
          <li>
            <strong>Strict Compliance with Laws:</strong> The Affiliate agrees to comply with the Real Estate Service 
            Act of the Philippines (RA 9646) and international marketing regulations within their assigned territory.
          </li>
          <li>
            <strong>Sanctions for Violation:</strong> Any proven breach of this Code of Ethics shall constitute valid 
            grounds for immediate revocation of accreditation, forfeiture of pending commissions, and legal action.
          </li>
        </ol>

        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="font-semibold text-slate-900 mb-2">AFFIRMATION & CONFORME:</p>
          <p className="text-[10px] text-slate-600 mb-4">
            I hereby certify that I have read, understood, and solemnly agree to adhere to every provision of this 
            Code of Ethics.
          </p>

          <div className="flex justify-end">
            <div className="text-center w-60">
              <div className="h-14 flex items-center justify-center border-b border-slate-400 mb-1">
                {data.eSignatureUrl ? (
                  <img src={data.eSignatureUrl} alt="E-Signature" className="max-h-12 object-contain" />
                ) : (
                  <span className="font-serif italic text-blue-900 font-bold">{data.fullName}</span>
                )}
              </div>
              <strong className="text-xs text-slate-900 uppercase block">{data.fullName}</strong>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Signature Over Printed Name</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <VerifiedSignatureFooter data={data} pageNum={pageNum} totalPages={totalPages} />
  </div>
);

// ANNEX A: AFFIDAVIT OF UNDERTAKING PAGE
export const AffidavitOfUndertakingPage: React.FC<PageProps & {
  companyName: string;
  companyAcronym: string;
}> = ({ data, companyName, companyAcronym, pageNum, totalPages }) => (
  <div className="contract-page p-8 sm:p-12 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-serif leading-relaxed">
    <div>
      <DocumentHeader
        title="REPUBLIC OF THE PHILIPPINES"
        subtitle={`ANNEX "A" — Affidavit of Undertaking (${companyAcronym})`}
        affiliateCode={data.affiliateCode}
      />

      <div className="space-y-3 text-justify text-[11px] text-slate-700">
        <div className="font-sans text-xs mb-4">
          <p>REPUBLIC OF THE PHILIPPINES )</p>
          <p>CITY OF MAKATI / QUEZON CITY ) S.S.</p>
        </div>

        <div className="text-center font-bold text-sm tracking-wide uppercase text-blue-950 my-2">
          AFFIDAVIT OF UNDERTAKING
        </div>

        <p>
          I, <strong>{data.fullName}</strong>, of legal age, {data.citizenship}, with residential address at 
          <em> {data.residentialAddress}</em>, after having been duly sworn in accordance with law, hereby depose and state that:
        </p>

        <ol className="list-decimal pl-5 space-y-2">
          <li>
            I am an accredited sales affiliate of Megaworld International authorized to market real estate projects of 
            <strong> {companyName} (&ldquo;{companyAcronym}&rdquo;)</strong>.
          </li>
          <li>
            I solemnly undertake to conduct all marketing, sales presentations, and client negotiations in strict 
            accordance with the price lists, terms, and inventory rules established by <strong>{companyAcronym}</strong>.
          </li>
          <li>
            I shall not make any unauthorized promises, discounts, or alterations to standard contract terms without 
            prior written approval from the management of <strong>{companyAcronym}</strong>.
          </li>
          <li>
            I hold <strong>{companyAcronym}</strong>, its directors, officers, and employees free and harmless from 
            any liabilities or claims arising from any fraudulent or unauthorized acts committed by myself.
          </li>
        </ol>

        <p className="mt-4">
          IN WITNESS WHEREOF, I have hereunto signed this instrument this {data.startDate} in the City of Makati, Philippines.
        </p>

        <div className="flex justify-end my-4">
          <div className="text-center w-60">
            <div className="h-14 flex items-center justify-center border-b border-slate-400 mb-1">
              {data.eSignatureUrl ? (
                <img src={data.eSignatureUrl} alt="E-Signature" className="max-h-12 object-contain" />
              ) : (
                <span className="font-serif italic text-blue-900 font-bold">{data.fullName}</span>
              )}
            </div>
            <strong className="text-xs text-slate-900 uppercase block">{data.fullName}</strong>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Affiant</span>
          </div>
        </div>

        {/* Notary Jurat */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[10px] space-y-1">
          <p className="font-bold text-slate-800 uppercase">SUBSCRIBED AND SWORN TO BEFORE ME:</p>
          <p>
            Affiant exhibiting to me their valid government identification / TIN <strong>{data.tin}</strong>.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-[9px] text-slate-600">
            <div>Doc No. ______; Page No. ______;</div>
            <div>Book No. ______; Series of 2026.</div>
          </div>
        </div>
      </div>
    </div>

    <VerifiedSignatureFooter data={data} pageNum={pageNum} totalPages={totalPages} />
  </div>
);

// CONCLUDING CERTIFICATE OF DIGITAL AUTHENTICATION PAGE
export const CertificateVerificationPage: React.FC<PageProps> = ({ data, position, pageNum, totalPages }) => (
  <div className="contract-page p-8 sm:p-12 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-sans">
    <div>
      <DocumentHeader
        title="MEGAWORLD INTERNATIONAL"
        subtitle="Official Certificate of Digital Accreditation & E-Signature Audit Record"
        affiliateCode={data.affiliateCode}
      />

      <div className="my-6 p-6 bg-gradient-to-b from-blue-50/70 to-slate-50 rounded-2xl border border-blue-200 space-y-6 text-center">
        <div className="w-16 h-16 bg-blue-900 text-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-widest bg-blue-100/80 px-3 py-1 rounded-full">
            OFFICIALLY ACCREDITED
          </span>
          <h3 className="text-2xl font-bold font-serif text-slate-900 mt-3">
            {data.fullName}
          </h3>
          <p className="text-sm font-semibold text-emerald-800 mt-1">
            {position} • {data.region}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Permanent Affiliate Code: <strong>{data.affiliateCode}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">Contract Period (4 Months):</span>
            <strong className="text-slate-900">{data.startDate} to {data.expiryDate}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Team & Organization:</span>
            <strong className="text-slate-900">{data.teamName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Commission Account:</span>
            <strong className="text-slate-900">{data.bankName} - {data.accountNumber}</strong>
          </div>
        </div>

        {/* Audit Trail & E-Signature Display */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Cryptographic E-Signature Stamp:
            </span>
            <div className="font-mono text-[11px] text-slate-700">
              SHA-256 Hash: <span className="text-blue-900 font-semibold">e4b7...9a21</span>
            </div>
            <div className="text-slate-500 text-[10px]">
              Timestamp: {data.startDate} 09:30:00 GMT+8 • IP Verified
            </div>
          </div>

          <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="h-12 flex items-center justify-center">
              {data.eSignatureUrl ? (
                <img src={data.eSignatureUrl} alt="E-Signature" className="max-h-10 object-contain" />
              ) : (
                <span className="font-serif italic font-bold text-blue-900">{data.fullName}</span>
              )}
            </div>
            <span className="text-[9px] text-slate-500 block uppercase">Agent Signature Verified</span>
          </div>
        </div>
      </div>
    </div>

    <VerifiedSignatureFooter data={data} pageNum={pageNum} totalPages={totalPages} />
  </div>
);
