import {
  AgentProfile,
  AccreditationApplication,
  PositionAccessRequest,
  AuditLog,
  NotificationItem,
  SystemSettings,
  Region,
  Position,
  PositionContractTemplate,
  StaffAccount,
  StaffInvitation,
} from '../types';
import {
  INITIAL_AGENTS,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSITION_CONTRACTS,
  INITIAL_POSITION_REQUESTS,
  REGION_CODE_MAP,
} from '../data/seedData';
import { computeExpiryDate, safeDatePart } from '../utils/dateFormatter';

const STORAGE_KEYS = {
  AGENTS: 'mwi_agents_cache',
  APPLICATIONS: 'mwi_applications_cache',
  AUDIT_LOGS: 'mwi_audit_logs_cache',
  NOTIFICATIONS: 'mwi_notifications_cache',
  SETTINGS: 'mwi_settings_cache',
  CONTRACTS: 'mwi_contracts_cache',
  STAFF: 'mwi_staff_cache',
  INVITATIONS: 'mwi_invitations_cache',
  POSITION_REQUESTS: 'mwi_pos_requests_cache',
};

const DEFAULT_SETTINGS: SystemSettings = {
  accreditationDurationMonths: 4,
  renewalWindowDaysBeforeExpiry: 30,
  reminderIntervalsDays: [30, 15, 7, 0],
  googleSpreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  googleAppsScriptUrl: '',
  googleDriveFolderId: '0B_MegaWorldAgents_GlobalRoot',
  contractTemplateName: 'Megaworld Sales Agreement Agency',
  contractTemplateText: '',
  autoSyncGoogleSheets: true,
  autoRenewalUnlock: true,
  preventDuplicateIdentities: true,
  sheetsSyncStatus: 'Synced',
};

const VALID_POSITIONS: Position[] = [
  'Marketing Associate',
  'Senior Marketing Associate',
  'Marketing Manager',
  'Marketing Director',
  'Marketing Partner',
];

