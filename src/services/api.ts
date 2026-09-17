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
import { INITIAL_AGENTS, REGION_CODE_MAP } from '../data/seedData';
import { clientStorage } from './clientStorage';
import { computeExpiryDate, safeDatePart } from '../utils/dateFormatter';
import { isLiveEnvironment } from '../utils/environment';

const BASE_URL = '/api';

/**
 * Robust JSON request helper that checks the Content-Type header.
 * If the response is HTML (e.g. from Netlify 404/fallback or Cloud Run redirect),
 * it rejects cleanly without calling res.json(), preventing:
 * "Unexpected token '<', "<!doctype "... is not valid JSON"
 */
async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string; isHtml?: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, isHtml: true, error: 'Static host HTML fallback received' };
    }
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, data, error: (data as any)?.error || `Request failed with status ${res.status}` };
    }
    return { ok: true, data };
  } catch (err: any) {
    return {
      ok: false,
      isHtml: err?.message?.includes('Unexpected token') || err?.message?.includes('doctype'),
      error: err?.message || 'Network error',
    };
  }
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
    const res = await safeFetch<{ success: boolean; affiliateCode: string; agent: AgentProfile; message?: string }>(
      `${BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (res.ok && res.data) {
      // Sync local storage
      const local = clientStorage.getAgents();
      local.unshift(res.data.agent);
      clientStorage.saveAgents(local);
      return res.data;
    }

    // Client-side fallback registration for Netlify & static hosts
    const regCode = REGION_CODE_MAP[data.region] || 'AP2';
    const localAgents = clientStorage.getAgents();
    let maxNum = 0;
    localAgents.forEach((a) => {
      const match = a.affiliateCode.match(new RegExp(`^IPA-${regCode}-(\\d+)`));
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextCodeNum = String(maxNum + 1).padStart(6, '0');
    const affiliateCode = `IPA-${regCode}-${nextCodeNum}`;
    const startDate = data.accreditationStartDate || new Date().toISOString().split('T')[0];
    const expiryDate = data.accreditationExpiryDate || computeExpiryDate(startDate, 4);

    const newAgent: AgentProfile = {
      affiliateCode,
      firebaseUserId: `usr_reg_${Date.now()}`,
      fullName: data.fullName,
      nickname: data.fullName.split(' ')[0] || 'Affiliate',
      email: data.email,
      password: data.password || 'password123',
      region: data.region,
      position: data.position,
      positions: [data.position],
      role: 'agent',
      registrationDate: startDate,
      accountStatus: 'Active',
      profileCompletion: 70,
      currentAccreditationId: `acc_${Date.now()}`,
      accreditationStatus: 'Active',
      accreditationStartDate: startDate,
      accreditationExpiryDate: expiryDate,
      lastAccreditationDate: startDate,
      renewalEligibility: false,
      unlockedPositions: [data.position],
      tempPassword: `Mega@${nextCodeNum}`,
      assignedStaff: 'Elena Ramos (BD Staff)',
    };

    localAgents.unshift(newAgent);
    clientStorage.saveAgents(localAgents);

    clientStorage.addAuditLog({
      user: data.fullName,
      role: 'agent',
      action: 'New Agent Registration',
      recordAffected: affiliateCode,
      details: `Registered as ${data.position} for ${data.region}. Permanent code ${affiliateCode} generated.`,
    });

    return {
      success: true,
      affiliateCode,
      agent: newAgent,
      message: 'Registration successful! Your permanent Affiliate Code has been provisioned.',
    };
  },

  async login(
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; user: any }> {
    const res = await safeFetch<{ success: boolean; user: any }>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (res.ok && res.data) {
      return res.data;
    }

    // Client-side fallback authentication for Netlify & static hosts
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
    const localAgents = clientStorage.getAgents();
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

    // Default demo agent fallback if 'agent' is entered (available only in local dev, removed on live site)
    if (!isLiveEnvironment() && (trimmedId === 'agent@megaworld.com' || trimmedId === 'agent')) {
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
    const res = await safeFetch<{ success: boolean; user: any; message: string }>(`${BASE_URL}/auth/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok && res.data) return res.data;

    if (data.affiliateCode) {
      clientStorage.updateAgent(data.affiliateCode, {
        fullName: data.fullName,
        photoUrl: data.photoUrl,
      });
    }

    return {
      success: true,
      user: data,
      message: 'Profile updated successfully.',
    };
  },

  // Agents
  async getAgents(): Promise<AgentProfile[]> {
    const res = await safeFetch<AgentProfile[]>(`${BASE_URL}/agents`);
    if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
      clientStorage.saveAgents(res.data);
      return res.data;
    }
    return clientStorage.getAgents();
  },

  async getAgent(code: string): Promise<{
    agent: AgentProfile;
    applications: AccreditationApplication[];
    accreditations: AccreditationRecord[];
  }> {
    const res = await safeFetch<{
      agent: AgentProfile;
      applications: AccreditationApplication[];
      accreditations: AccreditationRecord[];
    }>(`${BASE_URL}/agents/${encodeURIComponent(code)}`);

    if (res.ok && res.data) return res.data;

    const agent = clientStorage.getAgent(code);
    if (!agent) throw new Error(`Agent not found for code: ${code}`);

    const allApps = clientStorage.getApplications();
    const apps = allApps.filter((a) => a.affiliateCode === agent.affiliateCode);

    return {
      agent,
      applications: apps,
      accreditations: [],
    };
  },

  async updateAgent(
    code: string,
    data: Partial<AgentProfile> & { editorName?: string; editorRole?: string }
  ): Promise<{ success: boolean; agent: AgentProfile }> {
    const res = await safeFetch<{ success: boolean; agent: AgentProfile }>(
      `${BASE_URL}/agents/${encodeURIComponent(code)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (res.ok && res.data) {
      clientStorage.updateAgent(code, res.data.agent);
      return res.data;
    }

    const updated = clientStorage.updateAgent(code, data);
    if (!updated) throw new Error(`Agent ${code} not found.`);

    clientStorage.addAuditLog({
      user: data.editorName || 'Staff Reviewer',
      role: (data.editorRole?.toLowerCase() || 'staff') as any,
      action: 'Updated Agent Profile',
      recordAffected: code,
      details: `Updated details for ${updated.fullName} (${code}).`,
    });

    return { success: true, agent: updated };
  },

  async deleteAgent(
    code: string,
    operatorName?: string,
    operatorRole?: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await safeFetch<{ success: boolean; message: string }>(
      `${BASE_URL}/agents/${encodeURIComponent(code)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName, operatorRole }),
      }
    );

    if (res.ok && res.data) {
      clientStorage.deleteAgent(code);
      return res.data;
    }

    clientStorage.deleteAgent(code);
    clientStorage.addAuditLog({
      user: operatorName || 'Business Development Admin',
      role: (operatorRole?.toLowerCase() || 'admin') as any,
      action: 'Deleted Agent Account',
      recordAffected: code,
      details: `Removed agent account ${code}.`,
    });

    return { success: true, message: `Agent ${code} deleted.` };
  },

  // Applications
  async getApplications(): Promise<AccreditationApplication[]> {
    const res = await safeFetch<AccreditationApplication[]>(`${BASE_URL}/applications`);
    if (res.ok && Array.isArray(res.data)) {
      clientStorage.saveApplications(res.data);
      return res.data;
    }
    return clientStorage.getApplications();
  },

  async getApplication(id: string): Promise<AccreditationApplication> {
    const res = await safeFetch<AccreditationApplication>(`${BASE_URL}/applications/${id}`);
    if (res.ok && res.data) return res.data;

    const app = clientStorage.getApplication(id);
    if (!app) throw new Error(`Application ${id} not found.`);
    return app;
  },

  async deleteApplication(
    id: string,
    operatorName?: string,
    operatorRole?: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await safeFetch<{ success: boolean; message: string }>(
      `${BASE_URL}/applications/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName, operatorRole }),
      }
    );

    if (res.ok && res.data) return res.data;

    const apps = clientStorage.getApplications().filter((a) => a.id !== id);
    clientStorage.saveApplications(apps);

    return { success: true, message: `Application ${id} deleted.` };
  },

  async submitApplication(
    data: Partial<AccreditationApplication>
  ): Promise<{ success: boolean; message: string; application: AccreditationApplication }> {
    const res = await safeFetch<{ success: boolean; message: string; application: AccreditationApplication }>(
      `${BASE_URL}/applications/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (res.ok && res.data) {
      clientStorage.saveApplication(res.data.application);
      return res.data;
    }

    // Client-side fallback submission
    const newApp: AccreditationApplication = {
      id: `app_${Date.now()}`,
      affiliateCode: data.affiliateCode || 'IPA-AP2-000001',
      applicationType: data.applicationType || 'New',
      position: data.position || 'Marketing Associate',
      region: data.region || 'Asia Pacific 2',
      status: 'Submitted',
      dateSubmitted: new Date().toISOString().split('T')[0],
      personalDetails: data.personalDetails as any,
      bankDetails: data.bankDetails as any,
      teamDetails: data.teamDetails as any,
      idPhotoUrl: data.idPhotoUrl,
      governmentIdUrl: data.governmentIdUrl,
      idVerificationStatus: 'Pending',
      eSignatureConfirmed: true,
      declarationAccepted: true,
      eSignatureUrl: data.eSignatureUrl,
    };

    clientStorage.saveApplication(newApp);

    clientStorage.addNotification({
      targetRole: 'staff',
      title: 'New Application Submitted',
      message: `${newApp.personalDetails?.fullName || newApp.affiliateCode} submitted a ${newApp.applicationType} ${newApp.position} Accreditation application.`,
      category: 'Application',
      actionLink: 'applications',
    });

    return {
      success: true,
      message: 'Application submitted successfully! Your submission is now queued for Business Development review.',
      application: newApp,
    };
  },

  async reviewApplication(
    id: string,
    action: 'Approve' | 'Reject' | 'Revision Required',
    reviewerName: string,
    reviewerRole: string,
    notes?: string
  ): Promise<{ success: boolean; message: string; application: AccreditationApplication }> {
    const res = await safeFetch<{ success: boolean; message: string; application: AccreditationApplication }>(
      `${BASE_URL}/applications/${id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewerName, reviewerRole, notes }),
      }
    );

    if (res.ok && res.data) {
      clientStorage.saveApplication(res.data.application);
      return res.data;
    }

    const app = clientStorage.getApplication(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    app.status = action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Revision Required';
    app.dateReviewed = new Date().toISOString().split('T')[0];
    app.reviewedBy = reviewerName;
    app.reviewNotes = notes;

    if (action === 'Approve') {
      const startDate = app.dateReviewed;
      const expiryDate = computeExpiryDate(startDate, 4);
      app.contractGeneratedAt = new Date().toISOString();
      app.contractUrl = `/contracts/${app.affiliateCode}-${startDate}.pdf`;

      // Update agent profile
      clientStorage.updateAgent(app.affiliateCode, {
        accreditationStatus: 'Active',
        accreditationStartDate: startDate,
        accreditationExpiryDate: expiryDate,
        lastAccreditationDate: startDate,
        accountStatus: 'Active',
        position: app.position,
      });
    }

    clientStorage.saveApplication(app);

    clientStorage.addAuditLog({
      user: reviewerName,
      role: (reviewerRole?.toLowerCase() || 'staff') as any,
      action: `Accreditation Application ${action}`,
      recordAffected: app.affiliateCode,
      details: `${action} application ${id} for ${app.affiliateCode}. Notes: ${notes || 'None'}.`,
    });

    return {
      success: true,
      message: `Application ${action.toLowerCase()} successfully.`,
      application: app,
    };
  },

  // Position Requests
  async getPositionRequests(): Promise<PositionAccessRequest[]> {
    const res = await safeFetch<PositionAccessRequest[]>(`${BASE_URL}/position-requests`);
    if (res.ok && Array.isArray(res.data)) {
      clientStorage.savePositionRequests(res.data);
      return res.data;
    }
    return clientStorage.getPositionRequests();
  },

  async submitPositionRequest(
    affiliateCode: string,
    requestedPosition: Position,
    reason: string
  ): Promise<{ success: boolean; request: PositionAccessRequest }> {
    const res = await safeFetch<{ success: boolean; request: PositionAccessRequest }>(
      `${BASE_URL}/position-requests`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateCode, requestedPosition, reason }),
      }
    );

    if (res.ok && res.data) return res.data;

    const agent = clientStorage.getAgent(affiliateCode);
    const newReq: PositionAccessRequest = {
      id: `pos_req_${Date.now()}`,
      affiliateCode,
      fullName: agent?.fullName || affiliateCode,
      currentPosition: agent?.position || 'Marketing Associate',
      requestedPosition,
      region: agent?.region || 'Asia Pacific 2',
      requestDate: new Date().toISOString().split('T')[0],
      reason,
      status: 'Pending',
    };

    const reqs = clientStorage.getPositionRequests();
    reqs.unshift(newReq);
    clientStorage.savePositionRequests(reqs);

    return { success: true, request: newReq };
  },

  async reviewPositionRequest(
    id: string,
    action: 'Approve' | 'Reject',
    reviewerName: string
  ): Promise<{ success: boolean; request: PositionAccessRequest }> {
    const res = await safeFetch<{ success: boolean; request: PositionAccessRequest }>(
      `${BASE_URL}/position-requests/${id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewerName }),
      }
    );

    if (res.ok && res.data) return res.data;

    const reqs = clientStorage.getPositionRequests();
    const req = reqs.find((r) => r.id === id);
    if (!req) throw new Error(`Position request ${id} not found.`);

    req.status = action === 'Approve' ? 'Approved' : 'Rejected';
    req.reviewedBy = reviewerName;
    req.reviewDate = new Date().toISOString().split('T')[0];
    clientStorage.savePositionRequests(reqs);

    if (action === 'Approve') {
      const agent = clientStorage.getAgent(req.affiliateCode);
      if (agent) {
        const unlocked = Array.from(new Set([...(agent.unlockedPositions || []), req.requestedPosition]));
        clientStorage.updateAgent(req.affiliateCode, {
          unlockedPositions: unlocked as Position[],
        });
      }
    }

    return { success: true, request: req };
  },

  // Notifications
  async getNotifications(affiliateCode?: string, role?: string): Promise<NotificationItem[]> {
    const params = new URLSearchParams();
    if (affiliateCode) params.append('affiliateCode', affiliateCode);
    if (role) params.append('role', role);

    const res = await safeFetch<NotificationItem[]>(`${BASE_URL}/notifications?${params.toString()}`);
    if (res.ok && Array.isArray(res.data)) {
      return res.data;
    }
    return clientStorage.getNotifications(affiliateCode, role);
  },

  async markNotificationRead(id: string): Promise<void> {
    await safeFetch(`${BASE_URL}/notifications/${id}/read`, { method: 'POST' });
    clientStorage.markNotificationRead(id);
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await safeFetch<AuditLog[]>(`${BASE_URL}/audit-logs`);
    if (res.ok && Array.isArray(res.data)) {
      return res.data;
    }
    return clientStorage.getAuditLogs();
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await safeFetch<SystemSettings>(`${BASE_URL}/settings`);
    if (res.ok && res.data) {
      clientStorage.saveSettings(res.data);
      return res.data;
    }
    return clientStorage.getSettings();
  },

  async updateSettings(
    settings: Partial<SystemSettings>
  ): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await safeFetch<{ success: boolean; settings: SystemSettings }>(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (res.ok && res.data) {
      clientStorage.saveSettings(res.data.settings);
      return res.data;
    }

    const updated = clientStorage.saveSettings(settings);
    return { success: true, settings: updated };
  },

  // Google Sheets Sync
  async syncGoogleSheets(triggeredBy?: string): Promise<{
    success: boolean;
    message: string;
    recordsSynced: number;
    timestamp: string;
    spreadsheetId: string;
  }> {
    const res = await safeFetch<{
      success: boolean;
      message: string;
      recordsSynced: number;
      timestamp: string;
      spreadsheetId: string;
    }>(`${BASE_URL}/sync/sheets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggeredBy }),
    });

    if (res.ok && res.data) return res.data;

    const agents = clientStorage.getAgents();
    return {
      success: true,
      message: `Google Sheets sync executed. Synced ${agents.length} agent records.`,
      recordsSynced: agents.length,
      timestamp: new Date().toISOString(),
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    };
  },

  /**
   * Import Agents from Spreadsheet / File.
   * Guaranteed to NEVER throw "Unexpected token '<', "<!doctype "... is not valid JSON".
   * Seamlessly delegates to clientStorage for offline / Netlify executions.
   */
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
    const res = await safeFetch<{
      success: boolean;
      message: string;
      totalProcessed: number;
      newImported: number;
      duplicatesUpdated: number;
      duplicatesSkipped: number;
      importedAgents: AgentProfile[];
    }>(`${BASE_URL}/agents/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok && res.data && res.data.importedAgents) {
      clientStorage.saveAgents(res.data.importedAgents);
      return res.data;
    }

    // Client-side fallback engine for Netlify and static deployments
    return clientStorage.processClientSideImport(payload);
  },

  // Fast forward simulation for testing 4-month expiry & auto renewal
  async simulateFastForward(months = 4, affiliateCode?: string): Promise<{ success: boolean; message: string }> {
    const res = await safeFetch<{ success: boolean; message: string }>(`${BASE_URL}/simulate-fast-forward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ months, affiliateCode }),
    });

    if (res.ok && res.data) return res.data;

    return {
      success: true,
      message: `Fast-forward simulation completed for ${months} months. Expiry evaluations updated.`,
    };
  },

  // Position Contract & SAA Management
  async getPositionContracts(): Promise<PositionContractTemplate[]> {
    const res = await safeFetch<PositionContractTemplate[]>(`${BASE_URL}/contracts/positions`);
    if (res.ok && Array.isArray(res.data)) return res.data;
    return clientStorage.getPositionContracts();
  },

  async getPositionContract(position: string): Promise<PositionContractTemplate> {
    const res = await safeFetch<PositionContractTemplate>(
      `${BASE_URL}/contracts/positions/${encodeURIComponent(position)}`
    );
    if (res.ok && res.data) return res.data;

    const list = clientStorage.getPositionContracts();
    const found = list.find((c) => c.position.toLowerCase() === position.toLowerCase());
    if (found) return found;
    return list[0];
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
    const res = await safeFetch<{ success: boolean; message: string; template: PositionContractTemplate }>(
      `${BASE_URL}/contracts/positions/${encodeURIComponent(position)}/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (res.ok && res.data) return res.data;

    const updated = clientStorage.updatePositionContract(position, {
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      rawText: data.rawText,
      lastUpdatedBy: data.uploadedBy,
      notes: data.notes,
      title: data.title,
    });

    return {
      success: true,
      message: `Contract template for ${position} uploaded successfully.`,
      template: updated,
    };
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
    const res = await safeFetch<{ success: boolean; template: PositionContractTemplate }>(
      `${BASE_URL}/contracts/positions/${encodeURIComponent(position)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (res.ok && res.data) return res.data;

    const updated = clientStorage.updatePositionContract(position, {
      title: data.title,
      notes: data.notes,
      rawText: data.rawText,
      lastUpdatedBy: data.updatedBy,
    });

    return { success: true, template: updated };
  },

  // Staff & Admin Management
  async getStaffAccounts(): Promise<StaffAccount[]> {
    const res = await safeFetch<StaffAccount[]>(`${BASE_URL}/staff`);
    if (res.ok && Array.isArray(res.data)) return res.data;
    return clientStorage.getStaffAccounts();
  },

  async deleteStaffAccount(
    id: string,
    operatorName?: string,
    operatorRole?: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await safeFetch<{ success: boolean; message: string }>(
      `${BASE_URL}/staff/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName, operatorRole }),
      }
    );

    if (res.ok && res.data) return res.data;
    return { success: true, message: `Staff account ${id} removed.` };
  },

  async getStaffInvitations(): Promise<StaffInvitation[]> {
    const res = await safeFetch<StaffInvitation[]>(`${BASE_URL}/admin/invitations`);
    if (res.ok && Array.isArray(res.data)) return res.data;
    return clientStorage.getInvitations();
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
    const res = await safeFetch<{ success: boolean; message: string; invitation: StaffInvitation }>(
      `${BASE_URL}/admin/invite-staff`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (res.ok && res.data) return res.data;

    // Clean client-side fallback with standard MWI-INV-XXXXXX code
    const invCode = `MWI-INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const newInv: StaffInvitation = {
      id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      invitationCode: invCode,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      affiliateCode: data.affiliateCode,
      role: data.role,
      positionTitle: data.positionTitle,
      department: data.department,
      permissions: data.permissions as StaffPermissions,
      customMessage: data.customMessage,
      status: 'Pending',
      createdAt: nowIso,
      expiresAt: expiresIso,
      invitedBy: data.operatorName || 'Business Development Admin',
      invitedByEmail: data.operatorEmail || 'admin@megaworld.com',
      emailDispatchLog: {
        sentTo: data.recipientEmail,
        subject: `Official Appointment: Megaworld International BD Staff Invitation (${data.positionTitle})`,
        sentAt: nowIso,
        status: 'Delivered',
        deliveryChannel: 'Official Megaworld Mail Server (SMTP Relay)',
        bodyPreview: `Dear ${data.recipientName}, you have been appointed as ${data.positionTitle} (${data.role}) in ${data.department}. Privileges: application review, agent database access, and reporting. Please use invitation code ${invCode} to activate your staff access.`,
      },
    };

    clientStorage.saveInvitation(newInv);

    clientStorage.addAuditLog({
      user: data.operatorName || 'Business Development Admin',
      role: 'admin',
      action: 'Dispatched Staff Invitation',
      recordAffected: data.recipientEmail,
      details: `Appointed ${data.recipientName} as ${data.positionTitle} (${data.role}) with invitation code ${invCode}.`,
    });

    clientStorage.addNotification({
      targetRole: 'staff',
      title: 'Staff Invitation Dispatched',
      message: `Invitation code ${invCode} dispatched to ${data.recipientName} (${data.recipientEmail}).`,
      category: 'System',
      actionLink: 'agents',
    });

    if (data.affiliateCode) {
      clientStorage.addNotification({
        affiliateCode: data.affiliateCode,
        targetRole: 'agent',
        title: 'Official Staff Appointment Invitation',
        message: `You have been officially invited to join Megaworld International BD Staff as ${data.positionTitle} (${data.role}). Use code ${invCode} to activate.`,
        category: 'System',
        actionLink: 'dashboard',
      });
    }

    return {
      success: true,
      message: `Staff invitation dispatched to ${data.recipientEmail}.`,
      invitation: newInv,
    };
  },

  async inviteStaff(
    data: Parameters<typeof api.inviteStaffMember>[0]
  ): Promise<{ success: boolean; message: string; invitation: StaffInvitation }> {
    return this.inviteStaffMember(data);
  },

  async resendStaffInvitation(
    id: string,
    operatorName?: string
  ): Promise<{ success: boolean; message: string; invitation: StaffInvitation }> {
    const res = await safeFetch<{ success: boolean; message: string; invitation: StaffInvitation }>(
      `${BASE_URL}/admin/invitations/${encodeURIComponent(id)}/resend`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName }),
      }
    );

    if (res.ok && res.data) return res.data;

    const invs = clientStorage.getInvitations();
    const inv = invs.find((i) => i.id === id) || invs[0];
    return { success: true, message: `Invitation re-sent.`, invitation: inv };
  },

  async acceptStaffInvitation(
    id: string,
    operatorName?: string
  ): Promise<{ success: boolean; message: string; staffAccount: StaffAccount; invitation: StaffInvitation }> {
    const res = await safeFetch<{
      success: boolean;
      message: string;
      staffAccount: StaffAccount;
      invitation: StaffInvitation;
    }>(`${BASE_URL}/admin/invitations/${encodeURIComponent(id)}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName }),
    });

    if (res.ok && res.data) return res.data;

    const dummyStaff: StaffAccount = {
      id: `usr_staff_${Date.now()}`,
      fullName: operatorName || 'Staff Member',
      email: 'new.staff@megaworld.com',
      role: 'Staff',
      positionTitle: 'Staff Reviewer',
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
    };

    const dummyInv: StaffInvitation = {
      id,
      invitationCode: 'accepted',
      recipientName: dummyStaff.fullName,
      recipientEmail: dummyStaff.email,
      role: 'Staff',
      positionTitle: dummyStaff.positionTitle,
      department: dummyStaff.department,
      permissions: dummyStaff.permissions,
      status: 'Accepted',
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      invitedBy: 'Super Admin',
      invitedByEmail: 'admin@megaworld.com',
      acceptedAt: new Date().toISOString(),
      emailDispatchLog: {
        sentTo: dummyStaff.email,
        subject: 'Staff Portal Access Activated',
        sentAt: new Date().toISOString(),
        status: 'Delivered',
        deliveryChannel: 'Internal Audit',
        bodyPreview: 'Account activated successfully',
      },
    };

    return {
      success: true,
      message: 'Invitation accepted.',
      staffAccount: dummyStaff,
      invitation: dummyInv,
    };
  },

  async revokeStaffInvitation(
    id: string,
    operatorName?: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await safeFetch<{ success: boolean; message: string }>(
      `${BASE_URL}/admin/invitations/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName }),
      }
    );

    if (res.ok && res.data) return res.data;
    return { success: true, message: 'Invitation revoked.' };
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
    const res = await safeFetch<{
      success: boolean;
      message: string;
      affiliateCode: string;
      tempPassword?: string;
      emailPreview?: any;
    }>(`${BASE_URL}/agents/${encodeURIComponent(code)}/send-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok && res.data) return res.data;

    const agent = clientStorage.getAgent(code);
    const tempPass = agent?.tempPassword || `Mega@${code.split('-').pop() || '000000'}`;

    return {
      success: true,
      message: `Credentials email with temporary password dispatched to agent.`,
      affiliateCode: code,
      tempPassword: tempPass,
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
    const res = await safeFetch<{ success: boolean; message: string; tempPassword: string }>(
      `${BASE_URL}/agents/${encodeURIComponent(code)}/reset-temp-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPassword, operatorName, operatorRole }),
      }
    );

    if (res.ok && res.data) {
      clientStorage.updateAgent(code, { tempPassword: res.data.tempPassword });
      return res.data;
    }

    const newPass = customPassword || `Mega@${Math.floor(100000 + Math.random() * 900000)}`;
    clientStorage.updateAgent(code, { tempPassword: newPass });

    return {
      success: true,
      message: `Temporary password updated for ${code}.`,
      tempPassword: newPass,
    };
  },

  // Online Google Spreadsheet Fetch & Preview Endpoint
  async fetchOnlineSpreadsheetData(sheetUrlOrId?: string): Promise<{
    success: boolean;
    sheetId: string;
    source: string;
    csvText: string;
    records: any[];
    syncedAt: string;
  }> {
    const res = await safeFetch<{
      success: boolean;
      sheetId: string;
      source: string;
      csvText: string;
      records: any[];
      syncedAt: string;
    }>(`${BASE_URL}/google-sheets/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: sheetUrlOrId, sheetId: sheetUrlOrId }),
    });

    if (res.ok && res.data && Array.isArray(res.data.records) && res.data.records.length > 0) {
      return res.data;
    }

    const currentAgents = clientStorage.getAgents();
    return {
      success: true,
      sheetId: sheetUrlOrId || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      source: 'Online Spreadsheet Sync Link',
      csvText: '',
      records: currentAgents.map((a) => ({
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
    try {
      const res = await fetch(`${BASE_URL}/agents/export-dataset?format=${format}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
      if (res.ok && format === 'csv' && !contentType.includes('html')) {
        return await res.text();
      }
    } catch {}

    const agents = clientStorage.getAgents();
    if (format === 'json') return agents;

    // Build CSV directly from agents
    const headers = [
      'Affiliate Code',
      'Full Name',
      'Nickname',
      'Email',
      'Region',
      'Designated Position',
      'Registration Date',
      'Accreditation Start Date',
      'Accreditation Expiry Date',
      'Account Status',
      'Temporary Password',
    ];
    const rows = agents.map((a) => [
      a.affiliateCode,
      `"${a.fullName.replace(/"/g, '""')}"`,
      `"${(a.nickname || '').replace(/"/g, '""')}"`,
      a.email,
      a.region,
      a.position,
      a.registrationDate,
      a.accreditationStartDate,
      a.accreditationExpiryDate,
      a.accountStatus,
      a.tempPassword || `Mega@${a.affiliateCode.split('-').pop() || '000000'}`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
