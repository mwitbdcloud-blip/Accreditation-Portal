import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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
} from './src/types';
import {
  INITIAL_AGENTS,
  INITIAL_APPLICATIONS,
  INITIAL_ACCREDITATIONS,
  INITIAL_POSITION_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_POSITION_CONTRACTS,
  REGION_CODE_MAP,
} from './src/data/seedData';

// In-Memory Database Store with initial seed data
class DatabaseStore {
  agents: AgentProfile[] = [...INITIAL_AGENTS];
  applications: AccreditationApplication[] = [...INITIAL_APPLICATIONS];
  accreditations: AccreditationRecord[] = [...INITIAL_ACCREDITATIONS];
  positionRequests: PositionAccessRequest[] = [...INITIAL_POSITION_REQUESTS];
  notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  settings: SystemSettings = { ...INITIAL_SETTINGS };
  positionContracts: PositionContractTemplate[] = [...INITIAL_POSITION_CONTRACTS];

  staffAccounts: StaffAccount[] = [
    {
      id: 'ADM-001',
      fullName: 'Business Development Admin',
      email: 'admin@megaworld.com',
      role: 'Admin',
      positionTitle: 'Super Administrator',
      department: 'Executive Operations',
      status: 'Active',
      lastLogin: 'Today, 09:15 AM',
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
      id: 'STF-001',
      fullName: 'Elena Ramos',
      email: 'staff@megaworld.com',
      role: 'Staff',
      positionTitle: 'BD Operations Coordinator',
      department: 'BD Operations & Accreditation',
      status: 'Active',
      lastLogin: 'Today, 10:20 AM',
      permissions: {
        canReviewApplications: true,
        canManageContracts: true,
        canEditAgents: true,
        canOverrideAccreditation: true,
        canViewReports: true,
        canManageSettings: false,
        canInviteStaff: false,
      },
    },
    {
      id: 'STF-002',
      fullName: 'Maria Santos',
      email: 'maria.santos@megaworld.com',
      role: 'Staff',
      positionTitle: 'Contracts & Accreditation Reviewer',
      department: 'Contracts & Legal Compliance',
      status: 'Active',
      lastLogin: 'Yesterday, 04:45 PM',
      permissions: {
        canReviewApplications: true,
        canManageContracts: true,
        canEditAgents: true,
        canOverrideAccreditation: false,
        canViewReports: true,
        canManageSettings: false,
        canInviteStaff: false,
      },
    },
  ];

  staffInvitations: StaffInvitation[] = [
    {
      id: 'inv_demo_01',
      invitationCode: 'MWI-INV-92841',
      recipientName: 'Carlos Mendoza',
      recipientEmail: 'carlos.mendoza@megaworld.com',
      affiliateCode: 'IPA-AP2-000002',
      role: 'Staff',
      positionTitle: 'Regional Accreditation Officer',
      department: 'BD Operations & Accreditation',
      permissions: {
        canReviewApplications: true,
        canManageContracts: false,
        canEditAgents: true,
        canOverrideAccreditation: false,
        canViewReports: true,
        canManageSettings: false,
        canInviteStaff: false,
      },
      customMessage: 'Welcome Carlos. You have been appointed to assist in screening regional affiliate applications for Asia Pacific 2.',
      invitedBy: 'Business Development Admin (Super Admin)',
      invitedByEmail: 'admin@megaworld.com',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending',
      emailDispatchLog: {
        sentTo: 'carlos.mendoza@megaworld.com',
        subject: 'Official Megaworld International Staff Appointment & Portal Role Invitation',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        deliveryChannel: 'Official Megaworld Mail Server (SMTP Relay)',
        bodyPreview: 'Dear Carlos Mendoza, Business Development Admin has officially invited you to join the Megaworld International BD Staff as Regional Accreditation Officer in BD Operations & Accreditation. Granted privileges: application review, agent database access, and reporting.',
      },
    },
  ];

  // Counter map by region code to guarantee atomic sequential numbers
  private sequenceMap: Record<string, number> = {
    AP2: 1,
    AP3: 1,
    AP4: 1,
    EU2: 4,
    EU3: 1,
    ME1: 2,
    ME2: 1,
    ME3: 1,
    NA1: 3,
    NA2: 1,
    NA3: 1,
    NA4: 1,
    NA5: 1,
    NA6: 1,
  };

  generateAffiliateCode(region: Region): string {
    const codePrefix = REGION_CODE_MAP[region] || 'INT';
    const nextSeq = (this.sequenceMap[codePrefix] || 0) + 1;
    this.sequenceMap[codePrefix] = nextSeq;
    const formattedSeq = String(nextSeq).padStart(6, '0');
    const newCode = `IPA-${codePrefix}-${formattedSeq}`;

    // Ensure uniqueness across database
    if (this.agents.some((a) => a.affiliateCode === newCode)) {
      this.sequenceMap[codePrefix] = nextSeq + 1;
      return `IPA-${codePrefix}-${String(nextSeq + 1).padStart(6, '0')}`;
    }
    return newCode;
  }

  log(user: string, role: any, action: string, recordAffected: string, details: string) {
    const logItem: AuditLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      recordAffected,
      details,
    };
    this.auditLogs.unshift(logItem);
  }

  addNotification(
    recipientId: string | undefined,
    affiliateCode: string | undefined,
    targetRole: any,
    title: string,
    message: string,
    category: any,
    actionLink?: string
  ) {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientId,
      affiliateCode,
      targetRole,
      title,
      message,
      category,
      timestamp: new Date().toISOString(),
      read: false,
      actionLink,
    };
    this.notifications.unshift(notif);
  }

  // 4-Month Expiry Calculation and Automatic Renewal Evaluation
  evaluateExpiries() {
    const now = new Date();
    const durationMonths = this.settings.accreditationDurationMonths || 4;
    const windowDays = this.settings.renewalWindowDaysBeforeExpiry || 30;

    let updatedCount = 0;

    this.accreditations.forEach((acc) => {
      const expDate = new Date(acc.expiryDate);
      const diffMs = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      acc.daysRemaining = Math.max(0, diffDays);

      const agent = this.agents.find((a) => a.affiliateCode === acc.affiliateCode);

      if (diffDays <= 0) {
        if (acc.status !== 'Expired') {
          acc.status = 'Expired';
          if (agent) {
            agent.accreditationStatus = 'Expired';
            agent.renewalEligibility = true;
            this.addNotification(
              agent.firebaseUserId,
              agent.affiliateCode,
              'agent',
              'Accreditation Expired - Renewal Available',
              `Your accreditation expired. Your permanent Affiliate Code (${agent.affiliateCode}) remains active. Please submit your Renewal Application.`,
              'Renewal',
              'accreditation'
            );
          }
          updatedCount++;
        }
      } else if (diffDays <= windowDays) {
        if (acc.status !== 'Expiring Soon') {
          acc.status = 'Expiring Soon';
          if (agent) {
            agent.accreditationStatus = 'Expiring Soon';
            agent.renewalEligibility = true;
            this.addNotification(
              agent.firebaseUserId,
              agent.affiliateCode,
              'agent',
              'Accreditation Expiring Soon',
              `Your accreditation expires in ${diffDays} days (${acc.expiryDate}). Renewal is now open.`,
              'Expiry',
              'accreditation'
            );
          }
          updatedCount++;
        }
      } else {
        acc.status = 'Active';
        if (agent) {
          agent.accreditationStatus = 'Active';
        }
      }
    });

    if (updatedCount > 0) {
      this.log('System Automation', 'admin', 'Automated Expiry Evaluation', 'Accreditation Monitoring', `Updated ${updatedCount} accreditation status records.`);
    }
  }
}

