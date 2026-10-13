/**
 * Sample Data Detection & Filtering Utilities
 * Ensures that on the published website, only uploaded files from staff/admin
 * and real registered agents reflect in the system.
 * Sample demo records are completely blocked on published deployments.
 */
import { AgentProfile, AccreditationApplication } from '../types';
import { isLiveEnvironment } from './environment';

// The 21 pre-seeded sample affiliate codes from seedData.ts
export const SAMPLE_AFFILIATE_CODES = new Set<string>([
  'IPA-AP2-000001',
  'IPA-ME1-000002',
  'IPA-NA1-000003',
  'IPA-EU2-000004',
  'IPA-AP2-000005',
  'IPA-AP2-000006',
  'IPA-AP2-000007',
  'IPA-AP2-000008',
  'IPA-AP2-000009',
  'IPA-AP2-000010',
  'IPA-AP2-000011',
  'IPA-AP2-000012',
  'IPA-AP2-000013',
  'IPA-AP2-000014',
  'IPA-AP2-000015',
  'IPA-AP2-000016',
  'IPA-AP2-000017',
  'IPA-AP2-000018',
  'IPA-AP2-000019',
  'IPA-AP2-000020',
  'IPA-AP2-000021',
]);

const SAMPLE_DEMO_EMAILS = new Set<string>([
  'maria.santos@megaworld-ipa.example',
  'carlos.tan@megaworld-ipa.example',
  'elena.reyes@megaworld-ipa.example',
  'david.lim@megaworld-ipa.example',
  'jadelacruz.global@megaworld-marketing.com',
  'bmanga.global@megaworld-marketing.com',
  'rvalenzuela.global@megaworld-marketing.com',
  'rfernandez.global@megaworld-marketing.com',
  'mcastro.global@megaworld-marketing.com',
  'jsoriano.global@megaworld-marketing.com',
  'aherrera.global@megaworld-marketing.com',
  'lguerrero.global@megaworld-marketing.com',
  'cvillanueva.global@megaworld-marketing.com',
  'pdelossantos.global@megaworld-marketing.com',
  'mmendoza.global@megaworld-marketing.com',
  'enavarro.global@megaworld-marketing.com',
  'dcorpuz.global@megaworld-marketing.com',
  'jroxas.global@megaworld-marketing.com',
  'csalazar.global@megaworld-marketing.com',
  'vdomingo.global@megaworld-marketing.com',
  'gpascual.global@megaworld-marketing.com',
]);

/**
 * Determines whether a record is a built-in mock sample agent
 * vs a real uploaded file or registered agent.
 */
export function isSampleAgent(agent: Partial<AgentProfile> | null | undefined): boolean {
  if (!agent) return false;

  // Explicitly marked real records are NEVER sample
  if (
    agent.isUploaded === true ||
    agent.isRegistered === true ||
    (agent as any).importedFromUpload === true ||
    agent.importSource === 'file_upload' ||
    agent.importSource === 'google_sheets' ||
    agent.registrationOrigin === 'self_registration'
  ) {
    return false;
  }

  // Explicit sample flag
  if (agent.isSample === true) return true;

  const email = (agent.email || '').trim().toLowerCase();
  if (email.includes('.example') || email.includes('sample@') || SAMPLE_DEMO_EMAILS.has(email)) {
    return true;
  }

  const code = (agent.affiliateCode || '').trim().toUpperCase();
  if (SAMPLE_AFFILIATE_CODES.has(code)) {
    return true;
  }

  const uid = agent.firebaseUserId || '';
  if (/^usr_agent_0(0[1-9]|1[0-9]|2[0-1])$/.test(uid)) {
    return true;
  }

  return false;
}

/**
 * Determines whether an application is a built-in mock sample application.
 */
export function isSampleApplication(app: Partial<AccreditationApplication> | null | undefined): boolean {
  if (!app) return false;
  if ((app as any).isUploaded === true || (app as any).isRegistered === true) return false;

  const code = (app.affiliateCode || '').trim().toUpperCase();
  if (SAMPLE_AFFILIATE_CODES.has(code)) return true;

  if (app.id && /^app_00[1-9]$|^app_01[0-9]$|^app_02[0-1]$/.test(app.id)) return true;

  const email = (app.personalDetails?.emailAddress || '').trim().toLowerCase();
  if (email.includes('.example') || email.includes('sample@') || SAMPLE_DEMO_EMAILS.has(email)) {
    return true;
  }

  return false;
}

/**
 * Checks if published mode is active.
 * In published mode:
 * - NO sample agents or sample applications are shown or seeded.
 * - Only records uploaded by staff/admin or registered by new agents are active.
 */
export function isPublishedMode(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production' || process.env.PUBLISH_CLEAN === 'true';
  }

  // Explicit override stored in localStorage
  const explicitClean = localStorage.getItem('mwi_published_clean_mode');
  if (explicitClean === 'true') return true;
  if (explicitClean === 'false') return false;

  // Live hosting environment (Netlify, custom domain, Vercel, Firebase, pages.dev, etc.)
  if (isLiveEnvironment()) return true;

  // Production build
  if (import.meta.env.PROD) {
    const host = window.location.hostname.toLowerCase();
    // In production build, unless explicitly in dev iframe or localhost, treat as published
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.includes('ais-dev-')) {
      return true;
    }
    // If production build is deployed anywhere, it is published
    return true;
  }

  // Default: by default we enforce clean published data mode so users never get confused by sample records
  return true;
}

export function filterNonSampleAgents(agents: AgentProfile[]): AgentProfile[] {
  if (!Array.isArray(agents)) return [];
  return agents.filter((a) => !isSampleAgent(a));
}

export function filterNonSampleApplications(apps: AccreditationApplication[]): AccreditationApplication[] {
  if (!Array.isArray(apps)) return [];
  return apps.filter((a) => !isSampleApplication(a));
}
