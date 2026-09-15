import React from 'react';
import { Position } from '../types';
import {
  ContractData,
  DocumentHeader,
  VerifiedSignatureFooter,
  AgentInformationSheetPage,
  ReferralFormPage,
  SAAAgreementBodyPage,
  WitnessingSignaturesPage,
  CodeOfEthicsPage,
  AffidavitOfUndertakingPage,
  CertificateVerificationPage,
} from './ContractDocument';

export interface PageDefinition {
  pageNumber: number;
  title: string;
  render: (data: ContractData, position: Position, totalPages: number) => React.ReactNode;
}

export function getPagesForPosition(position: Position): PageDefinition[] {
  if (position === 'Marketing Associate') {
    return [
      {
        pageNumber: 1,
        title: 'Agent Information Sheet',
        render: (d, pos, total) => <AgentInformationSheetPage data={d} position={pos} pageNum={1} totalPages={total} />,
      },
      {
        pageNumber: 2,
        title: 'Referral Form (Endorsement)',
        render: (d, pos, total) => <ReferralFormPage data={d} position={pos} pageNum={2} totalPages={total} />,
      },
      {
        pageNumber: 3,
        title: 'Sales Agency Agreement (SAA) — MA Part 1',
        render: (d, pos, total) => (
          <SAAAgreementBodyPage
            data={d}
            position={pos}
            pageNum={3}
            totalPages={total}
            sectionTitle="Sales Agency Agreement — Marketing Associate (MA)"
            bodyContent={
              <>
                <p className="font-sans font-semibold text-sm text-slate-900">
                  Dear {d.fullName},
                </p>
                <p>
                  We are pleased to advise you that you have been accredited as <strong>MARKETING ASSOCIATE (&ldquo;MA&rdquo;)</strong> of 
                  <strong> MEGAWORLD INTERNATIONAL</strong>, for a fixed engagement term of four (4) months, effective 
                  from <strong>{d.startDate}</strong> to <strong>{d.expiryDate}</strong>, subject to the following terms:
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">1. Scope of Independent Agency</h4>
                <p>
                  As Marketing Associate, you shall solicit, promote, and procure prospective buyers for legitimate Megaworld International 
                  real estate developments within <strong>{d.region}</strong>. You operate as an independent contractor, without creating an 
                  employer-employee relationship with Megaworld.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">2. Production Quota & Performance Thresholds</h4>
                <p>
                  To maintain active accreditation standing, you are required to achieve a minimum production quota of 
                  <strong> PHP 3,000,000.00 (Three Million Philippine Pesos)</strong> in net contract sales during your four-month 
                  accreditation cycle. Production is tracked centrally via the BD Operations real-time database.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">3. Commission Schedule & Processing</h4>
                <p>
                  Commissions shall be disbursed based on client payment collections and compliance with buyers' documentary requirements. 
                  All monetary releases shall be credited exclusively to your nominated bank account at <strong>{d.bankName}</strong> 
                  (Account No. <strong>{d.accountNumber}</strong>).
                </p>
              </>
            }
          />
        ),
      },
      {
        pageNumber: 4,
        title: 'Sales Agency Agreement — MA Part 2',
        render: (d, pos, total) => (
          <SAAAgreementBodyPage
            data={d}
            position={pos}
            pageNum={4}
            totalPages={total}
            sectionTitle="SAA (Continued) — Operational Compliance & Inactivity"
            bodyContent={
              <>
                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs">4. Documentary Requirements & Validation</h4>
                <p>
                  Accreditation is conditional upon the submission and clearance of: (a) signed SAA agreement, (b) copy of valid primary 
                  government identification card or passport, (c) 1x1 official photograph, and (d) verified bank details.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">5. Inactivity Policy & Renewal Evaluation</h4>
                <p>
                  Failure to book a validated reservation or attend mandatory product briefings within sixty (60) days will place your 
                  account in Inactive Status. Inactive affiliates must undergo reactivation briefing before submitting new client reservations. 
                  Accreditation renewal at the end of the four-month cycle is contingent on quota fulfillment and leadership endorsement.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">6. Termination and De-accreditation</h4>
                <p>
                  Megaworld International reserves the right to cancel or revoke accreditation prior to the expiry of the four-month term 
                  in cases of fraudulent misrepresentation, poaching of registered clients, unauthorized pricing alterations, or violation 
                  of the Code of Ethics.
                </p>
              </>
            }
          />
        ),
      },
      {
        pageNumber: 5,
        title: 'Section II: Senior Marketing Associate Progression',
        render: (d, pos, total) => (
          <SAAAgreementBodyPage
            data={d}
            position={pos}
            pageNum={5}
            totalPages={total}
            sectionTitle="Section II — Career Progression to Senior Marketing Associate"
            bodyContent={
              <>
                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs">I. Promotion to Senior Marketing Associate (SMA)</h4>
                <p>
                  A Marketing Associate who exceeds the required sales benchmarks and exhibits exemplary leadership skills may be promoted 
                  to <strong>Senior Marketing Associate (SMA)</strong> upon recommendation by the Marketing Manager and Marketing Director.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">II. Qualification Standards</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Attainment of at least PHP 8,000,000.00 accumulated net sales volume within two consecutive accreditation cycles.</li>
                  <li>Recruitment and mentorship of at least two (2) newly accredited active Marketing Associates.</li>
                  <li>Flawless record of ethical compliance with zero customer complaints or disciplinary infractions.</li>
                </ul>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">III. Retention of SMA Status</h4>
                <p>
                  Promoted SMAs must sustain a personal sales quota of PHP 5,000,000.00 every four months to maintain their rank and 
                  corresponding supervisory commission overrides.
                </p>
              </>
            }
          />
        ),
      },
      {
        pageNumber: 6,
        title: 'Execution & Leadership Witnessing',
        render: (d, pos, total) => <WitnessingSignaturesPage data={d} position={pos} pageNum={6} totalPages={total} />,
      },
      {
        pageNumber: 7,
        title: 'Annex E — Code of Ethics',
        render: (d, pos, total) => <CodeOfEthicsPage data={d} position={pos} pageNum={7} totalPages={total} />,
      },
      {
        pageNumber: 8,
        title: 'Annex A — Affidavit for ArcoVia Properties, Inc.',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="ArcoVia Properties, Inc."
            companyAcronym="API"
            pageNum={8}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 9,
        title: 'Annex A — Affidavit for Megaworld Corporation',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="Megaworld Corporation"
            companyAcronym="Megaworld"
            pageNum={9}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 10,
        title: 'Annex A — Affidavit for Megaworld Capital Town, Inc.',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="Megaworld Capital Town, Inc."
            companyAcronym="MCTI"
            pageNum={10}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 11,
        title: 'Annex A — Affidavit for Megaworld San Vicente Coast, Inc.',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="Megaworld San Vicente Coast, Inc."
            companyAcronym="MSVCI"
            pageNum={11}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 12,
        title: 'Certificate of Digital Verification',
        render: (d, pos, total) => <CertificateVerificationPage data={d} position={pos} pageNum={12} totalPages={total} />,
      },
    ];
  }

  if (position === 'Marketing Manager') {
    return [
      {
        pageNumber: 1,
        title: 'Agent Information Sheet',
        render: (d, pos, total) => <AgentInformationSheetPage data={d} position={pos} pageNum={1} totalPages={total} />,
      },
      {
        pageNumber: 2,
        title: 'Sales Agency Agreement — MM Part 1',
        render: (d, pos, total) => (
          <SAAAgreementBodyPage
            data={d}
            position={pos}
            pageNum={2}
            totalPages={total}
            sectionTitle="Sales Agency Agreement — Marketing Manager (MM)"
            bodyContent={
              <>
                <p className="font-sans font-semibold text-sm text-slate-900">
                  Dear {d.fullName},
                </p>
                <p>
                  We are pleased to advise you that you have been accredited as <strong>MARKETING MANAGER (&ldquo;MM&rdquo;)</strong> of 
                  <strong> MEGAWORLD INTERNATIONAL</strong>, for an accreditation term of four (4) months, effective 
                  from <strong>{d.startDate}</strong> to <strong>{d.expiryDate}</strong>.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">1. Managerial Responsibilities</h4>
                <p>
                  In your capacity as Marketing Manager, you are tasked with leading, expanding, and supervising an active sales unit. 
                  You shall continuously recruit, train, and guide Marketing Associates (MAs) and Senior Marketing Associates (SMAs) under your unit.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">2. Group Production Quota</h4>
                <p>
                  You shall achieve a minimum unit net contract sales quota of <strong>PHP 20,000,000.00 (Twenty Million Philippine Pesos)</strong> 
                  during the 4-month accreditation period, while maintaining at least three (3) active producing Marketing Associates.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">3. Management Overrides & Compensation</h4>
                <p>
                  You are entitled to managerial commission overrides on all qualified closed sales generated by your accredited unit members, 
                  credited directly to your nominated account at <strong>{d.bankName}</strong>.
                </p>
              </>
            }
          />
        ),
      },
      {
        pageNumber: 3,
        title: 'Section I: Marketing Manager Retention & Criteria',
        render: (d, pos, total) => (
          <SAAAgreementBodyPage
            data={d}
            position={pos}
            pageNum={3}
            totalPages={total}
            sectionTitle="Section I — Marketing Manager Retention & Leadership Guidelines"
            bodyContent={
              <>
                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs">I. Qualifications for Status Retention</h4>
                <p>
                  To retain Marketing Manager standing across succeeding 4-month renewals, the Manager must maintain active recruitment 
                  momentum, conduct weekly unit production clinics, and achieve the mandated group quota.
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">II. Leadership Hierarchy & Reporting</h4>
                <p>
                  The Marketing Manager reports directly to the designated Marketing Director (<strong>{d.leadership.marketingDirector || 'Victoria Del Rosario'}</strong>) 
                  and coordinates unit activities with the Regional Country Manager (<strong>{d.leadership.countryManager || 'Eduardo Valenzuela'}</strong>).
                </p>

                <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">III. Inactivity & Reversion</h4>
                <p>
                  Failure to generate unit production for ninety (90) days shall subject the unit to leadership audit and potential re-assignment.
                </p>
              </>
            }
          />
        ),
      },
      {
        pageNumber: 4,
        title: 'Execution & Leadership Witnessing',
        render: (d, pos, total) => <WitnessingSignaturesPage data={d} position={pos} pageNum={4} totalPages={total} />,
      },
      {
        pageNumber: 5,
        title: 'Annex E — Code of Ethics',
        render: (d, pos, total) => <CodeOfEthicsPage data={d} position={pos} pageNum={5} totalPages={total} />,
      },
      {
        pageNumber: 6,
        title: 'Annex A — Affidavit for Megaworld Capital Town, Inc.',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="Megaworld Capital Town, Inc."
            companyAcronym="MCTI"
            pageNum={6}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 7,
        title: 'Annex A — Affidavit for Megaworld Corporation',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="Megaworld Corporation"
            companyAcronym="Megaworld"
            pageNum={7}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 8,
        title: 'Annex A — Affidavit for ArcoVia Properties, Inc.',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="ArcoVia Properties, Inc."
            companyAcronym="API"
            pageNum={8}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 9,
        title: 'Annex A — Affidavit for Megaworld San Vicente Coast, Inc.',
        render: (d, pos, total) => (
          <AffidavitOfUndertakingPage
            data={d}
            position={pos}
            companyName="Megaworld San Vicente Coast, Inc."
            companyAcronym="MSVCI"
            pageNum={9}
            totalPages={total}
          />
        ),
      },
      {
        pageNumber: 10,
        title: 'Certificate of Digital Verification',
        render: (d, pos, total) => <CertificateVerificationPage data={d} position={pos} pageNum={10} totalPages={total} />,
      },
    ];
  }

  // Marketing Director (13 Pages)
  return [
    {
      pageNumber: 1,
      title: 'Agent Information Sheet',
      render: (d, pos, total) => <AgentInformationSheetPage data={d} position={pos} pageNum={1} totalPages={total} />,
    },
    {
      pageNumber: 2,
      title: 'Marketing Agreement — Director Part 1',
      render: (d, pos, total) => (
        <SAAAgreementBodyPage
          data={d}
          position={pos}
          pageNum={2}
          totalPages={total}
          sectionTitle="MARKETING AGREEMENT — MARKETING DIRECTOR (MD)"
          bodyContent={
            <>
              <p className="font-serif italic text-center text-xs text-slate-500 mb-2">
                KNOW ALL MEN BY THESE PRESENTS:
              </p>
              <p>
                This Marketing Agreement is entered into by and between <strong>MEGAWORLD CORPORATION</strong>, a corporation 
                organized under Philippine laws, with principal offices in Makati City, and <strong>{d.fullName}</strong>, of legal age, 
                Filipino, with address at {d.residentialAddress} (&ldquo;Marketing Director&rdquo;).
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">WITNESSETH That:</h4>
              <p>
                WHEREAS, the Company desires to engage the services of the Marketing Director to direct, manage, and expand international 
                sales networks across <strong>{d.region}</strong>;
              </p>
              <p>
                NOW THEREFORE, for and in consideration of the mutual covenants contained herein, the parties agree as follows:
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">1. Directorate Scope & Obligations</h4>
              <p>
                The Marketing Director shall spearhead business development, high-net-worth investor acquisition, international roadshows, 
                and recruitment of experienced sales managers for Megaworld flagship properties.
              </p>
            </>
          }
        />
      ),
    },
    {
      pageNumber: 3,
      title: 'Directorate Obligations & Supervision',
      render: (d, pos, total) => (
        <SAAAgreementBodyPage
          data={d}
          position={pos}
          pageNum={3}
          totalPages={total}
          sectionTitle="Obligations of the Marketing Director (Continued)"
          bodyContent={
            <>
              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs">1.2 Unit Formation and Sales Targets</h4>
              <p>
                The Marketing Director covenants to recruit, supervise, and maintain at least <strong>three (3) active Marketing Managers</strong>, 
                each overseeing a minimum of three (3) active Marketing Associates.
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">1.3 Sales Production Target</h4>
              <p>
                The Directorate unit under the Marketing Director shall generate a minimum of 
                <strong> PHP 50,000,000.00 (Fifty Million Philippine Pesos)</strong> in net contract sales during the 4-month term.
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">1.4 Corporate Representation</h4>
              <p>
                The Marketing Director shall protect the goodwill, reputation, and brand assets of Megaworld Corporation in all public, 
                media, and client engagements.
              </p>
            </>
          }
        />
      ),
    },
    {
      pageNumber: 4,
      title: 'Term, Exclusivity & Termination',
      render: (d, pos, total) => (
        <SAAAgreementBodyPage
          data={d}
          position={pos}
          pageNum={4}
          totalPages={total}
          sectionTitle="Term, Exclusivity, and Pre-Termination"
          bodyContent={
            <>
              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs">2. Duration of Term</h4>
              <p>
                This Agreement shall be effective for four (4) months, commencing on <strong>{d.startDate}</strong> and ending 
                on <strong>{d.expiryDate}</strong>, renewable upon mutual written agreement and quota performance audit.
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">3. Exclusivity Covenant</h4>
              <p>
                The Marketing Director agrees to exclusively market and sell real estate properties developed or managed by Megaworld 
                Corporation and its affiliates, and shall not market competing real estate developers.
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">4. Pre-Termination Notice</h4>
              <p>
                Either party may terminate this Agreement without cause by giving thirty (30) calendar days prior written notice. 
                Immediate termination with cause applies in cases of gross negligence, fraud, or breach of fiduciary duties.
              </p>
            </>
          }
        />
      ),
    },
    {
      pageNumber: 5,
      title: 'General Covenants & Independent Agency',
      render: (d, pos, total) => (
        <SAAAgreementBodyPage
          data={d}
          position={pos}
          pageNum={5}
          totalPages={total}
          sectionTitle="General Legal Covenants & Jurisdiction"
          bodyContent={
            <>
              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs">5. Independent Contractor Status</h4>
              <p>
                Nothing in this Agreement shall be construed as creating an employer-employee relationship, partnership, or joint venture 
                between Megaworld and the Marketing Director. The Marketing Director possesses no authority to bind Megaworld to contracts 
                outside standard approved booking procedures.
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">6. Governing Law and Exclusive Venue</h4>
              <p>
                This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines. 
                Any legal action or proceeding arising out of or in connection with this contract shall be brought exclusively in the 
                proper courts of Makati City, Philippines.
              </p>

              <h4 className="font-bold text-blue-950 uppercase font-sans text-xs pt-2">7. Confidentiality & Trade Secrets</h4>
              <p>
                The Marketing Director shall hold all proprietary price structures, client lists, and strategic business plans in strictest confidence.
              </p>
            </>
          }
        />
      ),
    },
    {
      pageNumber: 6,
      title: 'In Witness Whereof (Directorate Execution)',
      render: (d, pos, total) => <WitnessingSignaturesPage data={d} position={pos} pageNum={6} totalPages={total} />,
    },
    {
      pageNumber: 7,
      title: 'Formal Notarial Acknowledgment',
      render: (d, pos, total) => (
        <div className="contract-page p-8 sm:p-12 bg-white border border-slate-300 rounded-lg shadow-sm min-h-[920px] flex flex-col justify-between text-slate-800 text-xs font-serif leading-relaxed">
          <div>
            <DocumentHeader
              title="REPUBLIC OF THE PHILIPPINES"
              subtitle="Formal Notarial Acknowledgment — Makati City"
              affiliateCode={d.affiliateCode}
            />

            <div className="space-y-4 text-justify text-xs text-slate-700">
              <div className="font-sans text-xs">
                <p>REPUBLIC OF THE PHILIPPINES )</p>
                <p>CITY OF MAKATI ) S.S.</p>
              </div>

              <p className="mt-4">
                BEFORE ME, a Notary Public for and in the City of Makati, on this {d.startDate}, personally appeared:
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Name: <strong>JAVIER ROMEO K. ABUSTAN</strong></span>
                  <span>ID/TIN: 104-582-991-000</span>
                </div>
                <div className="flex justify-between">
                  <span>Name: <strong>{d.fullName}</strong></span>
                  <span>TIN: {d.tin}</span>
                </div>
              </div>

              <p>
                known to me and to me known to be the same persons who executed the foregoing Marketing Agreement for Marketing Director 
                and acknowledged to me that the same is their free and voluntary act and deed.
              </p>

              <p>
                WITNESS MY HAND AND SEAL on the date and place first above written.
              </p>

              <div className="mt-8 flex justify-end font-sans">
                <div className="text-center w-60 border-t border-slate-400 pt-2 text-[10px] text-slate-600">
                  <span className="font-bold text-xs block text-slate-800">NOTARY PUBLIC</span>
                  Commission Serial No. 2026-MAK-091
                </div>
              </div>
            </div>
          </div>
          <VerifiedSignatureFooter data={d} pageNum={7} totalPages={total} />
        </div>
      ),
    },
    {
      pageNumber: 8,
      title: 'Annex E — Code of Ethics',
      render: (d, pos, total) => <CodeOfEthicsPage data={d} position={pos} pageNum={8} totalPages={total} />,
    },
    {
      pageNumber: 9,
      title: 'Annex A — Affidavit for Megaworld Capital Town, Inc.',
      render: (d, pos, total) => (
        <AffidavitOfUndertakingPage
          data={d}
          position={pos}
          companyName="Megaworld Capital Town, Inc."
          companyAcronym="MCTI"
          pageNum={9}
          totalPages={total}
        />
      ),
    },
    {
      pageNumber: 10,
      title: 'Annex A — Affidavit for Megaworld Corporation',
      render: (d, pos, total) => (
        <AffidavitOfUndertakingPage
          data={d}
          position={pos}
          companyName="Megaworld Corporation"
          companyAcronym="Megaworld"
          pageNum={10}
          totalPages={total}
        />
      ),
    },
    {
      pageNumber: 11,
      title: 'Annex A — Affidavit for ArcoVia Properties, Inc.',
      render: (d, pos, total) => (
        <AffidavitOfUndertakingPage
          data={d}
          position={pos}
          companyName="ArcoVia Properties, Inc."
          companyAcronym="API"
          pageNum={11}
          totalPages={total}
        />
      ),
    },
    {
      pageNumber: 12,
      title: 'Annex A — Affidavit for Megaworld San Vicente Coast, Inc.',
      render: (d, pos, total) => (
        <AffidavitOfUndertakingPage
          data={d}
          position={pos}
          companyName="Megaworld San Vicente Coast, Inc."
          companyAcronym="MSVCI"
          pageNum={12}
          totalPages={total}
        />
      ),
    },
    {
      pageNumber: 13,
      title: 'Certificate of Digital Verification',
      render: (d, pos, total) => <CertificateVerificationPage data={d} position={pos} pageNum={13} totalPages={total} />,
    },
  ];
}
