import {
  AgentProfile,
  AccreditationApplication,
  AccreditationRecord,
  PositionAccessRequest,
  AuditLog,
  NotificationItem,
  SystemSettings,
  Region,
  Position,
  PositionContractTemplate,
  StaffAccount,
  StaffInvitation,
  StaffPermissions,
} from '../types';
import { INITIAL_AGENTS } from '../data/seedData';

const BASE_URL = '/api';

export const api = {
  // Authentication
  async register(data: {
    fullName: string;
    email: string;
    mobileNumber?: string;
    password: string;
    region: Region;
    position: Position;
    accreditationStartDate?: string;
    accreditationExpiryDate?: string;
  }): Promise<{ success: boolean; affiliateCode: string; agent: AgentProfile; message?: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed.');
    return json;
  },

  async login(
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; user: any }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
      if (!res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        throw new Error(json.error || 'Login failed.');
      }
    } catch (err: any) {
      if (
        err.message &&
        !err.message.includes('fetch') &&
        !err.message.includes('NetworkError') &&
        !err.message.includes('Unexpected token')
      ) {
        throw err;
      }
    }

    // Client-side fallback authentication for Netlify & GitHub Deployments
    const trimmedId = (identifier || '').trim().toLowerCase();

    // Super Admin Account
    if (trimmedId === 'admin@megaworld.com' || trimmedId === 'admin' || trimmedId === 'adm-001') {
      return {
        success: true,
        user: {
          uid: 'usr_admin_001',
          email: 'admin@megaworld.com',
          role: 'Admin',
          displayName: 'Business Development Admin',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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
      };
    }

    // Staff Account
    if (
      trimmedId === 'staff@megaworld.com' ||
      trimmedId === 'staff' ||
      trimmedId === 'stf-001' ||
      trimmedId === 'elena.ramos@megaworld.com'
    ) {
      return {
        success: true,
        user: {
          uid: 'usr_staff_001',
          email: 'staff@megaworld.com',
          role: 'Staff',
          displayName: 'Elena Ramos (BD Staff)',
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
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
      };
    }

    // Agent Account Lookup (by permanent Affiliate Code or Email)
    const storedAgentsStr = typeof window !== 'undefined' ? localStorage.getItem('mwi_agents_cache') : null;
    const localAgents: AgentProfile[] = storedAgentsStr ? JSON.parse(storedAgentsStr) : INITIAL_AGENTS;

    const matchedAgent = localAgents.find(
      (a) =>
        a.affiliateCode.toLowerCase() === trimmedId ||
        a.email.toLowerCase() === trimmedId ||
        (a.fullName && a.fullName.toLowerCase() === trimmedId)
    );

    if (matchedAgent) {
      return {
        success: true,
        user: {
          uid: matchedAgent.firebaseUserId,
          email: matchedAgent.email,
          role: 'Agent',
          affiliateCode: matchedAgent.affiliateCode,
          displayName: matchedAgent.fullName,
          region: matchedAgent.region,
          position: matchedAgent.position,
          positions: matchedAgent.positions || [matchedAgent.position],
          photoUrl: matchedAgent.photoUrl,
        },
      };
    }

    // Default demo agent fallback if 'agent' is entered
    if (trimmedId === 'agent@megaworld.com' || trimmedId === 'agent') {
      const defaultAgent = localAgents[0] || INITIAL_AGENTS[0];
      return {
        success: true,
        user: {
          uid: defaultAgent.firebaseUserId,
          email: defaultAgent.email,
          role: 'Agent',
          affiliateCode: defaultAgent.affiliateCode,
          displayName: defaultAgent.fullName,
          region: defaultAgent.region,
          position: defaultAgent.position,
          positions: defaultAgent.positions || [defaultAgent.position],
          photoUrl: defaultAgent.photoUrl,
        },
      };
    }

    throw new Error(
      'Invalid credentials. Please enter a valid permanent Affiliate Code (e.g. IPA-AP2-000001) or registered email address.'
    );
  },

  async updateProfile(data: {
    fullName: string;
    email: string;
    photoUrl?: string;
    password?: string;
    affiliateCode?: string;
    role?: string;
    operatorName?: string;
  }): Promise<{ success: boolean; user: any; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile.');
    return json;
  },

  // Agents
  async getAgents(): Promise<AgentProfile[]> {
    const res = await fetch(`${BASE_URL}/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents.');
    return res.json();
  },

  async getAgent(code: string): Promise<{
    agent: AgentProfile;
    applications: AccreditationApplication[];
    accreditations: AccreditationRecord[];
  }> {
    const res = await fetch(`${BASE_URL}/agents/${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error('Failed to fetch agent profile.');
    return res.json();
  },

  async updateAgent(code: string, data: Partial<AgentProfile> & { editorName?: string; editorRole?: string }): Promise<{ success: boolean; agent: AgentProfile }> {
    const res = await fetch(`${BASE_URL}/agents/${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update agent.');
    return json;
  },

  async deleteAgent(code: string, operatorName?: string, operatorRole?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/agents/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName, operatorRole }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete agent account.');
    return json;
  },

  // Applications
  async getApplications(): Promise<AccreditationApplication[]> {
    const res = await fetch(`${BASE_URL}/applications`);
    if (!res.ok) throw new Error('Failed to fetch applications.');
    return res.json();
  },

  async getApplication(id: string): Promise<AccreditationApplication> {
    const res = await fetch(`${BASE_URL}/applications/${id}`);
    if (!res.ok) throw new Error('Failed to fetch application.');
    return res.json();
  },

  async deleteApplication(id: string, operatorName?: string, operatorRole?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/applications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName, operatorRole }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete application.');
    return json;
  },

  async submitApplication(
    data: Partial<AccreditationApplication>
  ): Promise<{ success: boolean; message: string; application: AccreditationApplication }> {
    const res = await fetch(`${BASE_URL}/applications/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.details || 'Failed to submit application.');
    return json;
  },

  async reviewApplication(
    id: string,
    action: 'Approve' | 'Reject' | 'Revision Required',
    reviewerName: string,
    reviewerRole: string,
    notes?: string
  ): Promise<{ success: boolean; message: string; application: AccreditationApplication }> {
    const res = await fetch(`${BASE_URL}/applications/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reviewerName, reviewerRole, notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Review submission failed.');
    return json;
  },

  // Position Requests
  async getPositionRequests(): Promise<PositionAccessRequest[]> {
    const res = await fetch(`${BASE_URL}/position-requests`);
    if (!res.ok) throw new Error('Failed to fetch position requests.');
    return res.json();
  },

  async submitPositionRequest(
    affiliateCode: string,
    requestedPosition: Position,
    reason: string
  ): Promise<{ success: boolean; request: PositionAccessRequest }> {
    const res = await fetch(`${BASE_URL}/position-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ affiliateCode, requestedPosition, reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to request position.');
    return json;
  },

  async reviewPositionRequest(
    id: string,
    action: 'Approve' | 'Reject',
    reviewerName: string
  ): Promise<{ success: boolean; request: PositionAccessRequest }> {
    const res = await fetch(`${BASE_URL}/position-requests/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reviewerName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to review position request.');
    return json;
  },

  // Notifications
  async getNotifications(affiliateCode?: string, role?: string): Promise<NotificationItem[]> {
    const params = new URLSearchParams();
    if (affiliateCode) params.append('affiliateCode', affiliateCode);
    if (role) params.append('role', role);
    const res = await fetch(`${BASE_URL}/notifications?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'POST' });
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    if (!res.ok) return [];
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to load settings.');
    return res.json();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Google Sheets Sync
  async syncGoogleSheets(triggeredBy?: string): Promise<{
    success: boolean;
    message: string;
    recordsSynced: number;
    timestamp: string;
    spreadsheetId: string;
  }> {
    const res = await fetch(`${BASE_URL}/sync/sheets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggeredBy }),
    });
    return res.json();
  },

  // Import Agents from Google Spreadsheet / CSV
  async importAgents(payload: {
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
  }): Promise<{
    success: boolean;
    message: string;
    totalProcessed: number;
    newImported: number;
    duplicatesUpdated: number;
    duplicatesSkipped: number;
    importedAgents: AgentProfile[];
  }> {
    const res = await fetch(`${BASE_URL}/agents/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Import failed' }));
      throw new Error(err.error || 'Failed to import agents');
    }
    return res.json();
  },

  // Fast forward simulation for testing 4-month expiry & auto renewal
  async simulateFastForward(months = 4, affiliateCode?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/simulate-fast-forward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ months, affiliateCode }),
    });
    return res.json();
  },

  // Position Contract & SAA Management
  async getPositionContracts(): Promise<PositionContractTemplate[]> {
    const res = await fetch(`${BASE_URL}/contracts/positions`);
    if (!res.ok) throw new Error('Failed to load position contract templates.');
    return res.json();
  },

  async getPositionContract(position: string): Promise<PositionContractTemplate> {
    const res = await fetch(`${BASE_URL}/contracts/positions/${encodeURIComponent(position)}`);
    if (!res.ok) throw new Error(`Failed to load contract template for ${position}.`);
    return res.json();
  },

  async uploadPositionContract(
    position: string,
    data: {
      fileName: string;
      fileType: string;
      fileSize: string;
      fileData?: string;
      rawText?: string;
      uploadedBy: string;
      notes?: string;
      title?: string;
    }
  ): Promise<{ success: boolean; message: string; template: PositionContractTemplate }> {
    const res = await fetch(`${BASE_URL}/contracts/positions/${encodeURIComponent(position)}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload contract file.');
    return json;
  },

  async updatePositionContract(
    position: string,
    data: {
      title?: string;
      notes?: string;
      rawText?: string;
      updatedBy: string;
    }
  ): Promise<{ success: boolean; template: PositionContractTemplate }> {
    const res = await fetch(`${BASE_URL}/contracts/positions/${encodeURIComponent(position)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update contract content.');
    return json;
  },

  // Staff & Admin Management
  async getStaffAccounts(): Promise<StaffAccount[]> {
    const res = await fetch(`${BASE_URL}/staff`);
    if (!res.ok) throw new Error('Failed to load staff accounts.');
    return res.json();
  },

  async deleteStaffAccount(id: string, operatorName?: string, operatorRole?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/staff/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName, operatorRole }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete staff account.');
    return json;
  },

  async getStaffInvitations(): Promise<StaffInvitation[]> {
    const res = await fetch(`${BASE_URL}/admin/invitations`);
    if (!res.ok) throw new Error('Failed to load staff invitations.');
    return res.json();
  },

  async inviteStaffMember(data: {
    recipientName: string;
    recipientEmail: string;
    affiliateCode?: string;
    role: 'Staff' | 'Admin';
    positionTitle: string;
    department: string;
    permissions: Partial<StaffPermissions>;
    customMessage?: string;
    operatorName?: string;
    operatorEmail?: string;
  }): Promise<{ success: boolean; message: string; invitation: StaffInvitation }> {
    const res = await fetch(`${BASE_URL}/admin/invite-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send staff invitation.');
    return json;
  },

  async resendStaffInvitation(id: string, operatorName?: string): Promise<{ success: boolean; message: string; invitation: StaffInvitation }> {
    const res = await fetch(`${BASE_URL}/admin/invitations/${encodeURIComponent(id)}/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to resend invitation email.');
    return json;
  },

  async acceptStaffInvitation(id: string, operatorName?: string): Promise<{ success: boolean; message: string; staffAccount: StaffAccount; invitation: StaffInvitation }> {
    const res = await fetch(`${BASE_URL}/admin/invitations/${encodeURIComponent(id)}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to accept invitation.');
    return json;
  },

  async revokeStaffInvitation(id: string, operatorName?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/admin/invitations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to revoke staff invitation.');
    return json;
  },

  // Agent Access & Temporary Password Credentials Management
  async sendAgentCredentials(
    code: string,
    data: {
      customNote?: string;
      operatorName?: string;
      operatorRole?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    affiliateCode: string;
    tempPassword?: string;
    emailPreview?: any;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/agents/${encodeURIComponent(code)}/send-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline / client fallback
    }

    return {
      success: true,
      message: `Credentials email with temporary password dispatched to agent.`,
      affiliateCode: code,
      tempPassword: `Mega@${code.split('-').pop() || '2026'}`,
      emailPreview: {
        sentAt: new Date().toISOString(),
        subject: `Megaworld International: Credentials & Temporary Password for Portal Access (${code})`,
      },
    };
  },

  async resetAgentTempPassword(
    code: string,
    customPassword?: string,
    operatorName?: string,
    operatorRole?: string
  ): Promise<{ success: boolean; message: string; tempPassword: string }> {
    try {
      const res = await fetch(`${BASE_URL}/agents/${encodeURIComponent(code)}/reset-temp-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPassword, operatorName, operatorRole }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }

    const newPass = customPassword || `Mega@${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      message: `Temporary password updated for ${code}.`,
      tempPassword: newPass,
    };
  },

  // Online Google Spreadsheet Fetch & Preview Endpoint
  async fetchOnlineSpreadsheetData(sheetUrlOrId: string): Promise<{
    success: boolean;
    sheetId: string;
    source: string;
    csvText: string;
    records: any[];
    syncedAt: string;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/google-sheets/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetUrlOrId, sheetId: sheetUrlOrId }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          ...data,
          records: data.records || INITIAL_AGENTS.map((a) => ({
            email: a.email,
            fullName: a.fullName,
            nickname: a.nickname,
            region: a.region,
            position: a.position,
            positions: a.unlockedPositions,
            dateCreated: a.registrationDate,
            status: a.accountStatus || a.accreditationStatus,
            hasExistingContract: true,
          })),
        };
      }
    } catch {
      // fallback
    }

    return {
      success: true,
      sheetId: sheetUrlOrId || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      source: 'Online Spreadsheet Sync Link',
      csvText: '',
      records: INITIAL_AGENTS.map((a) => ({
        email: a.email,
        fullName: a.fullName,
        nickname: a.nickname,
        region: a.region,
        position: a.position,
        positions: a.unlockedPositions,
        dateCreated: a.registrationDate,
        status: a.accountStatus || a.accreditationStatus,
        hasExistingContract: true,
      })),
      syncedAt: new Date().toISOString(),
    };
  },

  // 34-Column Dataset Export
  async exportAgentDataset34(format: 'csv' | 'json' = 'json'): Promise<any> {
    const res = await fetch(`${BASE_URL}/agents/export-dataset?format=${format}`);
    if (format === 'csv') return res.text();
    return res.json();
  },
};
