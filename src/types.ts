export type UserRole = 'agent' | 'staff' | 'admin';

export const REGIONS = [
  'Asia Pacific 2',
  'Asia Pacific 3',
  'Asia Pacific 4',
  'Europe 2',
  'Europe 3',
  'Middle East 1',
  'Middle East 2',
  'Middle East 3',
  'North America 1',
  'North America 2',
  'North America 3',
  'North America 4',
  'North America 5',
  'North America 6',
] as const;

export type Region = (typeof REGIONS)[number];

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

export const POSITIONS = [
  'Marketing Associate',
  'Senior Marketing Associate',
  'Marketing Manager',
  'Marketing Director',
  'Marketing Partner',
] as const;

export type Position = (typeof POSITIONS)[number];

export type AccreditationStatus =
  | 'Active'
  | 'Expiring Soon'
  | 'Expired'
  | 'Renewal Pending'
  | 'Renewal Approved'
  | 'Renewal Rejected'
  | 'Pending Review'
  | 'Pending'
  | 'Not Started';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Revision Required';

export type ApplicationType = 'New' | 'Renewal';

export type IdVerificationStatus =
  | 'Pending'
  | 'Verified'
  | 'For Review'
  | 'Revision Required';

export interface PersonalDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  fullName: string;
  dateOfBirth: string;
  age?: number | string;
  sex?: 'Male' | 'Female' | 'Other';
  civilStatus: string;
  citizenship?: string;
  nationality: string;
  residentialAddress: string;
  country?: string;
  state?: string;
  telephoneNumber?: string;
  mobileNumber: string;
  emailAddress: string;
  tin?: string;
  lastContractPeriod?: string;
  idMatchConfirmed: boolean;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankAddress: string;
  swiftCode?: string;
}

export interface TeamLeadershipDetails {
  seniorMarketingAssociate?: string;
  marketingManager?: string;
  marketingDirector?: string;
  assistanceCountryManager?: string;
  countryManager?: string;
  seniorCountryManager?: string;
  assistanceVicePresident?: string;
  vicePresident?: string;
  seniorVicePresident?: string;
  referrerName?: string;
  referrerPosition?: string;
}

export interface TeamDetails {
  teamName: string;
  upline: string;
  teamLeader: string;
  brokerGroup: string;
  leadership?: TeamLeadershipDetails;
}

export interface AccreditationApplication {
  id: string;
  affiliateCode: string;
  applicationType: ApplicationType;
  position: Position;
  region: Region;
  status: ApplicationStatus;
  dateSubmitted: string;
  dateReviewed?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  personalDetails: PersonalDetails;
  bankDetails: BankDetails;
  teamDetails: TeamDetails;
  idPhotoUrl?: string;
  idPhotoName?: string;
  governmentIdUrl?: string;
  governmentIdName?: string;
  idVerificationStatus: IdVerificationStatus;
  eSignatureUrl?: string;
  eSignatureConfirmed: boolean;
  declarationAccepted: boolean;
  contractUrl?: string;
  contractGeneratedAt?: string;
}

export interface AccreditationRecord {
  id: string;
  affiliateCode: string;
  applicationType: ApplicationType;
  position: Position;
  startDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  daysRemaining: number;
  approvedBy: string;
  approvedDate: string;
  contractId?: string;
}

export interface AgentProfile {
  affiliateCode: string; // Permanent primary identifier, e.g. IPA-AP2-000001
  firebaseUserId: string;
  fullName: string;
  nickname?: string;
  email: string;
  mobileNumber?: string;
  password?: string;
  passwordHash?: string;
  tempPassword?: string; // Generated temporary credentials for renewal and access
  photoUrl?: string;
  region: Region;
  position: Position | 'Pending Accreditation' | string;
  positions?: (Position | string)[]; // All held or unlocked positions
  role: UserRole;
  registrationDate: string;
  accountStatus: 'Active' | 'Suspended' | 'Pending';
  profileCompletion: number;
  currentAccreditationId?: string;
  accreditationStatus: AccreditationStatus;
  accreditationStartDate?: string;
  accreditationExpiryDate?: string;
  lastAccreditationDate?: string;
  renewalEligibility: boolean;
  unlockedPositions: (Position | string)[];
  assignedStaff?: string;
  personalDetails?: Partial<PersonalDetails>;
  bankDetails?: Partial<BankDetails>;
  teamDetails?: Partial<TeamDetails>;
  birthday?: string;
  residentialAddress?: string;
  tin?: string;
}

export interface StaffPermissions {
  canReviewApplications: boolean;
  canManageContracts: boolean;
  canEditAgents: boolean;
  canOverrideAccreditation: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canInviteStaff: boolean;
}

export interface StaffAccount {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Staff';
  positionTitle: string;
  department: string;
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin?: string;
  photoUrl?: string;
  permissions: StaffPermissions;
  invitedBy?: string;
  invitedAt?: string;
}

export interface StaffInvitation {
  id: string;
  invitationCode: string;
  recipientName: string;
  recipientEmail: string;
  affiliateCode?: string;
  role: 'Staff' | 'Admin';
  positionTitle: string;
  department: string;
  permissions: StaffPermissions;
  customMessage?: string;
  invitedBy: string;
  invitedByEmail: string;
  createdAt: string;
  expiresAt: string;
  status: 'Pending' | 'Accepted' | 'Revoked' | 'Expired';
  acceptedAt?: string;
  emailDispatchLog: {
    sentTo: string;
    subject: string;
    sentAt: string;
    status: 'Delivered' | 'Pending';
    deliveryChannel: string;
    bodyPreview: string;
  };
}

export interface PositionAccessRequest {
  id: string;
  affiliateCode: string;
  fullName: string;
  currentPosition: Position;
  requestedPosition: Position;
  region: Region;
  requestDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  recordAffected: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface NotificationItem {
  id: string;
  affiliateCode?: string;
  recipientId?: string;
  targetRole?: UserRole | 'all';
  title: string;
  message: string;
  category:
    | 'Registration'
    | 'Accreditation'
    | 'Application'
    | 'Approval'
    | 'Contract'
    | 'Renewal'
    | 'Expiry'
    | 'Document Request'
    | 'System';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface SystemSettings {
  accreditationDurationMonths: number; // default: 4 months
  renewalWindowDaysBeforeExpiry: number; // default: 30 days or on expiry
  reminderIntervalsDays: number[]; // [30, 15, 7, 0]
  googleSpreadsheetId: string;
  googleAppsScriptUrl: string;
  googleDriveFolderId: string;
  contractTemplateName: string;
  contractTemplateText: string;
  autoSyncGoogleSheets: boolean;
  autoRenewalUnlock: boolean;
  preventDuplicateIdentities: boolean;
  lastSheetsSyncTimestamp?: string;
  sheetsSyncStatus: 'Synced' | 'Pending' | 'Syncing' | 'Error';
}

export interface PositionContractTemplate {
  position: Position;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  fileData?: string;
  rawText?: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  notes?: string;
}
