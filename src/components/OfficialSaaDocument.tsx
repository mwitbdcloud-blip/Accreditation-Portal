import React from 'react';
import { Position } from '../types';
import { ContractData } from './ContractDocument';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';

interface OfficialSaaDocumentProps {
  contractData: ContractData;
  position: Position;
  viewMode?: 'continuous' | 'paginated';
  currentPageIndex?: number;
  zoomScale?: number;
  onTotalPagesCalculated?: (total: number) => void;
}

export const OfficialSaaDocument: React.FC<OfficialSaaDocumentProps> = ({
  contractData,
  position,
  viewMode = 'continuous',
  currentPageIndex = 0,
  zoomScale = 1,
  onTotalPagesCalculated,
}) => {
  const totalPages = 9;

  React.useEffect(() => {
    if (onTotalPagesCalculated) {
      onTotalPagesCalculated(totalPages);
    }
  }, [totalPages, onTotalPagesCalculated]);

  // Dynamic Position Checkbox matching Page 1
  const isMD = position === 'Marketing Director';
  const isMP = position === 'Marketing Partner';
  const isMM = position === 'Marketing Manager';
  const isSMA = position === 'Senior Marketing Associate';
  const isMA = position === 'Marketing Associate';

  // Primary executive signature renderer with authentic handwritten pen curves
  const renderSignature = (extraClass: string = 'h-14 sm:h-16 w-52 sm:w-60 object-contain') => {
    if (contractData.eSignatureUrl && contractData.eSignatureUrl.trim().length > 10) {
      return (
        <img
          src={contractData.eSignatureUrl}
          alt="E-Signature"
          className={`${extraClass} select-none`}
        />
      );
    }
    // High-resolution flowing executive signature SVG (bold, prominent, legal-grade ink)
    return (
      <svg viewBox="0 0 280 75" className={`${extraClass} select-none overflow-visible`} fill="none">
        {/* Main signature flowing cursive path */}
        <path
          d="M 18 48 C 22 28, 36 12, 48 18 C 58 24, 48 48, 42 56 C 36 62, 28 58, 46 42 C 64 26, 88 18, 98 34 C 104 44, 92 54, 110 40 C 126 28, 142 22, 156 36 C 168 46, 178 30, 192 26 C 208 22, 218 36, 236 30 C 248 26, 258 20, 268 28"
          stroke="#091e42"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Natural cursive loops & ascenders */}
        <path
          d="M 44 20 C 40 4, 52 2, 56 14 C 62 32, 60 48, 64 52"
          stroke="#091e42"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 136 24 C 142 12, 150 14, 148 28 C 146 38, 152 46, 158 48"
          stroke="#091e42"
          strokeWidth="3.0"
          strokeLinecap="round"
        />
        {/* Distinctive executive underline flourish */}
        <path
          d="M 32 60 Q 112 48 198 54 Q 248 56 272 44"
          stroke="#091e42"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 210 57 Q 242 54 262 48"
          stroke="#091e42"
          strokeWidth="2.0"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // Specimen signatures with subtle natural handwritten variations
  const renderSpecimenSignature = (specimenIndex: number, extraClass: string = 'h-16 sm:h-18 w-52 sm:w-60 object-contain') => {
    if (contractData.eSignatureUrl && contractData.eSignatureUrl.trim().length > 10) {
      return (
        <img
          src={contractData.eSignatureUrl}
          alt={`Specimen Signature ${specimenIndex}`}
          className={`${extraClass} select-none`}
        />
      );
    }
    if (specimenIndex === 2) {
      return (
        <svg viewBox="0 0 280 75" className={`${extraClass} select-none overflow-visible`} fill="none">
          <path
            d="M 20 46 C 24 26, 40 10, 50 16 C 60 22, 50 46, 44 54 C 38 60, 30 56, 48 40 C 66 24, 90 16, 100 32 C 106 42, 94 52, 112 38 C 128 26, 144 20, 158 34 C 170 44, 180 28, 194 24 C 210 20, 220 34, 238 28 C 250 24, 260 18, 270 26"
            stroke="#0a224a"
            strokeWidth="3.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M 46 18 C 42 2, 54 4, 58 16 C 64 34, 62 50, 66 54" stroke="#0a224a" strokeWidth="3.1" strokeLinecap="round" />
          <path d="M 28 62 Q 116 46 204 52 Q 252 54 274 42" stroke="#0a224a" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    }
    if (specimenIndex === 3) {
      return (
        <svg viewBox="0 0 280 75" className={`${extraClass} select-none overflow-visible`} fill="none">
          <path
            d="M 16 50 C 20 30, 34 14, 46 20 C 56 26, 46 50, 40 58 C 34 64, 26 60, 44 44 C 62 28, 86 20, 96 36 C 102 46, 90 56, 108 42 C 124 30, 140 24, 154 38 C 166 48, 176 32, 190 28 C 206 24, 216 38, 234 32 C 246 28, 256 22, 266 30"
            stroke="#0c2552"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M 42 22 C 38 6, 50 4, 54 16 C 60 34, 58 50, 62 54" stroke="#0c2552" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 36 58 Q 110 50 192 56 Q 244 58 268 46" stroke="#0c2552" strokeWidth="2.7" strokeLinecap="round" />
        </svg>
      );
    }
    return renderSignature(extraClass);
  };

  // Megaworld Executive Signatory (FVP Henry A. Galagar) on Page 6
  const renderExecutiveSignature = (extraClass: string = 'h-14 sm:h-16 w-48 sm:w-56 object-contain') => (
    <svg viewBox="0 0 260 70" className={`${extraClass} select-none overflow-visible`} fill="none">
      <path
        d="M 16 46 C 24 18, 38 12, 46 26 C 52 38, 38 46, 56 34 C 74 22, 96 16, 112 32 C 120 40, 134 24, 150 22 C 168 20, 186 26, 206 22 C 224 18, 240 26, 252 20"
        stroke="#0c2044"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 28 54 Q 96 42 174 46 Q 218 48 248 38"
        stroke="#0c2044"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );

  // Paraph / Vertical Left-Margin Signature (Pages 2, 3, 4, 5, 7) - Normal prominent size
  const renderParaphSignature = () => (
    <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 pointer-events-none select-none z-20">
      <div className="transform -rotate-90 origin-center flex items-center justify-center w-56 sm:w-64 h-18 sm:h-22">
        {renderSignature('h-14 sm:h-16 w-52 sm:w-60 object-contain drop-shadow-2xs')}
      </div>
    </div>
  );

  // Top Header for Pages 2 to 9 matching reference images
  const renderDocumentTopHeader = (options?: { rightLabel?: string }) => (
    <div className="flex items-center justify-between pb-3 mb-4 select-none relative z-10">
      <div className="flex items-center gap-2">
        <img
          src="/assets/aistudio/Megaworld_International_Logo_blue_4-02_2fcc5f75.png"
          alt="Megaworld International"
          className="h-10 sm:h-12 w-auto object-contain bg-transparent"
        />
      </div>

      <div className="flex items-center gap-2.5">
        {options?.rightLabel && (
          <span className="text-[11px] font-sans font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded shadow-2xs">
            {options.rightLabel}
          </span>
        )}
        {/* Curved blue accent bar matching user reference images */}
        <div className="w-36 sm:w-56 h-3.5 sm:h-4.5 bg-gradient-to-r from-sky-300 via-sky-500 to-[#0060AA] rounded-l-full shadow-2xs" />
      </div>
    </div>
  );

  // Bottom Footer on EVERY page matching reference images
  const renderPageFooter = (pageNumber: number) => (
    <div className="mt-auto pt-3 border-t border-slate-300/80 flex items-center justify-between text-[10px] text-slate-600 font-sans select-none relative z-10">
      <span className="font-serif italic text-slate-700">As of June 1, 2026 (Series of 2026)</span>
      <span className="font-sans font-semibold text-slate-900">{pageNumber}</span>
    </div>
  );

  // Fallback 1x1 photo
  const agentPhoto =
    contractData.idPhotoUrl ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';

  // Fallback government ID
  const agentGovId =
    contractData.governmentIdUrl ||
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop';

  return (
    <div
      className="official-saa-container flex flex-col items-center gap-8 w-full max-w-[820px] mx-auto select-text print:m-0 print:p-0 print:gap-0 print:w-full print:max-w-none"
      style={{
        transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* ============================================================== */}
      {/* PAGE 1: AGENT INFORMATION SHEET (Exact layout of Page 1.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-1"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-11 border border-slate-300/90 text-slate-900 font-sans min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 0 ? 'hidden print:flex' : 'flex'
        }`}
      >
          <div>
            {/* Header: Checkboxes, Company Logo, Address, 1x1 Photo Frame */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-black">
              {/* Position Checkboxes & Accreditation Date */}
              <div className="w-[30%] space-y-1.5 text-[11px] pt-1">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-900 cursor-default">
                    <span className="w-3.5 h-3.5 border border-black flex items-center justify-center font-bold text-xs bg-white">
                      {isMD ? '✓' : ''}
                    </span>
                    <span>Marketing Director (MD)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-900 cursor-default">
                    <span className="w-3.5 h-3.5 border border-black flex items-center justify-center font-bold text-xs bg-white">
                      {isMP ? '✓' : ''}
                    </span>
                    <span>Marketing Partner (MP)</span>
                  </label>
                  {isMM && (
                    <label className="flex items-center gap-1.5 font-semibold text-slate-900 cursor-default">
                      <span className="w-3.5 h-3.5 border border-black flex items-center justify-center font-bold text-xs bg-white">
                        ✓
                      </span>
                      <span>Marketing Manager (MM)</span>
                    </label>
                  )}
                  {(isSMA || isMA) && (
                    <label className="flex items-center gap-1.5 font-semibold text-slate-900 cursor-default">
                      <span className="w-3.5 h-3.5 border border-black flex items-center justify-center font-bold text-xs bg-white">
                        ✓
                      </span>
                      <span>{isSMA ? 'Senior Marketing Associate (SMA)' : 'Marketing Associate (MA)'}</span>
                    </label>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-900">Date of Accreditation:</div>
                  <div className="text-xs font-semibold text-blue-900 border-b border-black pb-0.5 mt-0.5">
                    {contractData.startDate || 'October 28, 2026'}
                  </div>
                </div>
              </div>

              {/* Center: Official Megaworld International Logo and Head Office Address */}
              <div className="w-[45%] flex flex-col items-center text-center">
                <img
                  src="/assets/aistudio/Megaworld_International_Logo_blue_4-02_2fcc5f75.png"
                  alt="Megaworld International"
                  className="h-14 sm:h-16 w-auto object-contain bg-transparent select-none mb-1"
                />
                <div className="text-[9.5px] leading-tight text-slate-700 font-sans">
                  <p>30th Floor Alliance Global Tower</p>
                  <p>36th Street corner 11th Avenue, Uptown Bonifacio</p>
                  <p>Bonifacio Global City, Taguig 1634, Philippines</p>
                </div>
              </div>

              {/* Right: 1x1 ID Picture (Required) Box */}
              <div className="w-[25%] flex justify-end">
                <div className="w-24 h-28 sm:w-28 sm:h-32 border-2 border-black bg-slate-50 flex flex-col items-center justify-center p-1 text-center relative overflow-hidden shrink-0 shadow-2xs">
                  {agentPhoto ? (
                    <img
                      src={agentPhoto}
                      alt="Agent 1x1"
                      className="w-full h-full object-cover rounded-xs"
                    />
                  ) : (
                    <div className="p-2 space-y-1 text-slate-500">
                      <div className="text-[10px] font-bold leading-tight uppercase">1x1</div>
                      <div className="text-[9px] leading-tight">ID Picture</div>
                      <div className="text-[8px] italic leading-tight">(Required)</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-wider text-slate-950 uppercase font-sans">
                AGENT INFORMATION SHEET
              </h2>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 uppercase tracking-tight mt-0.5">
                Kindly complete ALL THE FIELDS below in CAPITAL LETTERS using BLACK/BLUE INK.
              </p>
            </div>

            {/* Primary Grid Table */}
            <div className="border border-black text-[11px] divide-y divide-black">
              {/* Row 1: Status, Contract Period, Effectivity, Referrer */}
              <div className="grid grid-cols-12 divide-x divide-black min-h-[34px] items-stretch">
                <div className="col-span-2 p-1.5 flex items-center justify-center gap-2 bg-slate-50 font-semibold text-[10.5px]">
                  <span>[ ] New</span>
                  <span className="font-bold text-blue-950">[X] Renewal</span>
                </div>
                <div className="col-span-3 p-1.5 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-600 uppercase">LAST CONTRACT PERIOD</span>
                  <span className="font-semibold text-slate-900 truncate">
                    {contractData.lastContractPeriod || 'June 1, 2026 to September 30, 2026'}
                  </span>
                </div>
                <div className="col-span-4 p-1.5 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-600 uppercase">EFFECTIVITY DATE OF NEW CONTRACT</span>
                  <span className="font-semibold text-blue-900 truncate">
                    {contractData.startDate} to {contractData.expiryDate}
                  </span>
                </div>
                <div className="col-span-3 p-1.5 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-600 uppercase">REFERRER/IMMEDIATE UPLINE</span>
                  <span className="font-semibold text-slate-900 truncate">
                    {contractData.leadership?.referrerName || contractData.leadership?.seniorMarketingAssociate || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Row 2: Territory, Country, State */}
              <div className="grid grid-cols-12 divide-x divide-black min-h-[32px] items-stretch">
                <div className="col-span-5 p-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-700">TERRITORY/REGION:</span>
                  <span className="font-bold text-blue-950 uppercase">{contractData.region || 'Europe 3'}</span>
                </div>
                <div className="col-span-4 p-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-700">COUNTRY:</span>
                  <span className="font-bold text-blue-950 uppercase">{contractData.country || 'Germany'}</span>
                </div>
                <div className="col-span-3 p-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-700">STATE:</span>
                  <span className="font-bold text-blue-950 uppercase">{contractData.state || 'Munich'}</span>
                </div>
              </div>

              {/* Section Header: Personal Information */}
              <div className="bg-slate-100 p-1 px-2 font-bold text-xs uppercase tracking-wide text-slate-900 border-b border-black">
                Personal Information
              </div>

              {/* Names: Surname, First Name, Middle Name */}
              <div className="grid grid-cols-12 divide-x divide-black min-h-[34px] items-stretch">
                <div className="col-span-4 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">SURNAME</span>
                  <span className="font-bold text-blue-950 uppercase text-xs">{contractData.lastName || 'Morales'}</span>
                </div>
                <div className="col-span-4 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">FIRST NAME</span>
                  <span className="font-bold text-blue-950 uppercase text-xs">{contractData.firstName || 'Jeffrey'}</span>
                </div>
                <div className="col-span-4 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">MIDDLE NAME</span>
                  <span className="font-bold text-blue-950 uppercase text-xs">{contractData.middleName || '-'}</span>
                </div>
              </div>

              {/* Demographics: Citizenship, Civil Status, Sex, Birthdate, Age */}
              <div className="grid grid-cols-12 divide-x divide-black min-h-[32px] items-stretch">
                <div className="col-span-3 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">CITIZENSHIP</span>
                  <span className="font-semibold text-blue-950 uppercase">{contractData.citizenship || 'German'}</span>
                </div>
                <div className="col-span-2 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">CIVIL STATUS</span>
                  <span className="font-semibold text-blue-950 uppercase">{contractData.civilStatus || 'Single'}</span>
                </div>
                <div className="col-span-2 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">SEX</span>
                  <span className="font-semibold text-blue-950 uppercase">{contractData.sex || 'Male'}</span>
                </div>
                <div className="col-span-3 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">BIRTHDATE</span>
                  <span className="font-semibold text-blue-950">{contractData.dateOfBirth || 'October 17, 1985'}</span>
                </div>
                <div className="col-span-2 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">AGE</span>
                  <span className="font-semibold text-blue-950">{contractData.age || '41'}</span>
                </div>
              </div>

              {/* Residence / Mailing Address */}
              <div className="p-1.5 min-h-[34px]">
                <span className="text-[9px] font-bold text-slate-600 uppercase block">RESIDENCE/MAILING ADDRESS</span>
                <span className="font-semibold text-blue-950 text-xs">
                  {contractData.residentialAddress || 'Ismaningerstr. 37, 81675 Munich, Germany'}
                </span>
              </div>

              {/* Contact: Telephone, Mobile, Email, TIN */}
              <div className="grid grid-cols-12 divide-x divide-black min-h-[32px] items-stretch">
                <div className="col-span-3 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">TELEPHONE NUMBER</span>
                  <span className="font-semibold text-slate-800">{contractData.telephoneNumber || '-'}</span>
                </div>
                <div className="col-span-3 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">MOBILE NUMBER</span>
                  <span className="font-bold text-blue-950">{contractData.mobileNumber || '491726409861'}</span>
                </div>
                <div className="col-span-3 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">EMAIL ADDRESS</span>
                  <span className="font-semibold text-blue-950 truncate block" title={contractData.emailAddress}>
                    {contractData.emailAddress || 'jeffrey_morales@yahoo.com.ph'}
                  </span>
                </div>
                <div className="col-span-3 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">TAX IDENTIFICATION NO.</span>
                  <span className="font-mono font-bold text-slate-900">{contractData.tin || '000-000-000-000'}</span>
                </div>
              </div>

              {/* Section Header: Bank Details */}
              <div className="bg-slate-100 p-1.5 px-2 border-b border-black">
                <div className="font-bold text-xs uppercase tracking-wide text-slate-900">
                  Bank Details (For Commission Purposes)
                </div>
                <div className="text-[9px] italic text-slate-600">
                  NOTE: Required fields for NEW AGENTS and for RENEWING AGENTS WHO WILL UPDATE BANK DETAILS
                </div>
              </div>

              {/* Local Bank Name */}
              <div className="p-1.5 min-h-[30px]">
                <span className="text-[9px] font-bold text-slate-600 uppercase block">LOCAL BANK (Peso Account)</span>
                <span className="font-bold text-blue-950 text-xs">{contractData.bankName || 'Banco De Oro (BDO)'}</span>
              </div>

              {/* Account Name & Account Number */}
              <div className="grid grid-cols-12 divide-x divide-black min-h-[32px] items-stretch">
                <div className="col-span-6 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">ACCOUNT NAME</span>
                  <span className="font-bold text-blue-950 uppercase text-xs">
                    {contractData.accountName || contractData.fullName}
                  </span>
                </div>
                <div className="col-span-6 p-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block">ACCOUNT NUMBER</span>
                  <span className="font-mono font-bold text-blue-950 text-xs">
                    {contractData.accountNumber || '0075 3017 0578'}
                  </span>
                </div>
              </div>
            </div>

            {/* Declaration & Signature Box */}
            <div className="border border-black border-t-0 p-3 bg-white text-[10px] leading-snug space-y-3">
              <p className="text-justify text-slate-800">
                I declare that all information provided herein have been made by me in good faith, verified by me, and
                to the best of my knowledge and belief, are true and correct as of the date indicated herein; that my
                signature appearing hereunder is genuine; and that I have not withheld anything which would affect the
                processing and evaluation of my accreditation. I authorize Megaworld Corporation, its employees,
                representatives, related companies, and third-party service providers to use, process, and share the
                information provided herein, with any person or organization, such as banks or other financial
                institutions, who may assist in the fulfillment of my obligation and to use my contact details to
                contact me by phone, text, SMS, email, or other electronic communication for marketing of other
                products or services to provide other services related to my function.
              </p>

              <div className="grid grid-cols-12 gap-4 pt-2">
                <div className="col-span-7 flex flex-col items-center">
                  <div className="h-16 sm:h-20 flex items-center justify-center">
                    {renderSignature('h-14 sm:h-16 w-52 sm:w-60 object-contain')}
                  </div>
                  <div className="border-t border-black w-full text-center pt-0.5">
                    <span className="font-bold text-xs text-blue-950 uppercase block">{contractData.fullName}</span>
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block">
                      SIGNATURE OVER PRINTED NAME
                    </span>
                  </div>
                </div>

                <div className="col-span-5 flex flex-col items-center justify-end">
                  <div className="h-10 flex items-center justify-center font-bold text-xs text-blue-950">
                    {contractData.startDate || 'October 28, 2026'}
                  </div>
                  <div className="border-t border-black w-full text-center pt-0.5">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block">
                      DATE (MM/DD/YYYY)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirement Checklist */}
            <div className="border border-black border-t-0 p-2.5 bg-slate-50 text-[10px] space-y-1">
              <div className="font-bold text-slate-900 uppercase tracking-wide">Requirement Checklist</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-800">
                <label className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 border border-black flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>1 COMPLETED AGENTS INFORMATION SHEET</span>
                </label>
                <label className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 border border-black flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>1 FULLY SIGNED CONTRACT</span>
                </label>
                <label className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 border border-black flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>PASSPORT COPY OR 1 GOVT.-ISSUED IDs WITH 3 SPECIMEN SIGNATURES.</span>
                </label>
                <label className="flex items-center gap-1.5 font-medium text-slate-500">
                  <span className="w-3 h-3 border border-slate-400 flex items-center justify-center text-[10px]"></span>
                  <span>1 REFERRAL FORM (exclusive for MAs with referrers)</span>
                </label>
              </div>
            </div>
          </div>

          {renderPageFooter(1)}
        </div>

      {/* ============================================================== */}
      {/* PAGE 2: SAA AGREEMENT BODY PAGE 1 (Exact layout of Page 2.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-2"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-serif min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 1 ? 'hidden print:flex' : 'flex'
        }`}
      >
          {renderParaphSignature()}

          <div className="relative z-10 pl-6 sm:pl-8">
            {renderDocumentTopHeader()}

            <div className="text-center my-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-wider text-slate-950 uppercase font-sans">
                {isMD ? 'MARKETING AGREEMENT' : 'SALES AGENCY AGREEMENT'}
              </h2>
              <p className="text-sm sm:text-base font-bold text-slate-900 font-sans mt-0.5">
                {position} {position === 'Marketing Director' ? '(MD)' : position === 'Marketing Manager' ? '(MM)' : ''}
              </p>
            </div>

            <div className="space-y-4 text-justify text-[13px] sm:text-[13.5px] leading-relaxed text-slate-800">
              <p>
                This Agreement was made and executed on{' '}
                <strong className="underline text-blue-950 font-sans">{contractData.startDate || 'October 28, 2026'}</strong> at
                Taguig City, Metro Manila, Philippines, by and between:
              </p>

              <div className="pl-6 space-y-1">
                <p>
                  <strong className="font-sans font-bold text-slate-950">MEGAWORLD CORPORATION</strong>, a corporation
                  duly organized and existing under Philippine laws, with offices at the Megaworld International 30th F,
                  Alliance Global Tower, 36th Street cor. 11th Avenue, Uptown Bonifacio, Taguig City 1634, represented
                  herein by{' '}
                  <strong className="underline font-sans text-blue-950">FVP Henry A. Galagar</strong>
                </p>
                <p className="italic text-center text-slate-700">(hereinafter referred to as &ldquo;Megaworld&rdquo;)</p>
              </div>

              <div className="text-center italic text-xs font-semibold text-slate-600">-and-</div>

              <div className="pl-6 space-y-1">
                <p className="text-center font-bold text-sm text-blue-950 font-sans uppercase">
                  {contractData.fullName}
                </p>
                <p>
                  <strong className="underline font-sans text-blue-950">{contractData.citizenship || 'German'}</strong>{' '}
                  citizen of legal age, with residence address at{' '}
                  <strong className="underline font-sans text-blue-950">
                    {contractData.residentialAddress || 'Ismaningerstr. 37, 81675 Munich, Germany'}
                  </strong>
                </p>
                <p className="italic text-center text-slate-700">
                  (hereinafter referred to as &ldquo;{position}&rdquo;)
                </p>
              </div>

              <div className="pt-2 text-center font-sans font-bold text-xs uppercase tracking-widest text-slate-950">
                WITNESSETH: That -
              </div>

              <p>
                WHEREAS, Megaworld and its affiliates (the &ldquo;Megaworld Group&rdquo;) are engaged in the business of
                developing, marketing, and leasing of real estate properties located in the Philippines;
              </p>

              <p>
                WHEREAS, {position} is an independent contractor and has offered to Megaworld their services for the
                marketing and sale of units in certain real estate projects of the Megaworld Group;
              </p>

              <p>
                WHEREAS, Megaworld is willing to accept such offer under the terms and conditions stated below;
              </p>

              <p>
                NOW, THEREFORE, for and in consideration of the foregoing premises and the conditions and stipulations
                hereinafter set forth, the parties hereto mutually agree as follows:
              </p>

              <div className="space-y-2 pt-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">
                  1. Obligations of {position}
                </h4>
                <p className="font-serif text-[13px] text-justify">
                  {position} shall perform and comply with the following obligations:
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  1.1 To promote and sell units in the real estate projects (the &ldquo;Projects&rdquo;) of the
                  Megaworld Group specified in <span className="underline text-blue-900 font-semibold">Annex &ldquo;A&rdquo;</span> or as may be
                  advised by Megaworld from time to time, at such prices, terms and conditions as may be prescribed by
                  Megaworld. {position} is not authorized to give discounts, special rebates, or concessions of any kind
                  in favor of any person without the express written consent and authority of Megaworld.
                </p>
              </div>
            </div>
          </div>

          {renderPageFooter(2)}
        </div>

      {/* ============================================================== */}
      {/* PAGE 3: SAA AGREEMENT BODY PAGE 2 (Exact layout of Page 3.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-3"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-serif min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 2 ? 'hidden print:flex' : 'flex'
        }`}
      >
          {renderParaphSignature()}

          <div className="relative z-10 pl-6 sm:pl-8">
            {renderDocumentTopHeader()}

            <div className="space-y-3.5 text-justify text-[13px] sm:text-[13.5px] leading-relaxed text-slate-800">
              <p className="pl-4">
                1.2 To recruit, train, manage and motivate its Marketing Network composed of minimum three (3)
                Marketing Managers and three (3) Marketing Associates.
              </p>

              <p className="pl-4">
                1.3 The {position} is not allowed to receive any payments from buyers of units in any of the Projects
                but shall instead cause the immediate remittance to the account of Megaworld of any and all payments of
                buyers of units in any of the Projects by way of telegraphic remittance. In case the telegraphic
                remittance of payments is not possible or feasible, the {position} shall be authorized to receive payments
                from buyers but only in the form of crossed check(s) payable to Megaworld or its designated nominee.
              </p>

              <p className="pl-4">
                1.4 Payments should be deposited by the client directly to the account as specified in{' '}
                <span className="underline text-blue-900 font-semibold">Annex &ldquo;D&rdquo;</span>. Please be reminded that the agents
                are not authorized to receive cash payment from the clients.
              </p>

              <p className="pl-4">
                1.5 To comply with the Sales and Marketing Network Requirement determined by Megaworld and specified in{' '}
                <span className="underline text-blue-900 font-semibold">Annex &ldquo;B&rdquo;</span>.
              </p>

              <p className="pl-4">
                1.6 To maintain the necessary business organizations, facilities, and services to enable it to
                properly perform the marketing and sales functions contemplated under this Agreement, including but not
                limited to setting up and maintaining the appropriate office space and communication facilities. To
                assign at least one staff to oversee day-to-day operations.
              </p>

              <p className="pl-4">
                1.7 To be professional in all its dealings and transactions with clients.
              </p>

              <p className="pl-4">
                1.8 To act strictly in accordance with the authority granted to it under this Agreement. Any act of
                misrepresentation committed by the {position} or any of its agents shall not bind Megaworld but shall be
                the sole liability and responsibility of the {position}.
              </p>

              <p className="pl-4">
                1.9 To comply strictly with all directives, instructions, procedures, guidelines, circulars etc., which
                Megaworld may, from time to time, issue to the {position} in relation to the performance of its duties
                under this agreement.
              </p>

              <div className="space-y-2 pt-2 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">
                  2. Obligations of Megaworld
                </h4>
                <p className="font-serif text-[13px] text-justify">
                  Megaworld shall perform the following obligations:
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  2.1 The Company shall pay {position} commissions in accordance with its existing sales policies and
                  procedures. The applicable commission rates or amounts are set forth in Annex B, while the commission
                  milestones and payment conditions are detailed in{' '}
                  <span className="underline text-blue-900 font-semibold">Annex &ldquo;C&rdquo;</span>. All commissions shall be subject to
                  applicable withholding taxes and other deductions required by law. Commission payments shall be made
                  in Philippine Pesos (PHP) and credited to the Philippine Peso bank account designated by the Agent,
                  provided that such bank account is maintained in the Agent&apos;s name. For wire transfer, the applicable
                  foreign exchange rate shall apply, and any bank charges, transfer fees, intermediary bank charges, or
                  other related costs shall be deducted from the commission proceeds. Only sales that are successfully
                  consummated in accordance with the Company&apos;s sales policies shall qualify for a commission. Sales that
                  are backed out, forfeited, or otherwise not consummated at any stage of the sales process shall not
                  qualify for a commission. If a refund is approved after the corresponding commission has been paid,
                  the amount of such commission may be deducted from any commissions subsequently payable to the Agent.
                </p>
              </div>
            </div>
          </div>

          {renderPageFooter(3)}
        </div>

      {/* ============================================================== */}
      {/* PAGE 4: SAA AGREEMENT BODY PAGE 3 (Exact layout of Page 4.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-4"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-serif min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 3 ? 'hidden print:flex' : 'flex'
        }`}
      >
          {renderParaphSignature()}

          <div className="relative z-10 pl-6 sm:pl-8">
            {renderDocumentTopHeader()}

            <div className="space-y-3.5 text-justify text-[13px] sm:text-[13.5px] leading-relaxed text-slate-800">
              <p className="pl-4">
                2.2 To supply the {position} by way of distribution of sales materials, such as brochures, leaflets,
                price lists, business cards, pamphlet/fliers, etc.; necessary for the discharge by the {position} of
                its obligations under this Agreement.
              </p>

              <div className="space-y-1 pt-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">3. Term</h4>
                <p className="font-serif text-[13px] text-justify">
                  Unless sooner terminated by Megaworld for any of the causes stipulated in Section 6, this Agreement
                  shall be effective for a period of four (4) months from execution of this Agreement (
                  <strong className="underline text-blue-950 font-sans">
                    {contractData.startDate || 'October 28, 2026'} to {contractData.expiryDate || 'February 27, 2027'}
                  </strong>
                  ). This Agreement shall be renewable, at the sole option of Megaworld, for such term as may be agreed
                  upon by the parties.
                </p>
              </div>

              <div className="space-y-1 pt-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">4. Exclusivity</h4>
                <p className="font-serif text-[13px] text-justify">
                  For the duration of this Agreement, the {position} shall not promote, sell, or otherwise deal with,
                  for his/her own account, whether directly or indirectly, or for the account of other persons or
                  entities, real estate projects being developed, owned, or otherwise dealt with by other companies,
                  corporations, partnerships or such other entities engaged in a business or industry in competition
                  with Megaworld in the Philippines.
                </p>
                <p className="font-serif text-[13px] text-justify pt-1">
                  The {position} acknowledges that this Agreement does not preclude Megaworld from promoting or selling,
                  or otherwise dealing with the Projects within the Territory, for its own account or for the account
                  of other persons or entities.
                </p>
              </div>

              <div className="space-y-1 pt-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">5. Pre-termination</h4>
                <p className="font-serif text-[13px] text-justify">
                  Prior to the expiration of the term of this Agreement, Megaworld shall be entitled to terminate this
                  Agreement, upon written notice to {position}, for any of the following causes:
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  6.1 Breach or an attempt to breach, by {position} of any of the terms and conditions of this Agreement;
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  6.2 Fraud and/or any misrepresentation committed by {position} for the purpose of obtaining the
                  consent of Megaworld in entering into this Agreement;
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  6.3 Any change in the government policy and/or laws of the Territory or the Philippines which will
                  render unlawful the performance by Megaworld of its obligations under this Agreement.
                </p>
              </div>

              <div className="space-y-1 pt-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">
                  6. Obligations upon Termination
                </h4>
                <p className="font-serif text-[13px] text-justify">
                  Within ten (10) days from expiration of the term of this Agreement or from receipt by {position} of a
                  written notice of the termination of this Agreement pursuant to Section 6, the {position} shall be
                  obliged to:
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  7.1 Endorse and submit to Megaworld all accounts and/or records of buyers, regardless of the status of
                  said accounts.
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  7.2 Turn over to Megaworld all marketing materials, brochures, pamphlets, fliers, etc. supplied to{' '}
                  {position} by Megaworld;
                </p>
                <p className="font-serif text-[13px] text-justify pl-4">
                  7.3 Settle all outstanding accounts with Megaworld.
                </p>
              </div>
            </div>
          </div>

          {renderPageFooter(4)}
        </div>

      {/* ============================================================== */}
      {/* PAGE 5: SAA AGREEMENT BODY PAGE 4 (Exact layout of Page 5.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-5"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-serif min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 4 ? 'hidden print:flex' : 'flex'
        }`}
      >
          {renderParaphSignature()}

          <div className="relative z-10 pl-6 sm:pl-8">
            {renderDocumentTopHeader()}

            <div className="space-y-4 text-justify text-[13px] sm:text-[13.5px] leading-relaxed text-slate-800">
              <p>
                contained in this Agreement shall be deemed or interpreted to constitute {position} as a partner,
                agent, or employee of Megaworld.
              </p>

              <div className="space-y-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">9. Governing Law</h4>
                <p className="font-serif text-[13px] text-justify">
                  This Agreement shall be construed in accordance with and governed by the laws of the Republic of the
                  Philippines.
                </p>
              </div>

              <div className="space-y-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">10. Venue of Actions</h4>
                <p className="font-serif text-[13px] text-justify">
                  In case of litigation arising from this Agreement, the parties agree that the proper court of Makati
                  City, Philippines shall be the proper venue of all actions to the exclusion of other courts.
                </p>
              </div>

              <div className="space-y-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">11. Amendments</h4>
                <p className="font-serif text-[13px] text-justify">
                  Without prejudice to the directives, instructions, procedures, guidelines, circulars, etc. which may
                  be issued by Megaworld pursuant to Section 1.6, there are no other agreements or understandings
                  between the parties relating to the subject matter of this Agreement. This Agreement supersedes all
                  prior agreements, oral or written, between the parties and is intended as a complete and exclusive
                  statement of the agreement between the parties. No change or modification of this Agreement shall be
                  valid unless the same be in writing and signed by the parties.
                </p>
              </div>

              <div className="space-y-1 font-sans">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">12. Confidentiality</h4>
                <p className="font-serif text-[13px] text-justify">
                  You acknowledge that, in the course of your services under this Agreement, you may be allowed to access
                  to an/or be in possession of Confidential Information of the Company. Accordingly, you expressly agree
                  that such access or possession of Confidential Information is allowed exclusively for the limited
                  purpose of performing your duties and functions. You undertake not to divulge or use such Confidential
                  Information, in any manner, outside of the above-enumerated duties and functions in this Agreement. In
                  case of violation or threatened violation of this clause, you expressly agree that the Company is
                  entitled to immediately terminate this Agreement and/or secure an injunction against you and/or your
                  violation of this provision, in addition to securing payment of such actual damages as the Company may
                  have suffered or incurred.
                </p>
              </div>
            </div>
          </div>

          {renderPageFooter(5)}
        </div>

      {/* ============================================================== */}
      {/* PAGE 6: WITNESSING & SIGNATURES (Exact layout of Page 6.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-6"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-serif min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 5 ? 'hidden print:flex' : 'flex'
        }`}
      >
        <div className="relative z-10 pl-4 sm:pl-6">
          {renderDocumentTopHeader()}

          <div className="space-y-6 pt-4 text-[13px] sm:text-[14px]">
            <p className="text-center">
              IN WITNESS WHEREOF, the parties have hereunto set their hands this{' '}
              <span className="underline font-bold text-blue-950 font-sans">
                {new Date().getDate()}
              </span>{' '}
              day of{' '}
              <span className="underline font-bold text-blue-950 font-sans">
                {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </span>{' '}
              at{' '}
              <span className="underline font-bold text-blue-950 font-sans">Taguig City, Philippines</span>.
            </p>

            {/* Primary Parties Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6">
              {/* Megaworld Corporation */}
              <div className="text-center space-y-1 font-sans">
                <span className="font-bold text-xs uppercase tracking-wider block text-slate-950 mb-1">
                  MEGAWORLD CORPORATION
                </span>
                <div className="h-16 sm:h-20 flex items-center justify-center mb-1">
                  {renderExecutiveSignature('h-14 sm:h-16 w-48 sm:w-56 object-contain')}
                </div>
                <div className="border-b border-black pb-1">
                  <span className="font-bold text-sm text-blue-900 block">FVP Henry A. Galagar</span>
                </div>
                <span className="text-xs text-slate-700 block">Signature over Printed Name</span>
                <span className="text-xs font-bold text-slate-900 block">Territory Head</span>
              </div>

              {/* Agent Signatory */}
              <div className="text-center space-y-1 font-sans">
                <span className="font-bold text-xs uppercase tracking-wider block text-transparent mb-1 select-none">
                  AGENT SIGNATORY
                </span>
                <div className="h-16 sm:h-20 flex items-center justify-center mb-1">
                  {renderSignature('h-14 sm:h-16 w-52 sm:w-60 object-contain')}
                </div>
                <div className="border-b border-black pb-1">
                  <span className="font-bold text-sm text-blue-900 block uppercase">
                    {contractData.fullName}
                  </span>
                </div>
                <span className="text-xs text-slate-700 block">(Signature over Printed Name)</span>
                <span className="text-xs font-bold text-slate-900 block">{position}</span>
              </div>
            </div>

              {/* Witnessing Section */}
              <div className="pt-6 space-y-5 font-sans">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-950 font-sans">
                  Witnessed by:
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-7 pt-2">
                  <div className="text-center space-y-1">
                    <div className="border-b border-black pb-1">
                      <span className="font-bold text-xs text-blue-900 block">Alicia Fe Egli</span>
                    </div>
                    <span className="text-[11px] text-slate-600 block">(Signature over Printed Name)</span>
                    <span className="text-xs font-semibold text-slate-900 block">Sr. Country Manager</span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="border-b border-black pb-1">
                      <span className="font-bold text-xs text-slate-400 block italic">Pending Endorsement</span>
                    </div>
                    <span className="text-[11px] text-slate-600 block">(Signature over Printed Name)</span>
                    <span className="text-xs font-semibold text-slate-900 block">Asst. Country Manager</span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="border-b border-black pb-1">
                      <span className="font-bold text-xs text-blue-900 block">Russeli Galagar</span>
                    </div>
                    <span className="text-[11px] text-slate-600 block">(Signature over Printed Name)</span>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Asst. Vice President/ Vice President
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="border-b border-black pb-1">
                      <span className="font-bold text-xs text-slate-400 block italic">Pending Endorsement</span>
                    </div>
                    <span className="text-[11px] text-slate-600 block">(Signature over Printed Name)</span>
                    <span className="text-xs font-semibold text-slate-900 block">Country Manager</span>
                  </div>
                </div>

                <div className="text-center pt-5">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-950 underline block">
                    JAVIER ROMEO K. ABUSTAN
                  </span>
                  <span className="text-xs font-medium text-slate-700 block">Managing Director</span>
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter(6)}
        </div>

      {/* ============================================================== */}
      {/* PAGE 7: NOTARIAL ACKNOWLEDGMENT (Exact layout of Page 7.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-7"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-serif min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 6 ? 'hidden print:flex' : 'flex'
        }`}
      >
          {renderParaphSignature()}

          <div className="relative z-10 pl-6 sm:pl-8">
            {renderDocumentTopHeader()}

            <div className="space-y-4 text-justify text-[13px] sm:text-[13.5px] leading-relaxed text-slate-800">
              <div className="text-xs font-sans font-bold uppercase text-slate-900 pb-2">
                SIGNED IN THE PRESENCE OF:
              </div>

              <div className="font-sans text-xs flex justify-between">
                <span>REPUBLIC OF THE PHILIPPINES</span>
                <span>(_________________________) S.S.</span>
              </div>

              <p>
                BEFORE ME, a Notary Public for and in the City of Taguig, this{' '}
                <span className="underline font-bold text-blue-950 font-sans">{new Date().getDate()}</span> day of{' '}
                <span className="underline font-bold text-blue-950 font-sans">
                  {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                , personally appeared the following:
              </p>

              {/* Table of Signatories */}
              <div className="space-y-4 pt-1 font-sans text-xs">
                <div className="border-b border-black pb-3">
                  <div className="grid grid-cols-12 gap-2 text-[11px] text-slate-600 font-semibold uppercase">
                    <span className="col-span-4">Name</span>
                    <span className="col-span-4">Comm. Tax Cert. No./ Passport No.</span>
                    <span className="col-span-4">Date/Place Issued</span>
                  </div>
                  <div className="pt-2">
                    <span className="font-bold text-sm text-blue-900 block">FVP Henry A. Galagar</span>
                    <span className="text-[11px] text-slate-700 italic block">
                      in his/her capacity as Vice-President for Sales
                    </span>
                  </div>
                </div>

                <div className="border-b border-black pb-3">
                  <div className="grid grid-cols-12 gap-2 text-[11px] text-slate-600 font-semibold uppercase">
                    <span className="col-span-4">Name</span>
                    <span className="col-span-4">Comm. Tax Cert. No./ Passport No.</span>
                    <span className="col-span-4">Date/Place Issued</span>
                  </div>
                  <div className="pt-2">
                    <span className="font-bold text-sm text-blue-900 block uppercase">{contractData.fullName}</span>
                    <span className="text-[11px] text-slate-700 italic block">
                      in his/her capacity as {position}
                    </span>
                  </div>
                </div>
              </div>

              <p className="pt-2">
                who are known to me and to me known to be the persons who executed the foregoing Marketing Agreement
                and they acknowledged to me that the same is their free and voluntary act and deed and that of the
                corporation which is represented therein.
              </p>

              <div className="pt-8 flex justify-end font-sans">
                <div className="text-center w-56 space-y-1">
                  <div className="border-t border-black pt-1">
                    <span className="font-bold text-xs uppercase tracking-wider block text-slate-900">
                      NOTARY PUBLIC
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 font-mono text-[11px] text-slate-700 space-y-0.5">
                <div>Doc. No. ______;</div>
                <div>Page No. ______;</div>
                <div>Book No. ______;</div>
                <div>Series of 2026</div>
              </div>
            </div>
          </div>

          {renderPageFooter(7)}
        </div>

      {/* ============================================================== */}
      {/* PAGE 8: ANNEX E — CODE OF ETHICS (Exact layout of Page 8.jpg) */}
      {/* ============================================================== */}
      <div
        id="saa-page-8"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-serif min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 7 ? 'hidden print:flex' : 'flex'
        }`}
      >
          <div className="relative z-10 pl-4 sm:pl-6">
            {renderDocumentTopHeader({ rightLabel: "Agent's Copy" })}

            <div className="text-center my-3 font-sans">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Annex E</h3>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 uppercase tracking-wide mt-0.5">
                Code of Ethics
              </h2>
            </div>

            <div className="space-y-3.5 text-justify text-[12.5px] sm:text-[13px] leading-relaxed text-slate-800 font-serif">
              <p>
                The Code of Ethics serves as our guide in our working relationship with our business partners: Megaworld
                VP-Sales, AVP, Senior Country Managers, Country Managers, Assistant Country Managers, Marketing
                Partners, Marketing Managers, and Marketing Associates.
              </p>

              <p>
                We agree to support Megaworld International&apos;s sales policies, programs, regulations and procedures as
                our guide in the professional conduct of our business.
              </p>

              <p>
                We will properly inform our respective network of marketing agents about the Company&apos;s policies,
                programs, regulations and procedures to protect their rights and privileges as business partners.
              </p>

              <p>
                We will encourage our marketing agents to strive for promotion to higher levels of position in the
                Company for personal and professional growth and development.
              </p>

              <p>We will respect the marketing network of our fellow marketing agents by:</p>

              <ol className="list-decimal pl-6 space-y-1 text-slate-800">
                <li>
                  Not recruiting marketing agents from other groups to join one&apos;s own group in Megaworld
                  International, and/or one&apos;s group in other real estate companies or any direct selling company;
                </li>
                <li>Not selling to marketing agents from other groups;</li>
                <li>
                  Encouraging dissatisfied marketing agents from other groups to settle their differences with their
                  current superiors to avoid transfer of sponsorship.
                </li>
              </ol>

              <p>
                We will refrain from conducting other real estate marketing business within Megaworld International&apos;s
                premises and/or during Company-sponsored activities. Likewise, we will refrain from using Company
                resources for other real estate marketing businesses or any other business.
              </p>

              <p>We shall not engage in selling products directly or indirectly competing with Megaworld International.</p>

              <p>
                Together, we agree to police our respective marketing network to protect the rights and privileges of
                our fellow marketing agents.
              </p>

              <p>
                Megaworld International reserves the right to disqualify and/or terminate any Marketing agent (VP-Sales,
                AVP, Senior Country Managers, Country Managers, Assistant Country Managers, Marketing Partners,
                Marketing Managers, Marketing Associates/Sr. Marketing Associates) from doing business with the company
                for failure to comply with these policies and for other reasons whatsoever that will prejudice the
                company&apos;s operations as a whole.
              </p>

              <div className="pt-4 flex flex-col items-center font-sans">
                <div className="h-16 sm:h-20 flex items-center justify-center">
                  {renderSignature('h-14 sm:h-16 w-52 sm:w-60 object-contain')}
                </div>
                <div className="border-t border-black w-64 text-center pt-1">
                  <span className="font-bold text-xs text-blue-900 uppercase block">{contractData.fullName}</span>
                  <span className="text-[10px] text-slate-600 block">(Signature over printed name)</span>
                  <span className="text-xs font-bold text-slate-900 block">{position}</span>
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter(8)}
        </div>

      {/* ========================================================================= */}
      {/* PAGE 9: VALID ID COPY & 3 SPECIMEN SIGNATURES (Exact layout of Page 9.jpg) */}
      {/* ========================================================================= */}
      <div
        id="saa-page-9"
        className={`saa-page-sheet relative w-full bg-white shadow-xl rounded-sm p-8 sm:p-12 border border-slate-300/90 text-slate-900 font-sans min-h-[1080px] flex-col justify-between overflow-hidden print:shadow-none print:border-none print:p-8 ${
          viewMode === 'paginated' && currentPageIndex !== 8 ? 'hidden print:flex' : 'flex'
        }`}
      >
          <div className="relative z-10 pl-4 sm:pl-6">
            {renderDocumentTopHeader({ rightLabel: 'Compliance Attachment' })}

            <div className="text-center my-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest font-sans">
                Official Accreditation Attachment
              </h3>
              <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-wide font-sans mt-0.5">
                VALID GOVERNMENT IDENTIFICATION & 3 SPECIMEN SIGNATURES
              </h2>
            </div>

            {/* Two-Column Layout matching Page 9.jpg */}
            <div className="grid grid-cols-12 gap-6 pt-4 items-start">
              {/* Left Column: 3 Specimen Signatures */}
              <div className="col-span-5 border border-black bg-slate-50/50 p-4 rounded-xs space-y-4">
                <div className="text-center pb-2 border-b border-black">
                  <div className="text-xs font-black uppercase text-slate-950 tracking-wider">
                    3 Specimen Signatures
                  </div>
                  <div className="text-[9px] text-slate-600">Verified against legal identification</div>
                </div>

                {/* Signature 1 */}
                <div className="text-center space-y-1">
                  <div className="h-20 sm:h-22 flex items-center justify-center p-1 bg-white border border-dashed border-slate-400 rounded">
                    {renderSpecimenSignature(1, 'h-16 sm:h-18 w-52 sm:w-60 object-contain')}
                  </div>
                  <div className="border-t border-black pt-1">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                      Specimen Signature 1
                    </span>
                  </div>
                </div>

                {/* Signature 2 */}
                <div className="text-center space-y-1">
                  <div className="h-20 sm:h-22 flex items-center justify-center p-1 bg-white border border-dashed border-slate-400 rounded">
                    {renderSpecimenSignature(2, 'h-16 sm:h-18 w-52 sm:w-60 object-contain')}
                  </div>
                  <div className="border-t border-black pt-1">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                      Specimen Signature 2
                    </span>
                  </div>
                </div>

                {/* Signature 3 */}
                <div className="text-center space-y-1">
                  <div className="h-20 sm:h-22 flex items-center justify-center p-1 bg-white border border-dashed border-slate-400 rounded">
                    {renderSpecimenSignature(3, 'h-16 sm:h-18 w-52 sm:w-60 object-contain')}
                  </div>
                  <div className="border-t border-black pt-1">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                      Specimen Signature 3
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-black text-center text-[10px] text-slate-700">
                  <span className="font-bold text-blue-950 uppercase block">{contractData.fullName}</span>
                  <span className="text-slate-600 block">{position}</span>
                  <span className="text-slate-500 font-mono text-[9px] block">
                    Affiliate Code: {contractData.affiliateCode}
                  </span>
                </div>
              </div>

              {/* Right Column: Copy of Valid ID (Front and Back) */}
              <div className="col-span-7 border border-black bg-white p-4 rounded-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-black">
                  <div className="text-xs font-black uppercase text-slate-950 tracking-wider">
                    Copy of Valid Government ID / Passport
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                </div>

                {/* Valid ID Front Image Frame */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Primary ID Front (or Passport Bio-Page)
                  </span>
                  <div className="w-full h-44 sm:h-48 border border-slate-400 bg-slate-100 rounded flex items-center justify-center overflow-hidden p-1 shadow-xs">
                    {agentGovId ? (
                      <img
                        src={agentGovId}
                        alt="Valid Government ID Front"
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400 text-xs">
                        [ Official Government ID / Passport Front Attached ]
                      </div>
                    )}
                  </div>
                </div>

                {/* Valid ID Back Image Frame */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    ID Document Back / Address Record
                  </span>
                  <div className="w-full h-40 sm:h-44 border border-slate-400 bg-slate-100 rounded flex items-center justify-center overflow-hidden p-1 shadow-xs">
                    {agentGovId ? (
                      <img
                        src={agentGovId}
                        alt="Valid Government ID Back"
                        className="w-full h-full object-contain rounded brightness-95"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400 text-xs">
                        [ Official Government ID / Passport Back Attached ]
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded text-[10px] text-blue-950 space-y-0.5">
                  <div className="font-bold flex items-center gap-1 text-blue-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-900" /> BD Operations Accreditation Clearance
                  </div>
                  <p className="text-slate-700">
                    This document copy conforms with Republic Act 9646 (RESA) compliance standards and Megaworld
                    International International Property Affiliates verification protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter(totalPages)}
        </div>
    </div>
  );
};
