import {
  AgentProfile,
  AccreditationApplication,
  AccreditationRecord,
  PositionAccessRequest,
  AuditLog,
  NotificationItem,
  SystemSettings,
  Region,
  PositionContractTemplate,
} from '../types';

export const REGION_CODE_MAP: Record<Region, string> = {
  'Asia Pacific 2': 'AP2',
  'Asia Pacific 3': 'AP3',
  'Asia Pacific 4': 'AP4',
  'Europe 2': 'EU2',
  'Europe 3': 'EU3',
  'Middle East 1': 'ME1',
  'Middle East 2': 'ME2',
  'Middle East 3': 'ME3',
  'North America 1': 'NA1',
  'North America 2': 'NA2',
  'North America 3': 'NA3',
  'North America 4': 'NA4',
  'North America 5': 'NA5',
  'North America 6': 'NA6',
};

export const DEFAULT_CONTRACT_TEMPLATE = `
================================================================================
           MEGAWORLD INTERNATIONAL - SALES AGREEMENT AGENCY (IPA)
                     OFFICIAL ACCREDITATION CERTIFICATE
================================================================================

AFFILIATE CODE: {{AFFILIATE_CODE}}
DATE ISSUED: {{ACCREDITATION_START_DATE}}
VALID UNTIL: {{ACCREDITATION_EXPIRY_DATE}}

THIS SALES AGENCY ACCREDITATION AGREEMENT is entered into by and between:

MEGAWORLD INTERNATIONAL, a corporation duly organized and existing under the laws 
of the Republic of the Philippines, with international marketing offices worldwide,
hereinafter referred to as the "COMPANY";

- AND -

{{FULL_NAME}}, of legal age, residing at {{ADDRESS}}, with contact number {{MOBILE_NUMBER}}
and email {{EMAIL}}, hereinafter referred to as the "INTERNATIONAL PROPERTY AFFILIATE" (IPA).

1. APPOINTMENT AND SCOPE
The COMPANY hereby accredits the IPA as a {{POSITION}} representing the COMPANY's premier 
real estate developments for the assigned territory: {{REGION}}.

2. TERM OF ACCREDITATION (4-MONTH CYCLE)
This accreditation shall be valid for a period of exactly four (4) months, commencing 
on {{ACCREDITATION_START_DATE}} and expiring on {{ACCREDITATION_EXPIRY_DATE}}. The IPA 
understands that the Affiliate Code ({{AFFILIATE_CODE}}) remains their permanent identity, 
and renewal must be filed prior to or upon expiration to maintain active status.

3. AFFILIATE PARTICULARS & BANK DETAILS FOR COMMISSIONS
- Full Legal Name: {{FULL_NAME}}
- Date of Birth: {{DATE_OF_BIRTH}}
- Assigned Team / Group: {{TEAM_NAME}}
- Upline / Leader: {{UPLINE}}
- Bank Institution: {{BANK_NAME}}
- Account Holder Name: {{ACCOUNT_NAME}}
- Account Number: {{ACCOUNT_NUMBER}}

4. COVENANT AND CONFIRMATION
The IPA confirms under oath that all submitted government credentials and identity details 
are true, complete, and authentic.

IN WITNESS WHEREOF, the parties have executed this Agreement on {{ACCREDITATION_START_DATE}}.

AFFILIATE SIGNATURE:
{{ESIGNATURE}}
Signed electronically by: {{FULL_NAME}}
Date Verified: {{ACCREDITATION_START_DATE}}

APPROVED FOR MEGAWORLD INTERNATIONAL:
BD Operations & Accreditation Directorate
Verified and Registered in Agents Database Google Spreadsheet
================================================================================
`;

