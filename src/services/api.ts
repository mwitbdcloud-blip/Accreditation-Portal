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

const BASE_URL = '/api';

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      res.ok
        ? 'The server returned an invalid response. Please refresh and try again.'
        : `The server request failed (${res.status}). Please try again.`
    );
  }
  return res.json() as Promise<T>;
}

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
    const json = await parseJson<{ success: boolean; affiliateCode: string; agent: AgentProfile; message?: string; error?: string }>(res);
    if (!res.ok) throw new Error(json.error || 'Registration failed.');
    return json;
  },

  async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user: any }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const json = await parseJson<{ success: boolean; user: any; error?: string }>(res);
    if (!res.ok) throw new Error(json.error || 'Login failed.');
    return json;
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
};