// Helper to safely read from localStorage
function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Helper to safely write to localStorage
function writeStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[ClientStorage] Failed to save key "${key}":`, err);
  }
}

export const clientStorage = {
  getAgents(): AgentProfile[] {
    const list = readStorage<AgentProfile[]>(STORAGE_KEYS.AGENTS, []);
    if (!Array.isArray(list) || list.length === 0) {
      writeStorage(STORAGE_KEYS.AGENTS, INITIAL_AGENTS);
      return [...INITIAL_AGENTS];
    }
    return list;
  },

  saveAgents(agents: AgentProfile[]): void {
    writeStorage(STORAGE_KEYS.AGENTS, agents);
  },

  getAgent(code: string): AgentProfile | null {
    const agents = this.getAgents();
    return agents.find((a) => a.affiliateCode === code || a.email.toLowerCase() === code.toLowerCase()) || null;
  },

  updateAgent(code: string, patch: Partial<AgentProfile>): AgentProfile | null {
    const agents = this.getAgents();
    const idx = agents.findIndex((a) => a.affiliateCode === code || a.email.toLowerCase() === code.toLowerCase());
    if (idx === -1) return null;
    const updated = { ...agents[idx], ...patch };
    agents[idx] = updated;
    this.saveAgents(agents);
    return updated;
  },

  deleteAgent(code: string): boolean {
    const agents = this.getAgents();
    const filtered = agents.filter((a) => a.affiliateCode !== code);
    if (filtered.length === agents.length) return false;
    this.saveAgents(filtered);
    return true;
  },

  getApplications(): AccreditationApplication[] {
    const list = readStorage<AccreditationApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    if (!Array.isArray(list) || list.length === 0) {
      writeStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      return [...INITIAL_APPLICATIONS];
    }
    return list;
  },

  saveApplications(apps: AccreditationApplication[]): void {
    writeStorage(STORAGE_KEYS.APPLICATIONS, apps);
  },

  getApplication(id: string): AccreditationApplication | null {
    const apps = this.getApplications();
    return apps.find((a) => a.id === id) || null;
  },

  saveApplication(app: AccreditationApplication): void {
    const apps = this.getApplications();
    const idx = apps.findIndex((a) => a.id === app.id);
    if (idx >= 0) {
      apps[idx] = app;
    } else {
      apps.unshift(app);
    }
    this.saveApplications(apps);
  },

  getAuditLogs(): AuditLog[] {
    const list = readStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    if (!Array.isArray(list) || list.length === 0) {
      writeStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
      return [...INITIAL_AUDIT_LOGS];
    }
    return list;
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: entry.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      user: entry.user,
      role: entry.role,
      action: entry.action,
      recordAffected: entry.recordAffected,
      details: entry.details,
    };
    logs.unshift(newLog);
    writeStorage(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200));
  },

  getNotifications(affiliateCode?: string, role?: string): NotificationItem[] {
    const list = readStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const items = (!Array.isArray(list) || list.length === 0) ? [...INITIAL_NOTIFICATIONS] : list;
    return items.filter((n) => {
      if (role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'staff')) {
        return !n.targetRole || n.targetRole === 'all' || n.targetRole === 'staff';
      }
      if (affiliateCode) {
        return n.affiliateCode === affiliateCode || n.targetRole === 'all' || n.targetRole === 'agent';
      }
      return true;
    });
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const list = readStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [...INITIAL_NOTIFICATIONS]);
    const item: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(item);
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 100));
  },

  markNotificationRead(id: string): void {
    const list = readStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [...INITIAL_NOTIFICATIONS]);
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      writeStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  getSettings(): SystemSettings {
    return readStorage<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    writeStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  getPositionContracts(): PositionContractTemplate[] {
    const list = readStorage<PositionContractTemplate[]>(STORAGE_KEYS.CONTRACTS, []);
    if (!Array.isArray(list) || list.length === 0) {
      writeStorage(STORAGE_KEYS.CONTRACTS, INITIAL_POSITION_CONTRACTS);
      return [...INITIAL_POSITION_CONTRACTS];
    }
    return list;
  },

  updatePositionContract(position: string, patch: Partial<PositionContractTemplate>): PositionContractTemplate {
    const list = this.getPositionContracts();
    const idx = list.findIndex((c) => c.position.toLowerCase() === position.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch, lastUpdatedAt: new Date().toISOString() };
      writeStorage(STORAGE_KEYS.CONTRACTS, list);
      return list[idx];
    }
    const newTpl: PositionContractTemplate = {
      position: position as Position,
      title: patch.title || `Sales Agreement Agency — ${position}`,
      fileName: patch.fileName || `Megaworld_SAA_${position.replace(/\s+/g, '_')}.pdf`,
      fileType: patch.fileType || 'application/pdf',
      fileSize: patch.fileSize || '300 KB',
      lastUpdatedBy: patch.lastUpdatedBy || 'Business Development Admin',
      lastUpdatedAt: new Date().toISOString(),
      notes: patch.notes || 'Contract template',
      rawText: patch.rawText || '',
    };
    list.push(newTpl);
    writeStorage(STORAGE_KEYS.CONTRACTS, list);
    return newTpl;
  },

  getPositionRequests(): PositionAccessRequest[] {
    const list = readStorage<PositionAccessRequest[]>(STORAGE_KEYS.POSITION_REQUESTS, []);
    if (!Array.isArray(list) || list.length === 0) {
      writeStorage(STORAGE_KEYS.POSITION_REQUESTS, INITIAL_POSITION_REQUESTS);
      return [...INITIAL_POSITION_REQUESTS];
    }
    return list;
  },

  savePositionRequests(reqs: PositionAccessRequest[]): void {
    writeStorage(STORAGE_KEYS.POSITION_REQUESTS, reqs);
  },

  getStaffAccounts(): StaffAccount[] {
    return readStorage<StaffAccount[]>(STORAGE_KEYS.STAFF, [
      {
        id: 'usr_admin_001',
        fullName: 'Business Development Admin',
        email: 'admin@megaworld.com',
        role: 'Admin',
        positionTitle: 'BD Directorate Super Admin',
        department: 'Business Development International',
        status: 'Active',
        permissions: {
          canReviewApplications: true,
          canManageContracts: true,
          canEditAgents: true,
          canOverrideAccreditation: true,
          canViewReports: true,
          canManageSettings: true,
          canInviteStaff: true,
        },
      },
      {
        id: 'usr_staff_001',
        fullName: 'Elena Ramos (BD Staff)',
        email: 'staff@megaworld.com',
        role: 'Staff',
        positionTitle: 'Senior Accreditation Officer',
        department: 'Business Development International',
        status: 'Active',
        permissions: {
          canReviewApplications: true,
          canManageContracts: false,
          canEditAgents: true,
          canOverrideAccreditation: false,
          canViewReports: true,
          canManageSettings: false,
          canInviteStaff: false,
        },
      },
    ]);
  },

  getInvitations(): StaffInvitation[] {
    return readStorage<StaffInvitation[]>(STORAGE_KEYS.INVITATIONS, []);
  },

  saveInvitation(inv: StaffInvitation): void {
    const list = this.getInvitations();
    list.unshift(inv);
    writeStorage(STORAGE_KEYS.INVITATIONS, list);
  },

  /**
   * Complete client-side agent import engine.
   * Handles duplicate detection, code generation, 4-month accreditation dates,
   * temporary passwords, and localStorage caching.
   * Returns identical structure to the server endpoint.
   */
  processClientSideImport(payload: {
    records: Array<{
      email: string;
      nickname?: string;
      fullName?: string;
      positions?: string[];
      position?: string;
      dateCreated?: string;
      status?: string;
      region?: string;
      passwordHash?: string;
      hasExistingContract?: boolean;
    }>;
    importedBy?: string;
    importedByRole?: string;
    filterMinYear?: number;
    duplicateHandling?: 'update' | 'skip';
  }): {
    success: boolean;
    message: string;
    totalProcessed: number;
    newImported: number;
    duplicatesUpdated: number;
    duplicatesSkipped: number;
    importedAgents: AgentProfile[];
  } {
    const currentAgents = [...this.getAgents()];

    let totalProcessed = 0;
    let newImported = 0;
    let duplicatesUpdated = 0;
    let duplicatesSkipped = 0;

    const duplicateMode = payload.duplicateHandling || 'update';

    payload.records.forEach((record) => {
      if (!record.email && !record.fullName) return;
      totalProcessed++;

      const normEmail = (record.email || '').trim().toLowerCase();
      const normName = (record.fullName || '').trim().toLowerCase();

      // Check existing agent by email or full name
      const existingIndex = currentAgents.findIndex(
        (a) =>
          (normEmail && a.email.toLowerCase() === normEmail) ||
          (normName && a.fullName.toLowerCase() === normName)
      );

      if (existingIndex >= 0) {
        if (duplicateMode === 'skip') {
          duplicatesSkipped++;
          return;
        }

        // Update duplicate record
        const agent = { ...currentAgents[existingIndex] };
        if (record.fullName) agent.fullName = record.fullName;
        if (record.nickname) agent.nickname = record.nickname;
        if (record.region) agent.region = record.region as Region;
        if (record.position && VALID_POSITIONS.includes(record.position as Position)) {
          agent.position = record.position as Position;
        }
        if (record.positions && Array.isArray(record.positions)) {
          const combined = Array.from(new Set([...(agent.unlockedPositions || []), ...record.positions]));
          agent.unlockedPositions = combined as Position[];
          agent.positions = combined as Position[];
        }
        if (record.status) {
          agent.accountStatus = record.status === 'Active' || record.status === 'Approved' ? 'Active' : 'Suspended';
          agent.accreditationStatus = record.status === 'Approved' || record.status === 'Active' ? 'Active' : (record.status as any);
        }
        if (!agent.tempPassword) {
          const codeDigits = agent.affiliateCode.split('-').pop() || '000000';
          agent.tempPassword = `Mega@${codeDigits}`;
        }
        currentAgents[existingIndex] = agent;
        duplicatesUpdated++;
        return;
      }

      // Generate New Agent Profile
      const regionName = (record.region || 'Asia Pacific 2') as Region;
      const regCode = REGION_CODE_MAP[regionName] || 'AP2';

      // Find highest index for this regional prefix
      let maxNum = 0;
      currentAgents.forEach((a) => {
        const match = a.affiliateCode.match(new RegExp(`^IPA-${regCode}-(\\d+)`));
        if (match) {
          const n = parseInt(match[1], 10);
          if (n > maxNum) maxNum = n;
        }
      });
      const nextCodeNum = String(maxNum + 1).padStart(6, '0');
      const affiliateCode = `IPA-${regCode}-${nextCodeNum}`;
      const tempPassword = `Mega@${nextCodeNum}`;

      const agentPosition = (record.position && VALID_POSITIONS.includes(record.position as Position))
        ? (record.position as Position)
        : 'Marketing Associate';

      const positionsList = record.positions && record.positions.length > 0
        ? record.positions as Position[]
        : [agentPosition];

      // Safe date formatting & 4-month expiry computation
      const startDate = safeDatePart(record.dateCreated, new Date().toISOString().split('T')[0]);
      const expiryDate = computeExpiryDate(startDate, 4) || computeExpiryDate(new Date().toISOString(), 4);

      const newAgent: AgentProfile = {
        affiliateCode,
        firebaseUserId: `usr_imp_${Date.now()}_${nextCodeNum}`,
        fullName: record.fullName || record.email.split('@')[0],
        nickname: record.nickname || record.fullName?.split(' ')[0] || 'Affiliate',
        email: record.email,
        password: 'password123',
        passwordHash: record.passwordHash || '',
        region: regionName,
        position: agentPosition,
        positions: positionsList,
        role: 'agent',
        registrationDate: startDate,
        accountStatus: 'Active',
        profileCompletion: 100,
        currentAccreditationId: `acc_imp_${Date.now()}_${nextCodeNum}`,
        accreditationStatus: 'Active',
        accreditationStartDate: startDate,
        accreditationExpiryDate: expiryDate,
        lastAccreditationDate: startDate,
        renewalEligibility: false,
        unlockedPositions: positionsList,
        tempPassword,
        assignedStaff: 'Elena Ramos (BD Staff)',
      };

      currentAgents.push(newAgent);
      newImported++;
    });

    // Save updated agents list to client storage
    this.saveAgents(currentAgents);

    // Record audit log
    this.addAuditLog({
      user: payload.importedBy || 'Business Development Admin',
      role: (payload.importedByRole?.toLowerCase() || 'admin') as any,
      action: 'Imported Agent Records',
      recordAffected: 'Affiliate Agents Database',
      details: `Imported ${newImported} new agents, updated ${duplicatesUpdated} existing records (${duplicatesSkipped} skipped) with automated 4-month accreditation cycles and temporary login passwords.`,
    });

    // Add notification
    this.addNotification({
      targetRole: 'staff',
      title: 'Agent Import Completed',
      message: `Successfully processed ${totalProcessed} agent records (${newImported} new added, ${duplicatesUpdated} updated).`,
      category: 'Accreditation',
      actionLink: 'agents',
    });

    const message = `Import Completed: Processed ${totalProcessed} records (${newImported} new agents added, ${duplicatesUpdated} updated${duplicatesSkipped > 0 ? `, ${duplicatesSkipped} skipped` : ''}).`;

    return {
      success: true,
      message,
      totalProcessed,
      newImported,
      duplicatesUpdated,
      duplicatesSkipped,
      importedAgents: currentAgents,
    };
  },
};