export const INITIAL_SETTINGS: SystemSettings = {
  accreditationDurationMonths: 4,
  renewalWindowDaysBeforeExpiry: 30,
  reminderIntervalsDays: [30, 15, 7, 0],
  googleSpreadsheetId: '1eR7gskoH17WcawaC31Xk6zrnBgS6dsnF_AGENTS_DB',
  googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbz_SAMPLE_DEPLOYMENT_ID/exec',
  googleDriveFolderId: '1eR7gskoH17WcawaC31Xk6zrnBgS6dsnF',
  contractTemplateName: 'Official Megaworld International Sales Agreement Agency v2026',
  contractTemplateText: DEFAULT_CONTRACT_TEMPLATE,
  autoSyncGoogleSheets: true,
  autoRenewalUnlock: true,
  preventDuplicateIdentities: true,
  lastSheetsSyncTimestamp: new Date().toISOString(),
  sheetsSyncStatus: 'Synced',
};

export const INITIAL_AGENTS: AgentProfile[] = [
  {
    affiliateCode: 'IPA-AP2-000001',
    firebaseUserId: 'usr_agent_001',
    fullName: 'Maria Cristina Santos',
    email: 'maria.santos@megaworld-ipa.example',
    password: 'password123',
    region: 'Asia Pacific 2',
    position: 'Marketing Associate',
    role: 'agent',
    registrationDate: '2026-06-15',
    accountStatus: 'Active',
    profileCompletion: 100,
    currentAccreditationId: 'acc_001',
    accreditationStatus: 'Active',
    accreditationStartDate: '2026-06-15',
    accreditationExpiryDate: '2026-10-15',
    lastAccreditationDate: '2026-06-15',
    renewalEligibility: false,
    unlockedPositions: ['Marketing Associate'],
    assignedStaff: 'Elena Ramos (BD Staff)',
  },
  {
    affiliateCode: 'IPA-ME1-000002',
    firebaseUserId: 'usr_agent_002',
    fullName: 'Carlos Miguel Tan',
    email: 'carlos.tan@megaworld-ipa.example',
    password: 'password123',
    region: 'Middle East 1',
    position: 'Marketing Manager',
    role: 'agent',
    registrationDate: '2026-05-18',
    accountStatus: 'Active',
    profileCompletion: 100,
    currentAccreditationId: 'acc_002',
    accreditationStatus: 'Active',
    accreditationStartDate: '2026-05-18',
    accreditationExpiryDate: '2026-09-18',
    lastAccreditationDate: '2026-05-18',
    renewalEligibility: true,
    unlockedPositions: ['Marketing Associate', 'Marketing Manager'],
    assignedStaff: 'Elena Ramos (BD Staff)',
  },
  {
    affiliateCode: 'IPA-NA1-000003',
    firebaseUserId: 'usr_agent_003',
    fullName: 'Elena Patricia Reyes',
    email: 'elena.reyes@megaworld-ipa.example',
    password: 'password123',
    region: 'North America 1',
    position: 'Marketing Director',
    role: 'agent',
    registrationDate: '2026-04-01',
    accountStatus: 'Active',
    profileCompletion: 100,
    currentAccreditationId: 'acc_003',
    accreditationStatus: 'Active',
    accreditationStartDate: '2026-04-01',
    accreditationExpiryDate: '2026-08-01',
    lastAccreditationDate: '2026-04-01',
    renewalEligibility: false,
    unlockedPositions: ['Marketing Associate', 'Marketing Manager', 'Marketing Director'],
    assignedStaff: 'Mark Bautista (BD Staff)',
  },
  {
    affiliateCode: 'IPA-EU2-000004',
    firebaseUserId: 'usr_agent_004',
    fullName: 'David Alexander Lim',
    email: 'david.lim@megaworld-ipa.example',
    password: 'password123',
    region: 'Europe 2',
    position: 'Marketing Associate',
    role: 'agent',
    registrationDate: '2026-09-02',
    accountStatus: 'Active',
    profileCompletion: 85,
    currentAccreditationId: undefined,
    accreditationStatus: 'Pending Review',
    renewalEligibility: false,
    unlockedPositions: ['Marketing Associate'],
    assignedStaff: 'Mark Bautista (BD Staff)',
  },
];

