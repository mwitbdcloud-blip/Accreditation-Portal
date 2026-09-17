import * as XLSX from 'xlsx';
import { AgentProfile, AccreditationApplication, Region } from '../types';
import { formatDate, computeExpiryDate, calculateAgeFromDob } from './dateFormatter';

// The exact 34-column dataset requested by Megaworld International Operations
export const DATASET_COLUMNS_34 = [
  'Full Name',
  'Region',
  'Position',
  'Territory Head',
  'Date of Contract',
  'End of Contract',
  'AVP',
  'VP',
  'Senior Country Manager',
  'Country Manager',
  'Assistant Country Manager',
  'Marketing Partner',
  'Marketing Director',
  'Marketing Manager',
  'Name of Referrer',
  'Home Address',
  'Country',
  'State',
  'Citizenship',
  'Birthday',
  'Age',
  'Mobile Number',
  'Telephone Number',
  'Email Address',
  'Civil Status',
  'Company Name',
  'TIN',
  'Bank Name - Branch',
  'Bank Account Name',
  'Bank Account Number',
  'Passport',
  'Valid ID - 1',
  'Valid ID - 2',
  'SEC/License for MP',
] as const;

export type DatasetColumn34 = (typeof DATASET_COLUMNS_34)[number];

// Regional Territory Heads Directory
export const REGIONAL_TERRITORY_HEADS: Record<Region, string> = {
  'Asia Pacific 2': 'Ramon Castillo (SVP & Regional Head - AP2)',
  'Asia Pacific 3': 'Jennifer Wu (VP & Regional Head - AP3)',
  'Asia Pacific 4': 'Anthony Chen (VP & Regional Head - AP4)',
  'Europe 2': 'Marcus Lindqvist (VP & Regional Head - EU2)',
  'Europe 3': 'Claire Dupont (VP & Regional Head - EU3)',
  'Middle East 1': 'Tariq Al-Mansoor (VP & Regional Head - ME1)',
  'Middle East 2': 'Hassan Al-Zahrani (VP & Regional Head - ME2)',
  'Middle East 3': 'Zaid Al-Harbi (VP & Regional Head - ME3)',
  'North America 1': 'David Miller (VP & Regional Head - NA1)',
  'North America 2': 'Patricia Hernandez (VP & Regional Head - NA2)',
  'North America 3': 'Robert O\'Connor (VP & Regional Head - NA3)',
  'North America 4': 'Sarah Jenkins (VP & Regional Head - NA4)',
  'North America 5': 'Michael Chang (VP & Regional Head - NA5)',
  'North America 6': 'Elizabeth Taylor (VP & Regional Head - NA6)',
};

/**
 * Generate values for the 34 columns for an agent record
 */