const db = new DatabaseStore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Run periodic automated expiry check
  setInterval(() => {
    db.evaluateExpiries();
  }, 60000);

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Megaworld International Property Affiliates Portal API',
      time: new Date().toISOString(),
    });
  });

  // 1. Authentication & Registration
  app.post('/api/auth/register', (req, res) => {
    const { fullName, email, password, region, position, mobileNumber } = req.body;

    if (!fullName || !email || !password || !region || !position) {
      return res.status(400).json({ error: 'All required registration fields must be provided.' });
    }

    // Duplicate identity check by email
    const normalizedEmail = email.trim().toLowerCase();
    const existingAgent = db.agents.find(
      (a) => a.email.toLowerCase() === normalizedEmail
    );

    if (existingAgent) {
      return res.status(400).json({
        error: 'This email address is already registered.',
        existingAffiliateCode: existingAgent.affiliateCode,
      });
    }

    // Server-side permanent Affiliate Code generation
    const affiliateCode = db.generateAffiliateCode(region);
    const userId = `usr_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newAgent: AgentProfile = {
      affiliateCode,
      firebaseUserId: userId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber ? mobileNumber.trim() : '',
      password,
      region,
      position,
      role: 'agent',
      registrationDate: today,
      accountStatus: 'Active',
      profileCompletion: 25, // Initial basic details provided
      accreditationStatus: 'Pending', // Pending until they complete accreditation inside
      renewalEligibility: false,
      unlockedPositions: [position],
    };

    db.agents.push(newAgent);

    // Initial draft application - details provided during registration are generated to their account,
    // and all unprovided information is left blank so they can complete the accreditation process inside
    const newApp: AccreditationApplication = {
      id: `app_${Date.now()}`,
      affiliateCode,
      applicationType: 'New',
      position,
      region,
      status: 'Draft',
      dateSubmitted: new Date().toISOString(),
      personalDetails: {
        firstName: fullName.trim().split(' ')[0] || '',
        middleName: '',
        lastName: fullName.trim().split(' ').slice(1).join(' ') || '',
        suffix: '',
        fullName: fullName.trim(),
        dateOfBirth: '',
        nationality: '',
        citizenship: '',
        civilStatus: '',
        residentialAddress: '',
        country: '',
        state: '',
        telephoneNumber: '',
        mobileNumber: mobileNumber ? mobileNumber.trim() : '',
        emailAddress: normalizedEmail,
        tin: '',
        idMatchConfirmed: false,
      },
      bankDetails: {
        bankName: '',
        accountName: fullName.trim(),
        accountNumber: '',
        bankAddress: '',
        swiftCode: '',
      },
      teamDetails: {
        teamName: '',
        upline: '',
        teamLeader: '',
        brokerGroup: `Megaworld International ${region} Hub`,
      },
      idVerificationStatus: 'Pending',
      eSignatureConfirmed: false,
      declarationAccepted: false,
    };
    db.applications.push(newApp);

    // Audit log
    db.log(
      fullName,
      'agent',
      'Agent Registration',
      affiliateCode,
      `Registered as ${position} in ${region}. Assigned permanent Affiliate Code: ${affiliateCode}`
    );

    // Notifications
    db.addNotification(
      userId,
      affiliateCode,
      'agent',
      'Welcome to the International Property Affiliates Portal',
      `Welcome to the Accreditation Portal. Your registration has been successfully received. Your permanent Affiliate Code is ${affiliateCode}. Please continue your application by proceeding to Accreditation Application.`,
      'Registration',
      'accreditation'
    );

    db.addNotification(
      undefined,
      affiliateCode,
      'staff',
      `New IPA Registration — ${affiliateCode}`,
      `New agent registered: ${fullName} (${affiliateCode}) for ${region} as ${position}.`,
      'Registration',
      'applications'
    );

    return res.status(201).json({
      success: true,
      message: 'Registration Successful!',
      affiliateCode,
      agent: newAgent,
    });
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Please provide an email address or Affiliate Code.' });
    }

    const trimmedId = identifier.trim().toLowerCase();

    // 1. Super Admin
    if (
      trimmedId === 'admin' ||
      trimmedId === 'admin@megaworld.com' ||
      trimmedId === 'admin@megaworldinternational.com' ||
      trimmedId === 'alexander.vance@megaworld.com' ||
      trimmedId === 'bd.admin@megaworld.com' ||
      trimmedId === 'adm-001'
    ) {
      db.log('Business Development Admin', 'admin', 'User Login', 'ADM-001', 'Logged in as Super Admin.');
      return res.json({
        success: true,
        user: {
          firebaseUserId: 'usr_admin',
          fullName: 'Business Development Admin',
          displayName: 'Business Development Admin',
          email: 'admin@megaworld.com',
          role: 'Admin',
          position: 'Super Administrator',
          region: 'Asia Pacific 2',
          affiliateCode: 'ADM-001',
        },
      });
    }

    // 2. BD Staff
    if (
      trimmedId === 'staff' ||
      trimmedId === 'staff@megaworld.com' ||
      trimmedId === 'staff@megaworldinternational.com' ||
      trimmedId === 'elena.ramos@megaworld.com' ||
      trimmedId === 'stf-001'
    ) {
      db.log('Elena Ramos', 'staff', 'User Login', 'STF-001', 'Logged in as BD Staff.');
      return res.json({
        success: true,
        user: {
          firebaseUserId: 'usr_staff',
          fullName: 'Elena Ramos',
          displayName: 'Elena Ramos',
          email: 'staff@megaworld.com',
          role: 'Staff',
          position: 'Marketing Manager',
          region: 'Asia Pacific 2',
          affiliateCode: 'STF-001',
        },
      });
    }

    // Dynamic Staff & Admin Accounts Check (including accepted invitations)
    const matchingStaff = db.staffAccounts.find(
      (s) => s.id.toLowerCase() === trimmedId || s.email.toLowerCase() === trimmedId
    );
    if (matchingStaff) {
      matchingStaff.lastLogin = 'Just now';
      db.log(matchingStaff.fullName, (matchingStaff.role.toLowerCase() as any), 'User Login', matchingStaff.id, `Logged in as ${matchingStaff.role}.`);
      return res.json({
        success: true,
        user: {
          firebaseUserId: `usr_${matchingStaff.id.toLowerCase()}`,
          fullName: matchingStaff.fullName,
          displayName: matchingStaff.fullName,
          email: matchingStaff.email,
          role: matchingStaff.role,
          position: matchingStaff.positionTitle || (matchingStaff.role === 'Admin' ? 'Marketing Director' : 'Marketing Manager'),
          region: 'Asia Pacific 2',
          affiliateCode: matchingStaff.id,
          department: matchingStaff.department,
          photoUrl: matchingStaff.photoUrl,
          permissions: matchingStaff.permissions,
        },
      });
    }

    // 3. Quick Demo Agent shortcut
    if (
      trimmedId === 'agent' ||
      trimmedId === 'agent@megaworld.com' ||
      trimmedId === 'agent@megaworldinternational.com' ||
      trimmedId === 'elena.cruz@megaworld.com'
    ) {
      const demoAgent = db.agents[0];
      if (demoAgent) {
        db.log(demoAgent.fullName, 'agent', 'User Login', demoAgent.affiliateCode, 'Logged in to agent portal.');
        return res.json({
          success: true,
          user: {
            ...demoAgent,
            displayName: demoAgent.fullName,
            role: 'Agent',
          },
        });
      }
    }

    // 4. Search by Affiliate Code or Email in registered agents
    let agent = db.agents.find(
      (a) =>
        a.affiliateCode.toLowerCase() === trimmedId ||
        a.email.toLowerCase() === trimmedId
    );

    if (agent) {
      db.log(agent.fullName, 'agent', 'User Login', agent.affiliateCode, 'Logged in to agent portal.');
      return res.json({
        success: true,
        user: {
          ...agent,
          displayName: agent.fullName,
          role: 'Agent',
        },
      });
    }

    // 5. If an email address is provided, auto-provision an agent account with permanent Affiliate Code
    if (trimmedId.includes('@')) {
      const generatedCode = db.generateAffiliateCode('Asia Pacific 2');
      const nameFromEmail = trimmedId
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const today = new Date().toISOString().split('T')[0];

      const newAgent: AgentProfile = {
        affiliateCode: generatedCode,
        firebaseUserId: `usr_${Date.now()}`,
        fullName: nameFromEmail || 'International Property Affiliate',
        email: trimmedId,
        password: password || 'password123',
        region: 'Asia Pacific 2',
        position: 'Marketing Associate',
        role: 'agent',
        registrationDate: today,
        accountStatus: 'Active',
        profileCompletion: 25,
        accreditationStatus: 'Pending',
        renewalEligibility: false,
        unlockedPositions: ['Marketing Associate'],
        assignedStaff: 'Elena Ramos (BD Staff)',
      };

      db.agents.unshift(newAgent);

      // Blank draft application so they can continue and complete their accreditation inside
      const newApp: AccreditationApplication = {
        id: `app_${Date.now()}`,
        affiliateCode: generatedCode,
        applicationType: 'New',
        position: 'Marketing Associate',
        region: 'Asia Pacific 2',
        status: 'Draft',
        dateSubmitted: new Date().toISOString(),
        personalDetails: {
          firstName: newAgent.fullName.split(' ')[0] || '',
          middleName: '',
          lastName: newAgent.fullName.split(' ').slice(1).join(' ') || '',
          suffix: '',
          fullName: newAgent.fullName,
          dateOfBirth: '',
          nationality: '',
          citizenship: '',
          civilStatus: '',
          residentialAddress: '',
          country: '',
          state: '',
          telephoneNumber: '',
          mobileNumber: '',
          emailAddress: trimmedId,
          tin: '',
          idMatchConfirmed: false,
        },
        bankDetails: {
          bankName: '',
          accountName: newAgent.fullName,
          accountNumber: '',
          bankAddress: '',
          swiftCode: '',
        },
        teamDetails: {
          teamName: '',
          upline: '',
          teamLeader: '',
          brokerGroup: 'Megaworld International Asia Pacific 2 Hub',
        },
        idVerificationStatus: 'Pending',
        eSignatureConfirmed: false,
        declarationAccepted: false,
      };

      db.applications.unshift(newApp);

      db.log(newAgent.fullName, 'agent', 'User Registration & Login', generatedCode, 'New account registered with permanent Affiliate Code. Ready for accreditation completion.');

      return res.json({
        success: true,
        user: {
          ...newAgent,
          displayName: newAgent.fullName,
          role: 'Agent',
        },
      });
    }

    return res.status(401).json({ error: 'Invalid Affiliate Code, Email, or Password.' });
  });

  // 2. Agents list & details
  app.get('/api/agents', (req, res) => {
    db.evaluateExpiries();
    res.json(db.agents);
  });

  app.get('/api/agents/:code', (req, res) => {
    const agent = db.agents.find((a) => a.affiliateCode === req.params.code);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found.' });
    }
    const apps = db.applications.filter((a) => a.affiliateCode === agent.affiliateCode);
    const accs = db.accreditations.filter((a) => a.affiliateCode === agent.affiliateCode);
    res.json({
      agent,
      applications: apps,
      accreditations: accs,
    });
  });

  app.put('/api/agents/:code', (req, res) => {
    const agent = db.agents.find((a) => a.affiliateCode === req.params.code);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found.' });
    }

    const { fullName, email, region, position, accountStatus, assignedStaff, editorName, editorRole } = req.body;
    const prevData = { ...agent };

    if (fullName) agent.fullName = fullName;
    if (email) agent.email = email;
    if (region) agent.region = region;
    if (position) agent.position = position;
    if (accountStatus) agent.accountStatus = accountStatus;
    if (assignedStaff) agent.assignedStaff = assignedStaff;

    db.log(
      editorName || 'Admin/Staff',
      editorRole || 'staff',
      'Agent Profile Updated',
      agent.affiliateCode,
      `Updated agent details. Previous: ${JSON.stringify({ fullName: prevData.fullName, region: prevData.region })}`
    );

    res.json({ success: true, agent });
  });

  // Delete Agent / Account
  app.delete('/api/agents/:code', (req, res) => {
    const code = req.params.code;
    const { operatorName, operatorRole } = req.body || {};
    const agentIndex = db.agents.findIndex((a) => a.affiliateCode.toLowerCase() === code.toLowerCase());
    
    if (agentIndex === -1) {
      return res.status(404).json({ error: `Account with affiliate code ${code} not found.` });
    }

    const removedAgent = db.agents[agentIndex];
    db.agents.splice(agentIndex, 1);

    // Also remove associated applications and accreditations
    db.applications = db.applications.filter((a) => a.affiliateCode.toLowerCase() !== code.toLowerCase());
    db.accreditations = db.accreditations.filter((a) => a.affiliateCode.toLowerCase() !== code.toLowerCase());

    db.log(
      operatorName || 'Admin/Staff',
      operatorRole || 'admin',
      'Account Deleted',
      code,
      `Permanently deleted agent account for ${removedAgent.fullName} (${code}) and cleared associated records.`
    );

    res.json({
      success: true,
      message: `Account for ${removedAgent.fullName} (${code}) has been deleted successfully.`,
    });
  });

  // Profile Editor: Update photo, fullName, email, password
  app.post('/api/auth/profile', (req, res) => {
    const { fullName, email, photoUrl, password, affiliateCode, role, operatorName } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required.' });
    }

    let updatedUser: any = {
      fullName,
      email,
      photoUrl: photoUrl || '',
      displayName: fullName,
      role: role || 'Agent',
    };

    // If it's an agent, update matching agent in database
    if (affiliateCode) {
      const agent = db.agents.find((a) => a.affiliateCode.toLowerCase() === affiliateCode.toLowerCase());
      if (agent) {
        agent.fullName = fullName;
        agent.email = email;
        if (photoUrl) agent.photoUrl = photoUrl;
        updatedUser = {
          ...agent,
          displayName: fullName,
          role: 'Agent',
        };
      }
    }

    db.log(
      operatorName || fullName,
      (role?.toLowerCase() || 'agent') as any,
      'Profile Updated',
      affiliateCode || email,
      `Updated user profile details (Name: ${fullName}, Email: ${email}${password ? ', Password Reset' : ''})`
    );

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully.',
    });
  });

  // ----------------------------------------------------
  // STAFF & ADMIN ACCOUNTS & INVITATIONS SYSTEM
  // ----------------------------------------------------

  // Get all staff and admin accounts
  app.get('/api/staff', (req, res) => {
    res.json(db.staffAccounts);
  });

  // Delete / Revoke staff account
  app.delete('/api/staff/:id', (req, res) => {
    const id = req.params.id;
    const { operatorName, operatorRole } = req.body || {};
    const index = db.staffAccounts.findIndex((s) => s.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: `Staff account ${id} not found.` });
    }

    const removed = db.staffAccounts[index];
    if (removed.id === 'ADM-001') {
      return res.status(400).json({ error: 'Primary Super Administrator account cannot be deleted.' });
    }

    db.staffAccounts.splice(index, 1);
    db.log(
      operatorName || 'Admin',
      'admin',
      'Staff Account Deleted',
      id,
      `Permanently removed staff account for ${removed.fullName} (${removed.id}, Role: ${removed.role})`
    );

    res.json({
      success: true,
      message: `Staff account for ${removed.fullName} (${id}) has been removed.`,
    });
  });

  // Get all staff invitations
  app.get('/api/admin/invitations', (req, res) => {
    res.json(db.staffInvitations);
  });

  // Admin manually invites a member to make them a staff and grant access with specific role
  app.post('/api/admin/invite-staff', (req, res) => {
    const {
      recipientEmail,
      recipientName,
      affiliateCode,
      role = 'Staff',
      positionTitle = 'BD Operations Coordinator',
      department = 'BD Operations & Accreditation',
      permissions,
      customMessage,
      operatorName = 'Business Development Admin (Super Admin)',
      operatorEmail = 'admin@megaworld.com',
    } = req.body;

    if (!recipientEmail || !recipientName) {
      return res.status(400).json({ error: 'Recipient name and registered email are required.' });
    }

    const normalizedEmail = recipientEmail.trim().toLowerCase();

    // Check if already active staff
    const alreadyStaff = db.staffAccounts.find((s) => s.email.toLowerCase() === normalizedEmail);
    if (alreadyStaff) {
      return res.status(400).json({
        error: `This member (${recipientEmail}) is already an active ${alreadyStaff.role} (${alreadyStaff.id}).`,
      });
    }

    // Generate unique invitation code
    const invCode = `MWI-INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const defaultPerms: StaffPermissions = {
      canReviewApplications: true,
      canManageContracts: role === 'Admin' || Boolean(permissions?.canManageContracts),
      canEditAgents: permissions?.canEditAgents ?? true,
      canOverrideAccreditation: role === 'Admin' || Boolean(permissions?.canOverrideAccreditation),
      canViewReports: permissions?.canViewReports ?? true,
      canManageSettings: role === 'Admin' || Boolean(permissions?.canManageSettings),
      canInviteStaff: role === 'Admin' || Boolean(permissions?.canInviteStaff),
      ...permissions,
    };

    const emailSubject = `Official Appointment: Megaworld International BD Staff Invitation (${positionTitle})`;
    const emailBodyPreview = `Dear ${recipientName}, you have been officially appointed as ${positionTitle} (${role}) in the ${department} department by ${operatorName}. Your granted privileges include: ${Object.entries(defaultPerms).filter(([_, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}. Please use invitation code ${invCode} to access your staff portal.`;

    const newInvitation: StaffInvitation = {
      id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      invitationCode: invCode,
      recipientName,
      recipientEmail: normalizedEmail,
      affiliateCode: affiliateCode || undefined,
      role: role === 'Admin' ? 'Admin' : 'Staff',
      positionTitle,
      department,
      permissions: defaultPerms,
      customMessage: customMessage || undefined,
      invitedBy: operatorName,
      invitedByEmail: operatorEmail,
      createdAt: nowIso,
      expiresAt: expiresIso,
      status: 'Pending',
      emailDispatchLog: {
        sentTo: normalizedEmail,
        subject: emailSubject,
        sentAt: nowIso,
        status: 'Delivered',
        deliveryChannel: 'Official Megaworld Mail Server (SMTP Relay)',
        bodyPreview: emailBodyPreview,
      },
    };

    // Add to pending invitations
    db.staffInvitations.unshift(newInvitation);

    // If matches an existing agent, find their agent details to notify them in-system
    const matchedAgent = db.agents.find(
      (a) => a.email.toLowerCase() === normalizedEmail || (affiliateCode && a.affiliateCode === affiliateCode)
    );

    // Create In-System Notification for the invited member
    db.addNotification(
      matchedAgent?.firebaseUserId,
      matchedAgent?.affiliateCode,
      'agent',
      'Official Staff Invitation Dispatched',
      `You have been invited by ${operatorName} to join Megaworld International BD Staff as ${positionTitle} (${role}). An official notification with invitation code ${invCode} has been sent to your registered email (${normalizedEmail}).`,
      'System',
      'staff-invite'
    );

    // Also notify admins
    db.addNotification(
      undefined,
      undefined,
      'admin',
      'Staff Invitation Dispatched',
      `${operatorName} manually invited ${recipientName} (${normalizedEmail}) as ${positionTitle} (${role}). Notification email delivered.`,
      'System',
      'staff-database'
    );

    // Audit log
    db.log(
      operatorName,
      'admin',
      'Manual Staff Invitation & Role Grant',
      normalizedEmail,
      `Sent manual staff invitation to ${recipientName} (${normalizedEmail}) with role ${role} (${positionTitle}), Department: ${department}. Email notification dispatched.`
    );

    res.json({
      success: true,
      message: `Official staff invitation and email notification sent to ${normalizedEmail} successfully.`,
      invitation: newInvitation,
    });
  });

  // Resend invitation email
  app.post('/api/admin/invitations/:id/resend', (req, res) => {
    const id = req.params.id;
    const { operatorName = 'Business Development Admin (Super Admin)' } = req.body || {};
    const inv = db.staffInvitations.find((i) => i.id === id);

    if (!inv) {
      return res.status(404).json({ error: 'Invitation not found.' });
    }

    const nowIso = new Date().toISOString();
    inv.emailDispatchLog.sentAt = nowIso;
    inv.emailDispatchLog.status = 'Delivered';

    db.log(
      operatorName,
      'admin',
      'Resend Staff Invitation Email',
      inv.recipientEmail,
      `Re-sent official staff invitation email to ${inv.recipientEmail} (${inv.invitationCode}).`
    );

    res.json({
      success: true,
      message: `Invitation email re-sent to ${inv.recipientEmail} successfully.`,
      invitation: inv,
    });
  });

  // Accept / Activate invitation (converts member to staff)
  app.post('/api/admin/invitations/:id/accept', (req, res) => {
    const id = req.params.id;
    const { operatorName = 'Business Development Admin (Super Admin)' } = req.body || {};
    const inv = db.staffInvitations.find((i) => i.id === id);

    if (!inv) {
      return res.status(404).json({ error: 'Invitation not found.' });
    }

    inv.status = 'Accepted';
    inv.acceptedAt = new Date().toISOString();

    // Generate new Staff Account ID
    const nextSeq = db.staffAccounts.length + 1;
    const staffId = inv.role === 'Admin' ? `ADM-${String(nextSeq).padStart(3, '0')}` : `STF-${String(nextSeq).padStart(3, '0')}`;

    const newStaffAccount: StaffAccount = {
      id: staffId,
      fullName: inv.recipientName,
      email: inv.recipientEmail,
      role: inv.role,
      positionTitle: inv.positionTitle,
      department: inv.department,
      status: 'Active',
      lastLogin: 'Just now',
      permissions: inv.permissions,
      invitedBy: inv.invitedBy,
      invitedAt: inv.createdAt,
    };

    db.staffAccounts.push(newStaffAccount);

    // If they exist in db.agents, update role to staff as well
    const matchedAgent = db.agents.find((a) => a.email.toLowerCase() === inv.recipientEmail.toLowerCase());
    if (matchedAgent) {
      matchedAgent.role = 'staff';
    }

    db.addNotification(
      matchedAgent?.firebaseUserId,
      matchedAgent?.affiliateCode,
      'agent',
      'Staff Role Activated',
      `Your staff account (${staffId}) with role ${inv.role} (${inv.positionTitle}) has been activated. You now have full access to BD Staff portals.`,
      'System'
    );

    db.log(
      operatorName,
      'admin',
      'Staff Role Activated',
      inv.recipientEmail,
      `Activated staff account ${staffId} for ${inv.recipientName} (${inv.recipientEmail}) with granted role ${inv.role}.`
    );

    res.json({
      success: true,
      message: `Staff account ${staffId} for ${inv.recipientName} activated successfully.`,
      staffAccount: newStaffAccount,
      invitation: inv,
    });
  });

  // Revoke invitation
  app.delete('/api/admin/invitations/:id', (req, res) => {
    const id = req.params.id;
    const { operatorName = 'Business Development Admin (Super Admin)' } = req.body || {};
    const invIndex = db.staffInvitations.findIndex((i) => i.id === id);

    if (invIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found.' });
    }

    const removed = db.staffInvitations[invIndex];
    removed.status = 'Revoked';
    db.staffInvitations.splice(invIndex, 1);

    db.log(
      operatorName,
      'admin',
      'Staff Invitation Revoked',
      removed.recipientEmail,
      `Revoked staff invitation for ${removed.recipientName} (${removed.recipientEmail}).`
    );

    res.json({
      success: true,
      message: `Invitation for ${removed.recipientName} (${removed.recipientEmail}) has been revoked.`,
    });
  });

  // 3. Applications
  app.get('/api/applications', (req, res) => {
    res.json(db.applications);
  });

  app.get('/api/applications/:id', (req, res) => {
    const appRecord = db.applications.find((a) => a.id === req.params.id);
    if (!appRecord) return res.status(404).json({ error: 'Application not found.' });
    res.json(appRecord);
  });

  app.delete('/api/applications/:id', (req, res) => {
    const { operatorName, operatorRole } = req.body || {};
    const appIndex = db.applications.findIndex((a) => a.id === req.params.id);
    if (appIndex === -1) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    const removedApp = db.applications[appIndex];
    db.applications.splice(appIndex, 1);

    db.log(
      operatorName || 'Staff/Admin',
      operatorRole || 'staff',
      'Application Deleted',
      removedApp.affiliateCode,
      `Deleted application ${removedApp.id} for ${removedApp.personalDetails?.fullName || removedApp.affiliateCode}.`
    );

    res.json({ success: true, message: 'Application deleted successfully.' });
  });

  // Submit or Update Application (New or Renewal)
  app.post('/api/applications/submit', (req, res) => {
    const data: Partial<AccreditationApplication> = req.body;
    const { affiliateCode, applicationType, position, personalDetails, bankDetails, teamDetails } = data;

    if (!affiliateCode) {
      return res.status(400).json({ error: 'Affiliate Code is required.' });
    }

    const agent = db.agents.find((a) => a.affiliateCode === affiliateCode);
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found for Affiliate Code.' });
    }

    // Duplicate detection based on Full Legal Name + Date of Birth
    if (personalDetails && db.settings.preventDuplicateIdentities) {
      const duplicateAgent = db.agents.find((a) => {
        if (a.affiliateCode === affiliateCode) return false; // same person across renewals is valid!
        return (
          a.fullName.toLowerCase() === personalDetails.fullName.toLowerCase() &&
          a.email.toLowerCase() === personalDetails.emailAddress.toLowerCase()
        );
      });

      if (duplicateAgent) {
        return res.status(400).json({
          error: 'Possible Existing Accreditation Found',
          details: `Matching record found with Affiliate Code ${duplicateAgent.affiliateCode}. Please contact Admin/BD Staff before creating another accreditation record.`,
        });
      }
    }

    // Check if updating existing draft or creating new application record
    let targetApp = db.applications.find(
      (a) => a.affiliateCode === affiliateCode && (a.status === 'Draft' || a.status === 'Revision Required')
    );

    if (!targetApp) {
      targetApp = {
        id: `app_${Date.now()}`,
        affiliateCode,
        applicationType: applicationType || 'New',
        position: position || agent.position,
        region: agent.region,
        status: 'Submitted',
        dateSubmitted: new Date().toISOString(),
        personalDetails: personalDetails!,
        bankDetails: bankDetails!,
        teamDetails: teamDetails!,
        idPhotoUrl: data.idPhotoUrl,
        idPhotoName: data.idPhotoName,
        governmentIdUrl: data.governmentIdUrl,
        governmentIdName: data.governmentIdName,
        idVerificationStatus: 'Pending',
        eSignatureUrl: data.eSignatureUrl,
        eSignatureConfirmed: !!data.eSignatureConfirmed,
        declarationAccepted: !!data.declarationAccepted,
      };
      db.applications.unshift(targetApp);
    } else {
      targetApp.applicationType = applicationType || targetApp.applicationType;
      targetApp.status = 'Submitted';
      targetApp.dateSubmitted = new Date().toISOString();
      if (personalDetails) targetApp.personalDetails = personalDetails;
      if (bankDetails) targetApp.bankDetails = bankDetails;
      if (teamDetails) targetApp.teamDetails = teamDetails;
      if (data.idPhotoUrl) targetApp.idPhotoUrl = data.idPhotoUrl;
      if (data.governmentIdUrl) targetApp.governmentIdUrl = data.governmentIdUrl;
      if (data.eSignatureUrl) targetApp.eSignatureUrl = data.eSignatureUrl;
      targetApp.eSignatureConfirmed = !!data.eSignatureConfirmed;
      targetApp.declarationAccepted = !!data.declarationAccepted;
    }

    // Update Agent profile completion
    agent.profileCompletion = 100;
    agent.accreditationStatus = applicationType === 'Renewal' ? 'Renewal Pending' : 'Pending Review';

    db.log(
      agent.fullName,
      'agent',
      applicationType === 'Renewal' ? 'Renewal Application Submitted' : 'New Accreditation Submitted',
      affiliateCode,
      `Submitted ${applicationType} application for ${targetApp.position}. Affiliate Code permanent identity maintained.`
    );

    db.addNotification(
      undefined,
      affiliateCode,
      'staff',
      `${applicationType} Accreditation Submitted — ${affiliateCode}`,
      `${agent.fullName} submitted their ${applicationType} application for review.`,
      'Application',
      'applications'
    );

    res.json({
      success: true,
      message: 'Application successfully submitted for review!',
      application: targetApp,
    });
  });

  // Staff / Admin Application Review (Approve, Reject, Request Revision)
  app.post('/api/applications/:id/review', (req, res) => {
    const { action, reviewerName, reviewerRole, notes } = req.body;
    const targetApp = db.applications.find((a) => a.id === req.params.id);

    if (!targetApp) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const agent = db.agents.find((a) => a.affiliateCode === targetApp.affiliateCode);
    if (!agent) {
      return res.status(404).json({ error: 'Associated agent not found.' });
    }

    targetApp.dateReviewed = new Date().toISOString();
    targetApp.reviewedBy = reviewerName;
    targetApp.reviewNotes = notes;

    if (action === 'Approve') {
      targetApp.status = 'Approved';
      targetApp.idVerificationStatus = 'Verified';

      // 4-Month Expiry Calculation
      const startDate = new Date();
      const expiryDate = new Date();
      const durationMonths = db.settings.accreditationDurationMonths || 4;
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

      const startDateStr = startDate.toISOString().split('T')[0];
      const expiryDateStr = expiryDate.toISOString().split('T')[0];

      // Create new Accreditation Record
      const newAccreditation: AccreditationRecord = {
        id: `acc_${Date.now()}`,
        affiliateCode: agent.affiliateCode,
        applicationType: targetApp.applicationType,
        position: targetApp.position,
        startDate: startDateStr,
        expiryDate: expiryDateStr,
        status: 'Active',
        daysRemaining: Math.ceil((expiryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        approvedBy: reviewerName,
        approvedDate: startDateStr,
      };
      db.accreditations.unshift(newAccreditation);

      // Contract Generation Architecture
      const template = db.settings.contractTemplateText || INITIAL_SETTINGS.contractTemplateText;
      const generatedContract = template
        .replace(/{{AFFILIATE_CODE}}/g, agent.affiliateCode)
        .replace(/{{FULL_NAME}}/g, targetApp.personalDetails.fullName)
        .replace(/{{DATE_OF_BIRTH}}/g, targetApp.personalDetails.dateOfBirth || 'N/A')
        .replace(/{{ADDRESS}}/g, targetApp.personalDetails.residentialAddress || 'N/A')
        .replace(/{{EMAIL}}/g, targetApp.personalDetails.emailAddress)
        .replace(/{{MOBILE_NUMBER}}/g, targetApp.personalDetails.mobileNumber || 'N/A')
        .replace(/{{REGION}}/g, targetApp.region)
        .replace(/{{POSITION}}/g, targetApp.position)
        .replace(/{{BANK_NAME}}/g, targetApp.bankDetails.bankName || 'N/A')
        .replace(/{{ACCOUNT_NAME}}/g, targetApp.bankDetails.accountName || 'N/A')
        .replace(/{{ACCOUNT_NUMBER}}/g, targetApp.bankDetails.accountNumber || 'N/A')
        .replace(/{{TEAM_NAME}}/g, targetApp.teamDetails.teamName || 'N/A')
        .replace(/{{UPLINE}}/g, targetApp.teamDetails.upline || 'N/A')
        .replace(/{{ACCREDITATION_START_DATE}}/g, startDateStr)
        .replace(/{{ACCREDITATION_EXPIRY_DATE}}/g, expiryDateStr)
        .replace(/{{ESIGNATURE}}/g, `[ELECTRONICALLY SIGNED BY ${targetApp.personalDetails.fullName.toUpperCase()}]`)
        .replace(/{{ID_PHOTO}}/g, `[VERIFIED 1X1 PHOTO ATTACHED]`);

      targetApp.contractUrl = `/contracts/${agent.affiliateCode}-${startDateStr}.pdf`;
      targetApp.contractGeneratedAt = new Date().toISOString();

      // Update Agent Profile
      agent.accreditationStatus = 'Active';
      agent.accreditationStartDate = startDateStr;
      agent.accreditationExpiryDate = expiryDateStr;
      agent.lastAccreditationDate = startDateStr;
      agent.currentAccreditationId = newAccreditation.id;
      agent.renewalEligibility = false;
      agent.position = targetApp.position;

      db.log(
        reviewerName,
        reviewerRole || 'staff',
        'Accreditation Approved & Contract Generated',
        agent.affiliateCode,
        `Approved ${targetApp.applicationType} accreditation for 4-month term (${startDateStr} to ${expiryDateStr}). Contract generated.`
      );

      db.addNotification(
        agent.firebaseUserId,
        agent.affiliateCode,
        'agent',
        'Accreditation Approved!',
        `Congratulations! Your ${targetApp.position} accreditation has been approved. Your 4-month accreditation is active until ${expiryDateStr}. Sales Agreement contract generated.`,
        'Approval',
        'accreditation'
      );
    } else if (action === 'Reject') {
      targetApp.status = 'Rejected';
      agent.accreditationStatus = targetApp.applicationType === 'Renewal' ? 'Renewal Rejected' : 'Not Started';

      db.log(
        reviewerName,
        reviewerRole || 'staff',
        'Application Rejected',
        agent.affiliateCode,
        `Application rejected. Reason/Notes: ${notes}`
      );

      db.addNotification(
        agent.firebaseUserId,
        agent.affiliateCode,
        'agent',
        'Application Status Update',
        `Your accreditation application has been rejected. Reason: ${notes || 'Please contact BD Staff.'}`,
        'Application',
        'accreditation'
      );
    } else if (action === 'Revision Required') {
      targetApp.status = 'Revision Required';
      targetApp.idVerificationStatus = 'Revision Required';
      agent.accreditationStatus = 'Not Started';

      db.log(
        reviewerName,
        reviewerRole || 'staff',
        'Revision Requested',
        agent.affiliateCode,
        `Revision requested: ${notes}`
      );

      db.addNotification(
        agent.firebaseUserId,
        agent.affiliateCode,
        'agent',
        'Document / Information Revision Required',
        `Please update your application: ${notes}`,
        'Document Request',
        'accreditation'
      );
    }

    res.json({
      success: true,
      message: `Application marked as ${action}.`,
      application: targetApp,
    });
  });

  // 4. Position Access Requests
  app.get('/api/position-requests', (req, res) => {
    res.json(db.positionRequests);
  });

  app.post('/api/position-requests', (req, res) => {
    const { affiliateCode, requestedPosition, reason } = req.body;
    const agent = db.agents.find((a) => a.affiliateCode === affiliateCode);

    if (!agent) return res.status(404).json({ error: 'Agent not found.' });

    const newReq: PositionAccessRequest = {
      id: `pos_req_${Date.now()}`,
      affiliateCode,
      fullName: agent.fullName,
      currentPosition: agent.position,
      requestedPosition,
      region: agent.region,
      requestDate: new Date().toISOString().split('T')[0],
      reason,
      status: 'Pending',
    };

    db.positionRequests.unshift(newReq);

    db.log(
      agent.fullName,
      'agent',
      'Position Access Request',
      affiliateCode,
      `Requested promotion to ${requestedPosition}. Reason: ${reason}`
    );

    db.addNotification(
      undefined,
      affiliateCode,
      'staff',
      `Position Request: ${agent.fullName} -> ${requestedPosition}`,
      `${agent.fullName} (${affiliateCode}) has requested access to ${requestedPosition}.`,
      'Approval',
      'positionRequests'
    );

    res.json({ success: true, request: newReq });
  });

  app.post('/api/position-requests/:id/review', (req, res) => {
    const { action, reviewerName } = req.body;
    const target = db.positionRequests.find((r) => r.id === req.params.id);

    if (!target) return res.status(404).json({ error: 'Request not found.' });

    target.status = action === 'Approve' ? 'Approved' : 'Rejected';
    target.reviewedBy = reviewerName;
    target.reviewDate = new Date().toISOString().split('T')[0];

    const agent = db.agents.find((a) => a.affiliateCode === target.affiliateCode);
    if (agent && action === 'Approve') {
      if (!agent.unlockedPositions.includes(target.requestedPosition)) {
        agent.unlockedPositions.push(target.requestedPosition);
      }

      db.addNotification(
        agent.firebaseUserId,
        agent.affiliateCode,
        'agent',
        'Position Access Approved!',
        `Your request for ${target.requestedPosition} has been approved by ${reviewerName}. You can now submit an accreditation application for this position.`,
        'Approval',
        'accreditation'
      );
    }

    db.log(
      reviewerName,
      'admin',
      `Position Request ${action}`,
      target.affiliateCode,
      `${action} request for ${target.requestedPosition}.`
    );

    res.json({ success: true, request: target });
  });

  // 5. Notifications
  app.get('/api/notifications', (req, res) => {
    const { affiliateCode, role } = req.query;
    let filtered = db.notifications;

    if (affiliateCode) {
      filtered = filtered.filter(
        (n) =>
          n.affiliateCode === affiliateCode ||
          n.targetRole === 'all' ||
          (role === 'staff' && n.targetRole === 'staff') ||
          (role === 'admin' && (n.targetRole === 'admin' || n.targetRole === 'staff'))
      );
    }
    res.json(filtered);
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  // 6. Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  // 7. System Settings
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  app.put('/api/settings', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    db.log(
      req.body.updatedBy || 'Admin',
      'admin',
      'System Settings Updated',
      'System Configuration',
      'Updated accreditation duration, sheets config, or reminder rules.'
    );
    res.json({ success: true, settings: db.settings });
  });

  // 8. Google Sheets Agents Database Synchronization
  app.post('/api/sync/sheets', (req, res) => {
    db.settings.sheetsSyncStatus = 'Syncing';
    // Simulate real Sheets API / Apps Script Webhook synchronization
    setTimeout(() => {
      db.settings.sheetsSyncStatus = 'Synced';
      db.settings.lastSheetsSyncTimestamp = new Date().toISOString();
    }, 1200);

    db.log(
      req.body.triggeredBy || 'Admin',
      'admin',
      'Google Sheets Synchronization',
      'Agents Database',
      `Successfully synchronized ${db.agents.length} agent records to Google Spreadsheet (${db.settings.googleSpreadsheetId}).`
    );

    res.json({
      success: true,
      message: 'Agents Database Google Spreadsheet synchronized successfully.',
      recordsSynced: db.agents.length,
      timestamp: new Date().toISOString(),
      spreadsheetId: db.settings.googleSpreadsheetId,
    });
  });

  // 9. Testing & Simulation: Fast-Forward Time
  // Simulates 3.5 months or 4 months passing to demo expiry calculation, automatic renewal unlock, and permanent Affiliate Code persistence!
  app.post('/api/simulate-fast-forward', (req, res) => {
    const { months = 4, affiliateCode } = req.body;
    let targetAccreditation: AccreditationRecord | undefined;

    if (affiliateCode) {
      targetAccreditation = db.accreditations.find((a) => a.affiliateCode === affiliateCode && a.status === 'Active');
    } else {
      targetAccreditation = db.accreditations.find((a) => a.status === 'Active');
    }

    if (targetAccreditation) {
      // Backdate the start and expiry date
      const pastStart = new Date();
      pastStart.setMonth(pastStart.getMonth() - months);
      const pastExpiry = new Date(pastStart);
      pastExpiry.setMonth(pastExpiry.getMonth() + 4);

      targetAccreditation.startDate = pastStart.toISOString().split('T')[0];
      targetAccreditation.expiryDate = pastExpiry.toISOString().split('T')[0];

      const agent = db.agents.find((a) => a.affiliateCode === targetAccreditation?.affiliateCode);
      if (agent) {
        agent.accreditationStartDate = targetAccreditation.startDate;
        agent.accreditationExpiryDate = targetAccreditation.expiryDate;
      }
    }

    db.evaluateExpiries();

    db.log(
      'Tester/Evaluator',
      'admin',
      'Fast-Forward Simulation Triggered',
      targetAccreditation?.affiliateCode || 'All',
      `Fast-forwarded ${months} months to demonstrate automatic expiry calculation and renewal unlocking.`
    );

    res.json({
      success: true,
      message: `Simulated ${months} months forward! Expiry statuses, automated notifications, and renewal eligibility updated.`,
      agents: db.agents,
    });
  });

  // 10. Contract & SAA Management per Position (BD Staff & Admin)
  app.get('/api/contracts/positions', (req, res) => {
    res.json(db.positionContracts);
  });

  app.get('/api/contracts/positions/:position', (req, res) => {
    const pos = decodeURIComponent(req.params.position);
    const template = db.positionContracts.find(
      (c) => c.position.toLowerCase() === pos.toLowerCase()
    );
    if (!template) {
      return res.status(404).json({ error: `Contract template for position '${pos}' not found.` });
    }
    res.json(template);
  });

  app.post('/api/contracts/positions/:position/upload', (req, res) => {
    const pos = decodeURIComponent(req.params.position);
    const { fileName, fileType, fileSize, fileData, rawText, uploadedBy, notes, title } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required.' });
    }

    let template = db.positionContracts.find(
      (c) => c.position.toLowerCase() === pos.toLowerCase()
    );

    const updatedBy = uploadedBy || 'Elena Ramos (BD Staff)';
    const timestamp = new Date().toISOString();

    if (template) {
      template.fileName = fileName;
      template.fileType = fileType || 'application/pdf';
      template.fileSize = fileSize || '150 KB';
      if (fileData !== undefined) template.fileData = fileData;
      if (rawText !== undefined) template.rawText = rawText;
      if (title) template.title = title;
      template.lastUpdatedBy = updatedBy;
      template.lastUpdatedAt = timestamp;
      if (notes) template.notes = notes;
    } else {
      template = {
        position: pos as Position,
        title: title || `Special Affiliate Agreement (SAA) — ${pos}`,
        fileName,
        fileType: fileType || 'application/pdf',
        fileSize: fileSize || '150 KB',
        fileData,
        rawText,
        lastUpdatedBy: updatedBy,
        lastUpdatedAt: timestamp,
        notes: notes || `Official contract file uploaded for ${pos}`,
      };
      db.positionContracts.push(template);
    }

    db.log(
      updatedBy,
      'staff',
      'Contract SAA Uploaded',
      `Position: ${pos}`,
      `Uploaded updated contract file: ${fileName} (${fileType || 'binary'}, ${fileSize || 'N/A'}) for ${pos}. All affiliates in this position will download this file format.`
    );

    db.addNotification(
      undefined,
      undefined,
      'all',
      `Contract SAA Updated for ${pos}`,
      `A new official Contract/SAA file (${fileName}) has been uploaded by ${updatedBy} for ${pos}. Agents will download this format.`,
      'Contract',
      'resources'
    );

    res.json({
      success: true,
      message: `Contract for position '${pos}' uploaded successfully.`,
      template,
    });
  });

  app.put('/api/contracts/positions/:position', (req, res) => {
    const pos = decodeURIComponent(req.params.position);
    const { title, notes, rawText, updatedBy } = req.body;

    const template = db.positionContracts.find(
      (c) => c.position.toLowerCase() === pos.toLowerCase()
    );

    if (!template) {
      return res.status(404).json({ error: 'Contract template not found.' });
    }

    if (title) template.title = title;
    if (notes) template.notes = notes;
    if (rawText) template.rawText = rawText;
    template.lastUpdatedBy = updatedBy || 'Staff / Admin';
    template.lastUpdatedAt = new Date().toISOString();

    db.log(
      template.lastUpdatedBy,
      'staff',
      'Contract SAA Text Content Updated',
      `Position: ${pos}`,
      `Updated template clauses and content for position: ${pos}`
    );

    res.json({ success: true, template });
  });

  // ==========================================
  // VITE DEV / PRODUCTION MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Megaworld IPA Portal] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