export const INITIAL_APPLICATIONS: AccreditationApplication[] = [
  {
    id: 'app_001',
    affiliateCode: 'IPA-AP2-000001',
    applicationType: 'New',
    position: 'Marketing Associate',
    region: 'Asia Pacific 2',
    status: 'Approved',
    dateSubmitted: '2026-06-15',
    dateReviewed: '2026-06-15',
    reviewedBy: 'Elena Ramos',
    personalDetails: {
      firstName: 'Maria Cristina',
      middleName: 'Alcantara',
      lastName: 'Santos',
      suffix: '',
      fullName: 'Maria Cristina Alcantara Santos',
      dateOfBirth: '1992-07-14',
      age: 34,
      sex: 'Female',
      civilStatus: 'Single',
      citizenship: 'Filipino',
      nationality: 'Filipino',
      residentialAddress: 'Tower 1, Unit 24B, Eastwood City, Bagumbayan, Quezon City',
      country: 'Philippines',
      state: 'Metro Manila',
      telephoneNumber: '+63 2 8555 1234',
      mobileNumber: '+63 917 555 1234',
      emailAddress: 'maria.santos@megaworld-ipa.example',
      tin: '245-891-304-000',
      lastContractPeriod: '2026-02-15 to 2026-06-15',
      idMatchConfirmed: true,
    },
    bankDetails: {
      bankName: 'BDO Unibank',
      accountName: 'Maria Cristina A Santos',
      accountNumber: '1092837465',
      bankAddress: 'Eastwood City Branch, QC',
      swiftCode: 'BNORPHMM',
    },
    teamDetails: {
      teamName: 'Team Apex Horizon',
      upline: 'Ricardo Gomez',
      teamLeader: 'Victoria Del Rosario',
      brokerGroup: 'Megaworld International AP2 Hub',
      leadership: {
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
      },
    },
    idPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    idPhotoName: 'maria_santos_1x1_photo.jpg',
    governmentIdUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
    governmentIdName: 'philippine_passport_santos.pdf',
    idVerificationStatus: 'Verified',
    eSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10,40 Q 60,10 100,35 T 190,20" fill="none" stroke="%230f2b5c" stroke-width="2.5"/></svg>',
    eSignatureConfirmed: true,
    declarationAccepted: true,
    contractUrl: '/contracts/IPA-AP2-000001-2026.pdf',
    contractGeneratedAt: '2026-06-15T14:30:00Z',
  },
  {
    id: 'app_004',
    affiliateCode: 'IPA-EU2-000004',
    applicationType: 'New',
    position: 'Marketing Associate',
    region: 'Europe 2',
    status: 'Under Review',
    dateSubmitted: '2026-09-02',
    personalDetails: {
      firstName: 'David Alexander',
      middleName: 'Mendoza',
      lastName: 'Lim',
      suffix: '',
      fullName: 'David Alexander Mendoza Lim',
      dateOfBirth: '1989-11-23',
      nationality: 'Filipino / British Citizen',
      civilStatus: 'Married',
      residentialAddress: 'Flat 4, 18 Kensington Gardens, London W8 4PE',
      mobileNumber: '+44 7700 900123',
      emailAddress: 'david.lim@megaworld-ipa.example',
      idMatchConfirmed: true,
    },
    bankDetails: {
      bankName: 'HSBC UK',
      accountName: 'David Lim',
      accountNumber: '40-12-34 98765432',
      bankAddress: 'High Street Kensington Branch',
      swiftCode: 'HBUKGB4B',
    },
    teamDetails: {
      teamName: 'Euro-Pinnacle Group',
      upline: 'Roberto Silva',
      teamLeader: 'Grace Holloway',
      brokerGroup: 'Megaworld Europe Prime Hub',
    },
    idPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    idPhotoName: 'david_lim_1x1.jpg',
    governmentIdUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
    governmentIdName: 'uk_passport_lim.pdf',
    idVerificationStatus: 'For Review',
    eSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 15,35 Q 70,5 110,40 T 185,25" fill="none" stroke="%230f2b5c" stroke-width="2.5"/></svg>',
    eSignatureConfirmed: true,
    declarationAccepted: true,
  },
  {
    id: 'app_002',
    affiliateCode: 'IPA-ME1-000002',
    applicationType: 'New',
    position: 'Marketing Manager',
    region: 'Middle East 1',
    status: 'Approved',
    dateSubmitted: '2026-05-18',
    dateReviewed: '2026-05-18',
    reviewedBy: 'Elena Ramos',
    personalDetails: {
      firstName: 'Carlos Miguel',
      middleName: 'Pascual',
      lastName: 'Tan',
      suffix: '',
      fullName: 'Carlos Miguel Pascual Tan',
      dateOfBirth: '1988-03-22',
      age: 38,
      sex: 'Male',
      civilStatus: 'Married',
      citizenship: 'Filipino',
      nationality: 'Filipino',
      residentialAddress: 'Al Barsha 1, Suite 402, Dubai, United Arab Emirates',
      country: 'United Arab Emirates',
      state: 'Dubai',
      telephoneNumber: '+971 4 399 1234',
      mobileNumber: '+971 50 123 4567',
      emailAddress: 'carlos.tan@megaworld-ipa.example',
      tin: '312-904-582-000',
      lastContractPeriod: '2026-01-18 to 2026-05-18',
      idMatchConfirmed: true,
    },
    bankDetails: {
      bankName: 'BDO Unibank',
      accountName: 'Carlos Miguel Tan',
      accountNumber: '1088765432',
      bankAddress: 'BDO Overseas Remittance Hub',
      swiftCode: 'BNORPHMM',
    },
    teamDetails: {
      teamName: 'Emirates Apex Realty Group',
      upline: 'Victoria Del Rosario',
      teamLeader: 'Carlos Miguel Tan',
      brokerGroup: 'Megaworld ME1 Directorate',
      leadership: {
        marketingDirector: 'Victoria Del Rosario',
        assistanceCountryManager: 'Ferdinand Marcos Jr.',
        countryManager: 'Eduardo Valenzuela',
        seniorCountryManager: 'Grace P. Tan',
        assistanceVicePresident: 'Roberto De Leon',
        vicePresident: 'Ma. Lourdes Santos',
        seniorVicePresident: 'Antonio Morales',
      },
    },
    idPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    idPhotoName: 'carlos_tan_1x1.jpg',
    governmentIdUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
    governmentIdName: 'philippine_passport_tan.pdf',
    idVerificationStatus: 'Verified',
    eSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20,40 C 50,10 90,50 130,20 S 180,30 190,15" fill="none" stroke="%230f2b5c" stroke-width="2.5"/></svg>',
    eSignatureConfirmed: true,
    declarationAccepted: true,
    contractUrl: '/contracts/IPA-ME1-000002-2026.pdf',
    contractGeneratedAt: '2026-05-18T10:00:00Z',
  },
  {
    id: 'app_003',
    affiliateCode: 'IPA-NA1-000003',
    applicationType: 'New',
    position: 'Marketing Director',
    region: 'North America 1',
    status: 'Approved',
    dateSubmitted: '2026-04-01',
    dateReviewed: '2026-04-01',
    reviewedBy: 'Business Development Admin',
    personalDetails: {
      firstName: 'Elena Patricia',
      middleName: 'Villanueva',
      lastName: 'Reyes',
      suffix: '',
      fullName: 'Elena Patricia Villanueva Reyes',
      dateOfBirth: '1985-09-10',
      age: 40,
      sex: 'Female',
      civilStatus: 'Married',
      citizenship: 'Filipino',
      nationality: 'Filipino',
      residentialAddress: '3450 Wilshire Blvd, Suite 800, Los Angeles, CA 90010, USA',
      country: 'United States',
      state: 'California',
      telephoneNumber: '+1 213 555 7890',
      mobileNumber: '+1 310 555 4321',
      emailAddress: 'elena.reyes@megaworld-ipa.example',
      tin: '189-432-876-000',
      lastContractPeriod: '2025-12-01 to 2026-04-01',
      idMatchConfirmed: true,
    },
    bankDetails: {
      bankName: 'BPI (Bank of the Philippine Islands)',
      accountName: 'Elena Patricia Reyes',
      accountNumber: '2987654321',
      bankAddress: 'BPI Global Remit Center',
      swiftCode: 'BOPIPHMM',
    },
    teamDetails: {
      teamName: 'North America Pacific Directorate',
      upline: 'Eduardo Valenzuela',
      teamLeader: 'Elena Patricia Reyes',
      brokerGroup: 'Megaworld NA1 Hub',
      leadership: {
        assistanceCountryManager: 'Ferdinand Marcos Jr.',
        countryManager: 'Eduardo Valenzuela',
        seniorCountryManager: 'Grace P. Tan',
        assistanceVicePresident: 'Roberto De Leon',
        vicePresident: 'Ma. Lourdes Santos',
        seniorVicePresident: 'Antonio Morales',
      },
    },
    idPhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
    idPhotoName: 'elena_reyes_1x1.jpg',
    governmentIdUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
    governmentIdName: 'passport_elena_reyes.pdf',
    idVerificationStatus: 'Verified',
    eSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10,35 Q 40,5 90,30 T 170,15 T 195,40" fill="none" stroke="%230f2b5c" stroke-width="2.5"/></svg>',
    eSignatureConfirmed: true,
    declarationAccepted: true,
    contractUrl: '/contracts/IPA-NA1-000003-2026.pdf',
    contractGeneratedAt: '2026-04-01T09:00:00Z',
  },
];