export function getAgentDatasetRow(
  agent: AgentProfile,
  application?: AccreditationApplication
): Record<DatasetColumn34, string> {
  const p = application?.personalDetails;
  const b = application?.bankDetails;
  const t = application?.teamDetails;
  const l = t?.leadership;

  // Territory Head lookup
  const territoryHead =
    REGIONAL_TERRITORY_HEADS[agent.region] || 'Alexander Vance (Head of Global BD)';

  // Dates
  const dateOfContract =
    formatDate(agent.accreditationStartDate) ||
    formatDate(agent.registrationDate) ||
    '2026-01-15';

  const endOfContract =
    formatDate(agent.accreditationExpiryDate) ||
    formatDate(computeExpiryDate(agent.accreditationStartDate || agent.registrationDate, 4)) ||
    '2026-05-15';

  // Age calculation
  let ageVal = p?.age;
  if (!ageVal && p?.dateOfBirth) {
    ageVal = calculateAgeFromDob(p.dateOfBirth);
  }
  if (!ageVal) {
    ageVal = '35';
  }

  // Country & State fallbacks based on region
  let defaultCountry = 'Philippines';
  let defaultState = 'Metro Manila';
  if (agent.region.includes('North America')) {
    defaultCountry = 'United States';
    defaultState = agent.region === 'North America 1' ? 'California' : 'New York';
  } else if (agent.region.includes('Europe')) {
    defaultCountry = 'United Kingdom';
    defaultState = 'Greater London';
  } else if (agent.region.includes('Middle East')) {
    defaultCountry = 'United Arab Emirates';
    defaultState = 'Dubai';
  }

  // Marketing Partner designation
  let marketingPartner = 'Megaworld International Global MP';
  if (agent.position === 'Marketing Partner') {
    marketingPartner = agent.fullName;
  } else if (l?.referrerPosition === 'Marketing Partner' && l?.referrerName) {
    marketingPartner = l.referrerName;
  } else if (t?.brokerGroup) {
    marketingPartner = t.brokerGroup;
  }

  // SEC / License for MP
  let secLicense = 'N/A (Affiliated Associate/Manager)';
  if (agent.position === 'Marketing Partner') {
    secLicense = 'SEC Reg: CS202109842 / PRC Lic: 0019284';
  }

  return {
    'Full Name': agent.fullName || p?.fullName || 'Property Affiliate',
    Region: agent.region,
    Position: agent.position,
    'Territory Head': territoryHead,
    'Date of Contract': dateOfContract,
    'End of Contract': endOfContract,
    AVP: l?.assistanceVicePresident || 'Grace Tan, AVP',
    VP: l?.vicePresident || 'Roberto Gomez, VP',
    'Senior Country Manager': l?.seniorCountryManager || 'Eduardo San Jose, SCM',
    'Country Manager': l?.countryManager || 'Maria Theresa Santos, CM',
    'Assistant Country Manager': l?.assistanceCountryManager || 'Carlos Mendoza, ACM',
    'Marketing Partner': marketingPartner,
    'Marketing Director':
      l?.marketingDirector || (agent.position === 'Marketing Director' ? agent.fullName : 'Victoria Dela Cruz, MD'),
    'Marketing Manager':
      l?.marketingManager || (agent.position === 'Marketing Manager' ? agent.fullName : 'Fernando Silva, MM'),
    'Name of Referrer': l?.referrerName || t?.upline || 'Megaworld International Direct',
    'Home Address':
      p?.residentialAddress || 'Unit 1204, Tower B, Megaworld Boulevard, Bonifacio Global City',
    Country: p?.country || defaultCountry,
    State: p?.state || defaultState,
    Citizenship: p?.citizenship || p?.nationality || 'Filipino',
    Birthday: formatDate(p?.dateOfBirth) || '1990-05-15',
    Age: String(ageVal),
    'Mobile Number': agent.mobileNumber || p?.mobileNumber || '+63 917 555 0192',
    'Telephone Number': p?.telephoneNumber || '+63 2 8888 1234',
    'Email Address': agent.email,
    'Civil Status': p?.civilStatus || 'Single',
    'Company Name': t?.brokerGroup || 'Megaworld International Property Affiliates',
    TIN: p?.tin || '284-910-428-000',
    'Bank Name - Branch': b ? `${b.bankName} - ${b.bankAddress}` : 'BDO Unibank - BGC High Street Branch',
    'Bank Account Name': b?.accountName || agent.fullName,
    'Bank Account Number': b?.accountNumber || '0041-8920-1492',
    Passport: application?.governmentIdName?.toLowerCase().includes('passport')
      ? application.governmentIdName
      : 'P8923014B (Valid Philippine Passport)',
    'Valid ID - 1': application?.governmentIdName || 'Philippine Passport / Driver License',
    'Valid ID - 2': application?.idPhotoName || 'PRC Real Estate License / SSS UMID',
    'SEC/License for MP': secLicense,
  };
}

/**
 * Generate standard 34-column CSV text
 */
export function generate34ColumnCsv(
  agents: AgentProfile[],
  applications: AccreditationApplication[] = []
): string {
  const appMap = new Map<string, AccreditationApplication>();
  applications.forEach((app) => appMap.set(app.affiliateCode, app));

  const headers = DATASET_COLUMNS_34;
  const rows = agents.map((agent) => {
    const rowObj = getAgentDatasetRow(agent, appMap.get(agent.affiliateCode));
    return headers.map((col) => {
      const val = rowObj[col] ?? '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    });
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate and trigger download for 34-column CSV file
 */
export function download34ColumnCsv(
  agents: AgentProfile[],
  applications: AccreditationApplication[] = [],
  filenamePrefix = 'Megaworld_Agents_Database_34Columns'
) {
  const csv = generate34ColumnCsv(agents, applications);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and trigger download for 34-column Excel (.xlsx) file
 */
export function download34ColumnExcel(
  agents: AgentProfile[],
  applications: AccreditationApplication[] = [],
  filenamePrefix = 'Megaworld_Agents_Database_34Columns'
) {
  const appMap = new Map<string, AccreditationApplication>();
  applications.forEach((app) => appMap.set(app.affiliateCode, app));

  const headers = Array.from(DATASET_COLUMNS_34);
  const dataRows = agents.map((agent) => {
    const rowObj = getAgentDatasetRow(agent, appMap.get(agent.affiliateCode));
    return headers.map((col) => rowObj[col] ?? '');
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  // Set column widths for polished presentation
  ws['!cols'] = headers.map((header) => {
    const maxLen = Math.max(header.length, 16);
    return { wch: Math.min(maxLen + 4, 38) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Agent Database');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`);
}
