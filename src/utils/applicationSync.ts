import { AgentProfile, AccreditationApplication, Position } from '../types';
import { isSampleAgent } from './sampleDataFilter';

/**
 * Creates or synchronizes an AccreditationApplication from an AgentProfile.
 * Ensures that any agent existing in the Agents Database (Sheet) has an
 * official application record reflected in Applications Review.
 */
export function createApplicationFromAgent(
  agent: AgentProfile,
  existingApp?: AccreditationApplication | null
): AccreditationApplication {
  const p = agent.personalDetails || ({} as any);
  const b = agent.bankDetails || ({} as any);
  const t = agent.teamDetails || ({} as any);

  const fullName = agent.fullName || p.fullName || 'Affiliate Applicant';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = p.firstName || nameParts[0] || '';
  const lastName = p.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
  const middleName = p.middleName || '';
  const suffix = p.suffix || '';

  const email = agent.email || p.emailAddress || '';
  const mobileNumber = agent.mobileNumber || p.mobileNumber || '';
  const dateOfBirth = agent.birthday || p.dateOfBirth || '';
  const residentialAddress = agent.residentialAddress || p.residentialAddress || '';
  const tin = agent.tin || p.tin || '';

  const position = (agent.position as Position) || existingApp?.position || 'Marketing Associate';
  const region = agent.region || existingApp?.region || 'Asia Pacific 2';

  // Determine application status based on agent's status
  let status: AccreditationApplication['status'] = 'Submitted';
  const aStatus = (agent.accreditationStatus || '') as string;
  if (existingApp?.status && existingApp.status !== 'Draft') {
    status = existingApp.status;
  } else if (aStatus === 'Active' || agent.accountStatus === 'Active') {
    status = 'Approved';
  } else if (aStatus === 'Revision Required') {
    status = 'Revision Required';
  } else if (aStatus === 'Rejected') {
    status = 'Rejected';
  } else if (aStatus === 'Under Review') {
    status = 'Under Review';
  } else {
    status = 'Submitted';
  }

  const dateSubmitted =
    existingApp?.dateSubmitted ||
    agent.registrationDate ||
    agent.accreditationStartDate ||
    new Date().toISOString().split('T')[0];

  const idVerificationStatus =
    existingApp?.idVerificationStatus ||
    (agent.accreditationStatus === 'Active' ? 'Verified' : 'Pending');

  return {
    id: existingApp?.id || `app_${agent.affiliateCode || Date.now()}`,
    affiliateCode: agent.affiliateCode,
    applicationType: existingApp?.applicationType || 'New',
    position,
    region,
    status,
    dateSubmitted,
    accreditationDate: agent.accreditationStartDate || existingApp?.accreditationDate || p.accreditationDate || dateSubmitted,
    accreditationStartDate: agent.accreditationStartDate || existingApp?.accreditationStartDate || p.accreditationStartDate || dateSubmitted,
    accreditationExpiryDate: agent.accreditationExpiryDate || existingApp?.accreditationExpiryDate || p.accreditationExpiryDate,
    personalDetails: {
      ...p,
      firstName,
      middleName,
      lastName,
      suffix,
      fullName,
      dateOfBirth,
      age: p.age ?? undefined,
      sex: p.sex || undefined,
      civilStatus: p.civilStatus || 'Single',
      citizenship: p.citizenship || p.nationality || 'Filipino',
      nationality: p.nationality || 'Filipino',
      residentialAddress,
      country: p.country || 'Philippines',
      state: p.state || '',
      telephoneNumber: p.telephoneNumber || '',
      mobileNumber,
      emailAddress: email,
      tin,
      idMatchConfirmed: true,
      lastContractPeriod: p.lastContractPeriod,
      accreditationDate: agent.accreditationStartDate || existingApp?.accreditationDate || p.accreditationDate || dateSubmitted,
      accreditationStartDate: agent.accreditationStartDate || existingApp?.accreditationStartDate || p.accreditationStartDate || dateSubmitted,
      accreditationExpiryDate: agent.accreditationExpiryDate || existingApp?.accreditationExpiryDate || p.accreditationExpiryDate,
    },
    bankDetails: {
      ...b,
      bankName: b.bankName || '',
      accountName: b.accountName || fullName,
      accountNumber: b.accountNumber || '',
      bankAddress: b.bankAddress || '',
      swiftCode: b.swiftCode || '',
    },
    teamDetails: {
      ...t,
      teamName: t.teamName || 'Team Apex Horizon',
      upline: t.upline || 'Ricardo Gomez',
      teamLeader: t.teamLeader || 'Victoria Del Rosario',
      brokerGroup: t.brokerGroup || `Megaworld International ${region} Hub`,
      leadership: t.leadership || {
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
    idPhotoUrl: existingApp?.idPhotoUrl || agent.idPhotoUrl || agent.photoUrl,
    idPhotoName: existingApp?.idPhotoName || (agent.photoUrl ? 'id_photo.jpg' : undefined),
    governmentIdUrl: existingApp?.governmentIdUrl || agent.governmentIdUrl,
    governmentIdName: existingApp?.governmentIdName || (agent.governmentIdUrl ? 'government_id.pdf' : undefined),
    idVerificationStatus,
    eSignatureUrl: existingApp?.eSignatureUrl || agent.eSignatureUrl,
    eSignatureConfirmed: existingApp?.eSignatureConfirmed ?? true,
    declarationAccepted: existingApp?.declarationAccepted ?? true,
    contractUrl: existingApp?.contractUrl || (agent as any).contractUrl,
    contractGeneratedAt: existingApp?.contractGeneratedAt || (agent as any).contractGeneratedAt,
    reviewNotes: existingApp?.reviewNotes,
    reviewedBy: existingApp?.reviewedBy || agent.assignedStaff,
    isUploaded: agent.isUploaded || existingApp?.isUploaded,
    isRegistered: agent.isRegistered ?? true,
    isSample: agent.isSample ?? false,
  };
}

/**
 * Synchronizes agents from the database / sheet with accreditation applications.
 * Every valid agent in `agents` is guaranteed to have a corresponding application
 * reflected in Applications Review.
 */
export function syncAgentsAndApplications(
  agents: AgentProfile[],
  applications: AccreditationApplication[]
): AccreditationApplication[] {
  if (!Array.isArray(agents)) return Array.isArray(applications) ? applications : [];
  const safeApps = Array.isArray(applications) ? [...applications] : [];

  const appMap = new Map<string, AccreditationApplication>();
  const emailMap = new Map<string, AccreditationApplication>();

  safeApps.forEach((app) => {
    if (app.affiliateCode) {
      appMap.set(app.affiliateCode.toUpperCase(), app);
    }
    const email = app.personalDetails?.emailAddress?.toLowerCase().trim();
    if (email) {
      emailMap.set(email, app);
    }
  });

  const syncedList: AccreditationApplication[] = [...safeApps];

  agents.forEach((agent) => {
    // If agent is a sample agent and we shouldn't have samples, skip
    if (isSampleAgent(agent)) return;

    const codeKey = (agent.affiliateCode || '').toUpperCase().trim();
    const emailKey = (agent.email || '').toLowerCase().trim();

    const existingApp = (codeKey && appMap.get(codeKey)) || (emailKey && emailMap.get(emailKey));

    if (!existingApp) {
      // Create new synchronized application for this agent
      const newApp = createApplicationFromAgent(agent, null);
      syncedList.unshift(newApp);
      if (codeKey) appMap.set(codeKey, newApp);
      if (emailKey) emailMap.set(emailKey, newApp);
    } else {
      // Keep existing application's basic info synchronized with agent
      if (
        agent.fullName &&
        existingApp.personalDetails?.fullName !== agent.fullName
      ) {
        existingApp.personalDetails = {
          ...existingApp.personalDetails,
          fullName: agent.fullName,
        };
      }
      if (agent.email && existingApp.personalDetails?.emailAddress !== agent.email) {
        existingApp.personalDetails = {
          ...existingApp.personalDetails,
          emailAddress: agent.email,
        };
      }
      if (agent.position && existingApp.position !== agent.position) {
        existingApp.position = agent.position as Position;
      }
      if (agent.region && existingApp.region !== agent.region) {
        existingApp.region = agent.region;
      }
      if (agent.isRegistered) {
        (existingApp as any).isRegistered = true;
        (existingApp as any).isSample = false;
      }
      if (agent.isUploaded) {
        (existingApp as any).isUploaded = true;
        (existingApp as any).isSample = false;
      }
    }
  });

  return syncedList;
}