export const INITIAL_ACCREDITATIONS: AccreditationRecord[] = [
  {
    id: 'acc_001',
    affiliateCode: 'IPA-AP2-000001',
    applicationType: 'New',
    position: 'Marketing Associate',
    startDate: '2026-06-15',
    expiryDate: '2026-10-15',
    status: 'Active',
    daysRemaining: 36,
    approvedBy: 'Elena Ramos',
    approvedDate: '2026-06-15',
    contractId: 'cnt_001',
  },
  {
    id: 'acc_002',
    affiliateCode: 'IPA-ME1-000002',
    applicationType: 'New',
    position: 'Marketing Associate',
    startDate: '2026-05-18',
    expiryDate: '2026-09-18',
    status: 'Expiring Soon',
    daysRemaining: 9,
    approvedBy: 'Elena Ramos',
    approvedDate: '2026-05-18',
    contractId: 'cnt_002',
  },
  {
    id: 'acc_003',
    affiliateCode: 'IPA-NA1-000003',
    applicationType: 'New',
    position: 'Marketing Associate',
    startDate: '2026-04-01',
    expiryDate: '2026-08-01',
    status: 'Expired',
    daysRemaining: 0,
    approvedBy: 'Mark Bautista',
    approvedDate: '2026-04-01',
    contractId: 'cnt_003',
  },
];

export const INITIAL_POSITION_REQUESTS: PositionAccessRequest[] = [
  {
    id: 'pos_req_001',
    affiliateCode: 'IPA-AP2-000001',
    fullName: 'Maria Cristina Santos',
    currentPosition: 'Marketing Associate',
    requestedPosition: 'Marketing Manager',
    region: 'Asia Pacific 2',
    requestDate: '2026-09-05',
    reason: 'Promoted to Team Leader for AP2 Hub. Completed 5 unit sales and have 4 recruited active affiliates.',
    status: 'Pending',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_001',
    affiliateCode: 'IPA-ME1-000002',
    title: 'Accreditation Expiring Soon',
    message: 'Your Marketing Associate accreditation expires on September 18, 2026 (9 days remaining). Your renewal application is now unlocked.',
    category: 'Expiry',
    timestamp: '2026-09-09T08:00:00Z',
    read: false,
    actionLink: 'accreditation',
  },
  {
    id: 'notif_002',
    affiliateCode: 'IPA-NA1-000003',
    title: 'Accreditation Expired - Renewal Available',
    message: 'Your accreditation expired on August 1, 2026. Please submit your Renewal Application. Your permanent Affiliate Code (IPA-NA1-000003) will be preserved.',
    category: 'Renewal',
    timestamp: '2026-08-01T00:01:00Z',
    read: false,
    actionLink: 'accreditation',
  },
  {
    id: 'notif_003',
    targetRole: 'staff',
    title: 'New Application Submitted',
    message: 'David Alexander Lim (IPA-EU2-000004) has submitted a New Marketing Associate Accreditation for Europe 2.',
    category: 'Application',
    timestamp: '2026-09-02T11:45:00Z',
    read: false,
    actionLink: 'applications',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-09-09T14:20:00Z',
    user: 'System Cron',
    role: 'admin',
    action: 'Automated 4-Month Expiry Calculation',
    recordAffected: 'Accreditation Monitoring',
    details: 'Evaluated 4 active records. Flagged IPA-ME1-000002 as Expiring Soon and unlocked renewal.',
  },
  {
    id: 'log_002',
    timestamp: '2026-09-05T16:10:00Z',
    user: 'Maria Cristina Santos (IPA-AP2-000001)',
    role: 'agent',
    action: 'Position Access Request Submitted',
    recordAffected: 'pos_req_001',
    details: 'Requested upgrade to Marketing Manager position.',
  },
  {
    id: 'log_003',
    timestamp: '2026-09-02T11:45:00Z',
    user: 'David Alexander Lim',
    role: 'agent',
    action: 'New Accreditation Submitted',
    recordAffected: 'IPA-EU2-000004',
    details: 'Submitted Personal, Bank, Team details, 1x1 Photo, and Passport.',
  },
  {
    id: 'log_004',
    timestamp: '2026-06-15T14:30:00Z',
    user: 'Elena Ramos',
    role: 'staff',
    action: 'Accreditation Approved & Contract Generated',
    recordAffected: 'IPA-AP2-000001',
    details: 'Approved accreditation for 4-month period (2026-06-15 to 2026-10-15). Synced with Agents Database Google Spreadsheet.',
  },
];

export const INITIAL_POSITION_CONTRACTS: PositionContractTemplate[] = [
  {
    position: 'Marketing Associate',
    title: 'Sales Agreement Agency (SAA) — Marketing Associate',
    fileName: 'Megaworld_SAA_Marketing_Associate.pdf',
    fileType: 'application/pdf',
    fileSize: '265 KB',
    lastUpdatedBy: 'Elena Ramos (BD Staff)',
    lastUpdatedAt: '2026-09-09T10:30:00Z',
    notes: 'Official first level 4-month international property affiliate accreditation agreement for certified marketing associates.',
    rawText: DEFAULT_CONTRACT_TEMPLATE.replace(/\{\{POSITION\}\}/g, 'Marketing Associate'),
  },
  {
    position: 'Marketing Manager',
    title: 'Executive Sales Agency Agreement — Marketing Manager',
    fileName: 'Megaworld_SAA_Marketing_Manager.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: '312 KB',
    lastUpdatedBy: 'Business Development Admin (Super Admin)',
    lastUpdatedAt: '2026-09-05T14:20:00Z',
    notes: 'Team leadership and upline accreditation contract with recruitment override commission provisions.',
    rawText: DEFAULT_CONTRACT_TEMPLATE.replace(/\{\{POSITION\}\}/g, 'Marketing Manager'),
  },
  {
    position: 'Marketing Director',
    title: 'Directorate Special Affiliate Agreement — Marketing Director',
    fileName: 'Megaworld_SAA_Marketing_Director.pdf',
    fileType: 'application/pdf',
    fileSize: '410 KB',
    lastUpdatedBy: 'Business Development Admin (Super Admin)',
    lastUpdatedAt: '2026-09-01T16:00:00Z',
    notes: 'Top-tier executive affiliate agreement for regional directorates and multi-region brokerage groups.',
    rawText: DEFAULT_CONTRACT_TEMPLATE.replace(/\{\{POSITION\}\}/g, 'Marketing Director'),
  },
];
