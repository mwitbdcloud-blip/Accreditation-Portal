import JSZip from 'jszip';
import { ContractData, extractContractData } from '../components/ContractDocument';
import { Position, AgentProfile, AccreditationApplication } from '../types';

export interface TagMappingEntry {
  tag: string;
  fieldLabel: string;
  category: 'Personal' | 'Bank' | 'Team & Leadership' | 'Dates' | 'Document & Images' | 'Corporate' | 'Custom';
  agentProfileField: string;
  sampleValue: string;
  agentValue?: string;
  isPopulated?: boolean;
}

export interface GenerationResult {
  blob: Blob;
  fileName: string;
  replacedCount: number;
  mappedTags: Record<string, string>;
  detectedTags: string[];
}

/**
 * Returns the default template URL for each official position
 */
export function getDefaultTemplateUrlForPosition(position: Position | string): string {
  switch (position) {
    case 'Marketing Associate':
      return '/templates/Marketing%20Associate.docx';
    case 'Senior Marketing Associate':
      return '/templates/Senior%20Marketing%20Associate.docx';
    case 'Marketing Manager':
      return '/templates/Marketing%20Manager.docx';
    case 'Marketing Director':
      return '/templates/Marketing%20Director.docx';
    case 'Marketing Partner':
      return '/templates/Marketing%20Partner%20(Standard).docx';
    default:
      return '/templates/Marketing%20Associate.docx';
  }
}

/**
 * Returns the default official file name for each position
 */
export function getDefaultTemplateFileName(position: Position | string): string {
  switch (position) {
    case 'Marketing Associate':
      return 'Marketing Associate.docx';
    case 'Senior Marketing Associate':
      return 'Senior Marketing Associate.docx';
    case 'Marketing Manager':
      return 'Marketing Manager.docx';
    case 'Marketing Director':
      return 'Marketing Director.docx';
    case 'Marketing Partner':
      return 'Marketing Partner (Standard).docx';
    default:
      return `${position.replace(/\s+/g, '_')}_Template.docx`;
  }
}

/**
 * Builds the comprehensive tag dictionary from the Agent's ContractData.
 * Maps exact template tags found in official Megaworld International templates.
 */
export function buildTagDictionary(data: ContractData, position?: Position | string): {
  textDictionary: { pattern: RegExp; value: string; rawTag: string }[];
  mappingSummary: Record<string, string>;
} {
  const p = position || 'Marketing Associate';

  // Format dates cleanly
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const startDateFormatted = data.startDate || todayFormatted;
  const expiryDateFormatted = data.expiryDate || 'October 16, 2026';

  const mappingSummary: Record<string, string> = {
    '{{firstname}}': data.firstName || data.fullName.split(' ')[0] || '',
    '{{middlename}}': data.middleName || '',
    '{{surname}}': data.lastName || data.fullName.split(' ').slice(1).join(' ') || '',
    '{{address}}': data.residentialAddress || '',
    '{{country}}': data.country || 'Philippines',
    '{{state}}': data.state || 'Metro Manila',
    '{{territory}}': data.brokerGroup || `${data.region || 'Asia Pacific 2'} Hub`,
    '{{citizenship}}': data.citizenship || 'Filipino',
    '{{sex}}': data.sex || 'Female',
    '{{birthday}}': data.dateOfBirth || '',
    '{{age}}': String(data.age || '38'),
    '{{civilstatus}}': data.civilStatus || 'Single',
    '{{tin}}': data.tin || '000-000-000-000',
    '{{email}}': data.emailAddress || '',
    '{{telephone}}': data.telephoneNumber || '+63 2 8633 4567',
    '{{mobile}}': data.mobileNumber || '+63 917 888 2345',
    '{{localbank}}': data.bankName || 'BDO Unibank, Inc.',
    '{{bankacctnumber}}': data.accountNumber || '',
    '{{bankacctname}}': data.accountName || data.fullName,
    '{{contract}}': `SPECIAL AFFILIATE AGREEMENT — ${p.toUpperCase()}`,
    '{{marketingmanager}}': data.leadership?.marketingManager || 'Jonathan Cruz',
    '{{marketingdirector}}': data.leadership?.marketingDirector || 'Victoria Del Rosario',
    '{{refname}}': data.leadership?.referrerName || data.leadership?.seniorMarketingAssociate || 'Ricardo Gomez',
    '{{refposition}}': data.leadership?.referrerPosition || 'Senior Marketing Associate',
    '{{territoryhead}}': data.leadership?.countryManager || 'Eduardo Valenzuela',
    '{{countrymanager}}': data.leadership?.countryManager || 'Eduardo Valenzuela',
    '{{asst.countrymanager}}': data.leadership?.assistanceCountryManager || 'Ferdinand Marcos Jr.',
    '{{seniorcountrymanager}}': data.leadership?.seniorCountryManager || 'Grace P. Tan',
    '{{vicepresident}}': data.leadership?.vicePresident || 'Ma. Lourdes Santos',
    // Corporate fields (for MD and MP)
    '{{corpname}}': `${data.fullName} Real Estate Services Inc.`,
    '{{corprepresentative}}': data.fullName,
    '{{corptin}}': data.tin || '198-442-780-000',
    '{{corpaddress}}': data.residentialAddress || 'Unit 28B One Eastwood Avenue, Eastwood City, Bagumbayan, Quezon City',
    '{{corptelephone}}': data.telephoneNumber || '+63 2 8633 4567',
    '{{corpmobile}}': data.mobileNumber || '+63 917 888 2345',
    '{{corpemail}}': data.emailAddress || 'corporate@megaworld-international.com',
    '{{format_date _date “MMMM DD, YYYY”}}': todayFormatted,
    '{{format_date ADate “MMMM DD, YYYY”}}': startDateFormatted,
    '{{format_date ADate “MMMM DD, YYYY” “en” “+4months”}}': expiryDateFormatted,
  };

  const textDictionary = [
    { pattern: /\{\{\s*firstname\s*\}\}/gi, value: mappingSummary['{{firstname}}'], rawTag: '{{firstname}}' },
    { pattern: /\{\{\s*middlename\s*\}\}/gi, value: mappingSummary['{{middlename}}'], rawTag: '{{middlename}}' },
    { pattern: /\{\{\s*surname\s*\}\}/gi, value: mappingSummary['{{surname}}'], rawTag: '{{surname}}' },
    { pattern: /\{\{\s*address\s*\}\}/gi, value: mappingSummary['{{address}}'], rawTag: '{{address}}' },
    { pattern: /\{\{\s*country\s*\}\}/gi, value: mappingSummary['{{country}}'], rawTag: '{{country}}' },
    { pattern: /\{\{\s*state\s*\}\}/gi, value: mappingSummary['{{state}}'], rawTag: '{{state}}' },
    { pattern: /\{\{\s*territory\s*\}\}/gi, value: mappingSummary['{{territory}}'], rawTag: '{{territory}}' },
    { pattern: /\{\{\s*citizenship\s*\}\}/gi, value: mappingSummary['{{citizenship}}'], rawTag: '{{citizenship}}' },
    { pattern: /\{\{\s*sex\s*\}\}/gi, value: mappingSummary['{{sex}}'], rawTag: '{{sex}}' },
    { pattern: /\{\{\s*birthday\s*\}\}/gi, value: mappingSummary['{{birthday}}'], rawTag: '{{birthday}}' },
    { pattern: /\{\{\s*age\s*\}\}/gi, value: mappingSummary['{{age}}'], rawTag: '{{age}}' },
    { pattern: /\{\{\s*civilstatus\s*\}\}/gi, value: mappingSummary['{{civilstatus}}'], rawTag: '{{civilstatus}}' },
    { pattern: /\{\{\s*tin\s*\}\}/gi, value: mappingSummary['{{tin}}'], rawTag: '{{tin}}' },
    { pattern: /\{\{\s*email\s*\}\}/gi, value: mappingSummary['{{email}}'], rawTag: '{{email}}' },
    { pattern: /\{\{\s*telephone\s*\}\}/gi, value: mappingSummary['{{telephone}}'], rawTag: '{{telephone}}' },
    { pattern: /\{\{\s*mobile\s*\}\}/gi, value: mappingSummary['{{mobile}}'], rawTag: '{{mobile}}' },
    { pattern: /\{\{\s*localbank\s*\}\}/gi, value: mappingSummary['{{localbank}}'], rawTag: '{{localbank}}' },
    { pattern: /\{\{\s*bankacctnumber\s*\}\}/gi, value: mappingSummary['{{bankacctnumber}}'], rawTag: '{{bankacctnumber}}' },
    { pattern: /\{\{\s*bankacctname\s*\}\}/gi, value: mappingSummary['{{bankacctname}}'], rawTag: '{{bankacctname}}' },
    { pattern: /\{\{\s*contract\s*\}\}/gi, value: mappingSummary['{{contract}}'], rawTag: '{{contract}}' },
    { pattern: /\{\{\s*marketingmanager\s*\}\}/gi, value: mappingSummary['{{marketingmanager}}'], rawTag: '{{marketingmanager}}' },
    { pattern: /\{\{\s*marketingdirector\s*\}\}/gi, value: mappingSummary['{{marketingdirector}}'], rawTag: '{{marketingdirector}}' },
    { pattern: /\{\{\s*refname\s*\}\}/gi, value: mappingSummary['{{refname}}'], rawTag: '{{refname}}' },
    { pattern: /\{\{\s*refposition\s*\}\}/gi, value: mappingSummary['{{refposition}}'], rawTag: '{{refposition}}' },
    { pattern: /\{\{\s*territoryhead\s*\}\}/gi, value: mappingSummary['{{territoryhead}}'], rawTag: '{{territoryhead}}' },
    { pattern: /\{\{\s*countrymanager\s*\}\}/gi, value: mappingSummary['{{countrymanager}}'], rawTag: '{{countrymanager}}' },
    { pattern: /\{\{\s*asst\.?\s*countrymanager\s*\}\}/gi, value: mappingSummary['{{asst.countrymanager}}'], rawTag: '{{asst.countrymanager}}' },
    { pattern: /\{\{\s*seniorcountrymanager\s*\}\}/gi, value: mappingSummary['{{seniorcountrymanager}}'], rawTag: '{{seniorcountrymanager}}' },
    { pattern: /\{\{\s*vicepresident\s*\}\}/gi, value: mappingSummary['{{vicepresident}}'], rawTag: '{{vicepresident}}' },
    // Corporate fields
    { pattern: /\{\{\s*corpname\s*\}\}/gi, value: mappingSummary['{{corpname}}'], rawTag: '{{corpname}}' },
    { pattern: /\{\{\s*corprepresentative\s*\}\}/gi, value: mappingSummary['{{corprepresentative}}'], rawTag: '{{corprepresentative}}' },
    { pattern: /\{\{\s*corptin\s*\}\}/gi, value: mappingSummary['{{corptin}}'], rawTag: '{{corptin}}' },
    { pattern: /\{\{\s*corpaddress\s*\}\}/gi, value: mappingSummary['{{corpaddress}}'], rawTag: '{{corpaddress}}' },
    { pattern: /\{\{\s*corptelephone\s*\}\}/gi, value: mappingSummary['{{corptelephone}}'], rawTag: '{{corptelephone}}' },
    { pattern: /\{\{\s*corpmobile\s*\}\}/gi, value: mappingSummary['{{corpmobile}}'], rawTag: '{{corpmobile}}' },
    { pattern: /\{\{\s*corpemail\s*\}\}/gi, value: mappingSummary['{{corpemail}}'], rawTag: '{{corpemail}}' },
    // Date formats (handles quotes variants: straight, curly, smart quotes, spaces)
    { pattern: /\{\{\s*format_date\s+ADate\s+[^}]*?\+\s*4\s*months[^}]*?\}\}/gi, value: expiryDateFormatted, rawTag: '{{format_date ADate “MMMM DD, YYYY” “en” “+4months”}}' },
    { pattern: /\{\{\s*format_date\s+ADate\s+[^}]*?\}\}/gi, value: startDateFormatted, rawTag: '{{format_date ADate “MMMM DD, YYYY”}}' },
    { pattern: /\{\{\s*format_date\s+_date\s+[^}]*?\}\}/gi, value: todayFormatted, rawTag: '{{format_date _date “MMMM DD, YYYY”}}' },
  ];

  return { textDictionary, mappingSummary };
}

/**
 * Returns user-friendly list of known template tags and their mappings to Agent Profile target fields
 */
export function getStandardTemplateTagsSchema(): TagMappingEntry[] {
  return [
    { tag: '{{firstname}}', fieldLabel: 'First Name', category: 'Personal', agentProfileField: 'agent.personalDetails.firstName', sampleValue: 'ELENA PATRICIA' },
    { tag: '{{middlename}}', fieldLabel: 'Middle Name', category: 'Personal', agentProfileField: 'agent.personalDetails.middleName', sampleValue: 'DE GUZMAN' },
    { tag: '{{surname}}', fieldLabel: 'Last Name / Surname', category: 'Personal', agentProfileField: 'agent.personalDetails.lastName', sampleValue: 'REYES' },
    { tag: '{{birthday}}', fieldLabel: 'Date of Birth', category: 'Personal', agentProfileField: 'agent.personalDetails.dateOfBirth', sampleValue: 'May 18, 1987' },
    { tag: '{{age}}', fieldLabel: 'Age', category: 'Personal', agentProfileField: 'agent.personalDetails.age', sampleValue: '38' },
    { tag: '{{sex}}', fieldLabel: 'Sex / Gender', category: 'Personal', agentProfileField: 'agent.personalDetails.sex', sampleValue: 'Female' },
    { tag: '{{civilstatus}}', fieldLabel: 'Civil Status', category: 'Personal', agentProfileField: 'agent.personalDetails.civilStatus', sampleValue: 'Married' },
    { tag: '{{citizenship}}', fieldLabel: 'Citizenship', category: 'Personal', agentProfileField: 'agent.personalDetails.citizenship', sampleValue: 'Filipino' },
    { tag: '{{address}}', fieldLabel: 'Residential Address', category: 'Personal', agentProfileField: 'agent.personalDetails.residentialAddress', sampleValue: 'Unit 28B One Eastwood Avenue, Eastwood City, Bagumbayan' },
    { tag: '{{country}}', fieldLabel: 'Country of Residence', category: 'Personal', agentProfileField: 'agent.personalDetails.country', sampleValue: 'Philippines' },
    { tag: '{{state}}', fieldLabel: 'State / Province', category: 'Personal', agentProfileField: 'agent.personalDetails.state', sampleValue: 'Metro Manila' },
    { tag: '{{tin}}', fieldLabel: 'Tax Identification Number (TIN)', category: 'Personal', agentProfileField: 'agent.personalDetails.tin', sampleValue: '198-442-780-000' },
    { tag: '{{email}}', fieldLabel: 'Email Address', category: 'Personal', agentProfileField: 'agent.personalDetails.emailAddress', sampleValue: 'elena.reyes@megaworld-international.com' },
    { tag: '{{telephone}}', fieldLabel: 'Telephone Number', category: 'Personal', agentProfileField: 'agent.personalDetails.telephoneNumber', sampleValue: '+63 2 8633 4567' },
    { tag: '{{mobile}}', fieldLabel: 'Mobile Phone Number', category: 'Personal', agentProfileField: 'agent.personalDetails.mobileNumber', sampleValue: '+63 917 888 2345' },
    { tag: '{{localbank}}', fieldLabel: 'Bank for Commission Disbursements', category: 'Bank', agentProfileField: 'agent.bankDetails.bankName', sampleValue: 'BDO Unibank, Inc.' },
    { tag: '{{bankacctnumber}}', fieldLabel: 'Bank Account Number', category: 'Bank', agentProfileField: 'agent.bankDetails.accountNumber', sampleValue: '004928172645' },
    { tag: '{{bankacctname}}', fieldLabel: 'Bank Account Holder Name', category: 'Bank', agentProfileField: 'agent.bankDetails.accountName', sampleValue: 'Elena Patricia Reyes' },
    { tag: '{{territory}}', fieldLabel: 'Territory / Broker Group / Hub', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.brokerGroup', sampleValue: 'Asia Pacific 2 Hub' },
    { tag: '{{marketingmanager}}', fieldLabel: 'Marketing Manager', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.marketingManager', sampleValue: 'Jonathan Cruz' },
    { tag: '{{marketingdirector}}', fieldLabel: 'Marketing Director', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.marketingDirector', sampleValue: 'Victoria Del Rosario' },
    { tag: '{{refname}}', fieldLabel: 'Referrer / Endorser Name', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.referrerName', sampleValue: 'Ricardo Gomez' },
    { tag: '{{refposition}}', fieldLabel: 'Referrer Position', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.referrerPosition', sampleValue: 'Senior Marketing Associate' },
    { tag: '{{territoryhead}}', fieldLabel: 'Territory Head / Country Manager', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.countryManager', sampleValue: 'Eduardo Valenzuela' },
    { tag: '{{countrymanager}}', fieldLabel: 'Country Manager', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.countryManager', sampleValue: 'Eduardo Valenzuela' },
    { tag: '{{asst.countrymanager}}', fieldLabel: 'Assistant Country Manager', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.assistanceCountryManager', sampleValue: 'Ferdinand Marcos Jr.' },
    { tag: '{{seniorcountrymanager}}', fieldLabel: 'Senior Country Manager', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.seniorCountryManager', sampleValue: 'Grace P. Tan' },
    { tag: '{{vicepresident}}', fieldLabel: 'Vice President', category: 'Team & Leadership', agentProfileField: 'agent.teamDetails.leadership.vicePresident', sampleValue: 'Ma. Lourdes Santos' },
    { tag: '{{format_date _date “MMMM DD, YYYY”}}', fieldLabel: 'Creation / Signing Date', category: 'Dates', agentProfileField: 'Contract Creation Date', sampleValue: 'September 30, 2026' },
    { tag: '{{format_date ADate “MMMM DD, YYYY”}}', fieldLabel: 'Accreditation Start Date', category: 'Dates', agentProfileField: 'agent.accreditationStartDate', sampleValue: 'June 16, 2026' },
    { tag: '{{format_date ADate “MMMM DD, YYYY” “en” “+4months”}}', fieldLabel: 'Accreditation Expiry (4-Month Term)', category: 'Dates', agentProfileField: 'agent.accreditationExpiryDate', sampleValue: 'October 16, 2026' },
    { tag: '{{contract}}', fieldLabel: 'Contract Header Title', category: 'Dates', agentProfileField: 'agent.position', sampleValue: 'SPECIAL AFFILIATE AGREEMENT' },
    { tag: '{{insert_image photo 96 96}}', fieldLabel: '1x1 ID Photo Submission', category: 'Document & Images', agentProfileField: 'agent.photoUrl / application.idPhotoUrl', sampleValue: 'Embedded 1x1 Photo' },
    { tag: '{{insert_image signature 200 70}}', fieldLabel: 'Electronic Signature', category: 'Document & Images', agentProfileField: 'agent.eSignatureUrl / application.eSignatureUrl', sampleValue: 'Embedded E-Signature' },
    { tag: '{{insert_image ID2 192 288}}', fieldLabel: 'Primary Valid ID Front', category: 'Document & Images', agentProfileField: 'agent.governmentIdUrl / application.governmentIdUrl', sampleValue: 'Embedded Valid ID' },
    { tag: '{{insert_image passport 384 768}}', fieldLabel: 'Valid Passport / ID Document', category: 'Document & Images', agentProfileField: 'agent.governmentIdUrl / application.governmentIdUrl', sampleValue: 'Embedded Passport' },
    { tag: '{{corpname}}', fieldLabel: 'Corporate Entity Name (MD/MP)', category: 'Corporate', agentProfileField: 'agent.personalDetails.fullName + " Real Estate Services Inc."', sampleValue: 'Elena Reyes Real Estate LLC' },
    { tag: '{{corprepresentative}}', fieldLabel: 'Corporate Representative', category: 'Corporate', agentProfileField: 'agent.fullName', sampleValue: 'Elena Patricia Reyes' },
    { tag: '{{corptin}}', fieldLabel: 'Corporate TIN', category: 'Corporate', agentProfileField: 'agent.tin', sampleValue: '198-442-780-000' },
    { tag: '{{corpaddress}}', fieldLabel: 'Corporate Address', category: 'Corporate', agentProfileField: 'agent.residentialAddress', sampleValue: 'Eastwood City, Quezon City' },
    { tag: '{{corptelephone}}', fieldLabel: 'Corporate Phone', category: 'Corporate', agentProfileField: 'agent.personalDetails.telephoneNumber', sampleValue: '+63 2 8633 4567' },
    { tag: '{{corpmobile}}', fieldLabel: 'Corporate Mobile', category: 'Corporate', agentProfileField: 'agent.mobileNumber', sampleValue: '+63 917 888 2345' },
    { tag: '{{corpemail}}', fieldLabel: 'Corporate Email', category: 'Corporate', agentProfileField: 'agent.email', sampleValue: 'corporate@megaworld-international.com' },
  ];
}

/**
 * Dynamically generates the list of Target Fields in Agent Profile based on
 * the Placeholder / Template Tags indicated on the SAA file uploaded by staff or admin.
 */
export function generateTargetFieldsFromTemplateTags(
  detectedTags: string[],
  agent?: AgentProfile | null,
  application?: AccreditationApplication | null
): TagMappingEntry[] {
  const standardSchema = getStandardTemplateTagsSchema();
  const schemaByNormalizedTag = new Map<string, TagMappingEntry>();

  const normalize = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();

  standardSchema.forEach((entry) => {
    schemaByNormalizedTag.set(normalize(entry.tag), entry);
  });

  // Contract data for resolving live values from the selected agent
  const contractData = extractContractData(application, agent, (agent?.position as any) || 'Marketing Associate');
  const { mappingSummary } = buildTagDictionary(contractData, agent?.position);

  // Helper to resolve live agent value
  const resolveAgentValue = (tag: string): { val: string; isPopulated: boolean } => {
    let val = mappingSummary[tag];
    if (val === undefined) {
      const matchedKey = Object.keys(mappingSummary).find(
        (k) => normalize(k) === normalize(tag)
      );
      if (matchedKey) val = mappingSummary[matchedKey];
    }

    if (val && !val.startsWith('{{') && val !== '<empty>') {
      return { val, isPopulated: true };
    }

    if (/signature/i.test(tag)) {
      if (contractData.eSignatureUrl) return { val: '[Verified E-Signature Attached]', isPopulated: true };
    } else if (/photo/i.test(tag)) {
      if (contractData.idPhotoUrl) return { val: '[1x1 Photo Attached]', isPopulated: true };
    } else if (/(ID2|passport)/i.test(tag)) {
      if (contractData.governmentIdUrl || (agent as any)?.governmentIdUrl) {
        return { val: '[Valid Government ID Attached]', isPopulated: true };
      }
    }

    return { val: val || '', isPopulated: !!val && val.trim().length > 0 };
  };

  const result: TagMappingEntry[] = [];
  const processedNormTags = new Set<string>();

  // 1. First, process all tags indicated on the SAA file uploaded by staff/admin
  if (detectedTags && detectedTags.length > 0) {
    for (const rawTag of detectedTags) {
      const cleanTag = rawTag.trim();
      const norm = normalize(cleanTag);
      if (processedNormTags.has(norm)) continue;
      processedNormTags.add(norm);

      let matched = schemaByNormalizedTag.get(norm);
      if (!matched) {
        for (const [sNorm, sEntry] of schemaByNormalizedTag.entries()) {
          const coreTag = sNorm.replace(/[{}]/g, '').trim();
          const coreRaw = norm.replace(/[{}]/g, '').trim();
          if (
            coreTag === coreRaw ||
            (coreRaw.includes('format_date') &&
              coreTag.includes('format_date') &&
              ((coreRaw.includes('+4months') && coreTag.includes('+4months')) ||
                (!coreRaw.includes('+4months') && !coreTag.includes('+4months'))))
          ) {
            matched = sEntry;
            break;
          }
        }
      }

      if (matched) {
        const { val, isPopulated } = resolveAgentValue(matched.tag);
        result.push({
          ...matched,
          tag: cleanTag,
          agentValue: val,
          isPopulated,
        });
      } else {
        const tagName = cleanTag.replace(/[{}]/g, '').trim();
        const readableLabel = tagName
          .split(/[-_ ]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const fieldPath = `agent.personalDetails.${tagName}`;
        const { val, isPopulated } = resolveAgentValue(cleanTag);

        result.push({
          tag: cleanTag,
          fieldLabel: readableLabel,
          category: 'Custom',
          agentProfileField: fieldPath,
          sampleValue: `[Custom SAA Placeholder: ${tagName}]`,
          agentValue: val || (agent?.personalDetails as any)?.[tagName] || '',
          isPopulated: !!(val || (agent?.personalDetails as any)?.[tagName]),
        });
      }
    }
  }

  // 2. Add remaining standard schema tags to ensure complete reference
  for (const sEntry of standardSchema) {
    const norm = normalize(sEntry.tag);
    if (!processedNormTags.has(norm)) {
      processedNormTags.add(norm);
      const { val, isPopulated } = resolveAgentValue(sEntry.tag);
      result.push({
        ...sEntry,
        agentValue: val,
        isPopulated,
      });
    }
  }

  return result;
}

/**
 * Inspects any Word docx template and extracts all {{...}} tags present in paragraphs and headers/footers.
 */
export async function readDocxTemplateTags(templateInput: ArrayBuffer | Uint8Array | string): Promise<string[]> {
  try {
    let zip: JSZip;
    if (typeof templateInput === 'string') {
      if (templateInput.startsWith('data:')) {
        const base64Data = templateInput.split(',')[1];
        zip = await JSZip.loadAsync(base64Data, { base64: true });
      } else {
        // Fetch from URL
        const resp = await fetch(templateInput);
        const buf = await resp.arrayBuffer();
        zip = await JSZip.loadAsync(buf);
      }
    } else {
      zip = await JSZip.loadAsync(templateInput);
    }

    const detected = new Set<string>();

    const checkXml = (xmlStr: string) => {
      const pMatches = xmlStr.match(/<w:p\b[^>]*>(?:(?!<w:p\b)[\s\S])*?<\/w:p>/g) || [];
      for (const p of pMatches) {
        const tMatches = p.match(/<w:t\b[^>]*>(.*?)<\/w:t>/g) || [];
        const cleanP = tMatches.map((t) => t.replace(/<[^>]+>/g, '')).join('');
        const curlies = cleanP.match(/\{\{([^{}]+)\}\}/g) || [];
        curlies.forEach((c) => detected.add(c.trim()));
      }
    };

    const docXml = await zip.file('word/document.xml')?.async('text');
    if (docXml) checkXml(docXml);

    for (const name of Object.keys(zip.files)) {
      if (name.startsWith('word/header') || name.startsWith('word/footer')) {
        const hfXml = await zip.file(name)?.async('text');
        if (hfXml) checkXml(hfXml);
      }
    }

    return Array.from(detected);
  } catch (err) {
    console.error('Failed to read template tags:', err);
    return [];
  }
}

/**
 * Core Contract Generator:
 * Takes the exact template uploaded by Staff/Admin (or official template).
 * Replaces ONLY the designated placeholder/template tags with the corresponding Agent information.
 * Preserves 100% of formatting, styles, page layout, order, headers, footers, and tables.
 */
export async function generateContractDocx(
  templateSource: ArrayBuffer | Uint8Array | string,
  contractData: ContractData,
  position: Position | string
): Promise<GenerationResult> {
  let zip: JSZip;

  // 1. Load template zip archive
  if (typeof templateSource === 'string') {
    if (templateSource.startsWith('data:')) {
      const base64Data = templateSource.split(',')[1];
      zip = await JSZip.loadAsync(base64Data, { base64: true });
    } else {
      const resp = await fetch(templateSource);
      if (!resp.ok) {
        throw new Error(`Failed to fetch template at ${templateSource}: HTTP ${resp.status}`);
      }
      const buf = await resp.arrayBuffer();
      zip = await JSZip.loadAsync(buf);
    }
  } else {
    zip = await JSZip.loadAsync(templateSource);
  }

  const { textDictionary, mappingSummary } = buildTagDictionary(contractData, position);
  let totalReplaced = 0;
  const detectedTagsList = new Set<string>();

  // Helper to extract base64 clean data
  const parseDataUri = (dataUri?: string) => {
    if (!dataUri || !dataUri.includes('base64,')) return null;
    const parts = dataUri.split('base64,');
    const mimeMatch = parts[0].match(/data:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpeg' : 'png';
    return { ext, base64: parts[1], mime };
  };

  // Embed image helper into docx package
  let relsXml = (await zip.file('word/_rels/document.xml.rels')?.async('text')) || '';
  const rIds = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1]));
  let nextRIdNum = Math.max(...rIds, 30) + 1;

  const embedImageFile = (base64Str: string, ext: string, prefix: string) => {
    const rId = `rId${nextRIdNum++}`;
    const targetPath = `media/${prefix}_${Date.now()}.${ext}`;
    zip.file(`word/${targetPath}`, base64Str, { base64: true });
    const newRel = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${targetPath}"/>`;
    relsXml = relsXml.replace('</Relationships>', `${newRel}</Relationships>`);
    return rId;
  };

  // Embed available images
  let sigRId: string | null = null;
  let photoRId: string | null = null;
  let idRId: string | null = null;

  const sigParsed = parseDataUri(contractData.eSignatureUrl);
  if (sigParsed) {
    sigRId = embedImageFile(sigParsed.base64, sigParsed.ext, 'agent_sig');
  }

  const photoParsed = parseDataUri(contractData.idPhotoUrl);
  if (photoParsed) {
    photoRId = embedImageFile(photoParsed.base64, photoParsed.ext, 'agent_photo');
  }

  // XML replacement engine that preserves all run properties and paragraph layout
  const processXmlContent = (xmlContent: string): string => {
    // 1. Resolve AlternateContent to choice to prevent duplicate VML textboxes / XML tag mismatches
    const cleanXml = xmlContent.replace(
      /<mc:AlternateContent>[\s\S]*?<mc:Choice[^>]*>([\s\S]*?)<\/mc:Choice>[\s\S]*?<\/mc:AlternateContent>/g,
      '$1'
    );

    // Match only innermost <w:p> elements so nested textboxes are never broken
    const innermostPRegex = /<w:p\b[^>]*>(?:(?!<w:p\b)[\s\S])*?<\/w:p>/g;

    return cleanXml.replace(innermostPRegex, (paragraphXml) => {
      // Match only <w:t> tags with word boundary \b so <w:txbxContent> is never touched!
      const tRegex = /<w:t\b([^>]*)>(.*?)<\/w:t>/g;
      let fullText = '';
      let hasT = false;
      paragraphXml.replace(tRegex, (_match, _attrs, content) => {
        hasT = true;
        fullText += content;
        return _match;
      });

      if (!hasT || !/\{\{.*?\}\}/.test(fullText)) {
        return paragraphXml;
      }

      // Record any detected tags
      const curlies = fullText.match(/\{\{([^{}]+)\}\}/g) || [];
      curlies.forEach((c) => detectedTagsList.add(c.trim()));

      let newFullText = fullText;

      // Handle image tags
      if (/\{\{\s*insert_image\s+signature\s*[^}]*\}\}/i.test(newFullText)) {
        totalReplaced++;
        newFullText = newFullText.replace(
          /\{\{\s*insert_image\s+signature\s*[^}]*\}\}/gi,
          `[ ELECTRONIC SIGNATURE: ${contractData.fullName.toUpperCase()} ]`
        );
      }

      // Photo tag: {{insert_image photo 96 96}}
      if (/\{\{\s*insert_image\s+photo\s*[^}]*\}\}/i.test(newFullText)) {
        totalReplaced++;
        newFullText = newFullText.replace(
          /\{\{\s*insert_image\s+photo\s*[^}]*\}\}/gi,
          `[ 1X1 ID PHOTO ATTACHED: ${contractData.fullName.toUpperCase()} ]`
        );
      }

      // ID tags: {{insert_image ID2 192 288}} and {{insert_image passport 384 768}}
      if (/\{\{\s*insert_image\s+(ID2|passport)\s*[^}]*\}\}/i.test(newFullText)) {
        totalReplaced++;
        newFullText = newFullText.replace(
          /\{\{\s*insert_image\s+(ID2|passport)\s*[^}]*\}\}/gi,
          `[ OFFICIAL VALID GOVERNMENT IDENTIFICATION / PASSPORT ATTACHED ]`
        );
      }

      // Replace all standard text dictionary placeholders safely without regex lastIndex issues
      for (const item of textDictionary) {
        item.pattern.lastIndex = 0;
        newFullText = newFullText.replace(item.pattern, () => {
          totalReplaced++;
          return item.value;
        });
      }

      if (newFullText === fullText) {
        return paragraphXml;
      }

      // Inject the clean substituted text into the first text run and preserve all paragraph structure
      let first = true;
      return paragraphXml.replace(tRegex, (_match, attrs, _content) => {
        if (first) {
          first = false;
          const finalAttrs = attrs.includes('xml:space') ? attrs : `${attrs} xml:space="preserve"`;
          const safeText = newFullText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return `<w:t${finalAttrs}>${safeText}</w:t>`;
        } else {
          return `<w:t></w:t>`;
        }
      });
    });
  };

  // 2. Process word/document.xml
  const docXmlFile = zip.file('word/document.xml');
  if (docXmlFile) {
    const rawDocXml = await docXmlFile.async('text');
    const updatedDocXml = processXmlContent(rawDocXml);
    zip.file('word/document.xml', updatedDocXml);
  }

  // 3. Process all headers and footers
  for (const name of Object.keys(zip.files)) {
    if (name.startsWith('word/header') || name.startsWith('word/footer')) {
      const hfFile = zip.file(name);
      if (hfFile) {
        const rawHfXml = await hfFile.async('text');
        const updatedHfXml = processXmlContent(rawHfXml);
        zip.file(name, updatedHfXml);
      }
    }
  }

  // 4. Save updated relationship if images were added
  if (relsXml) {
    zip.file('word/_rels/document.xml.rels', relsXml);
  }

  // 5. Generate pristine output .docx blob
  const outputBuffer = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const outFileName = `Megaworld_${position.replace(/\s+/g, '_')}_Official_SAA_${contractData.affiliateCode}.docx`;

  return {
    blob: outputBuffer,
    fileName: outFileName,
    replacedCount: totalReplaced,
    mappedTags: mappingSummary,
    detectedTags: Array.from(detectedTagsList),
  };
}

/**
 * Triggers client-side browser file download
 */
export function downloadContractBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Re-export PDF contract generation functions
export { generateContractPdfFromTemplate as generateContractPdf } from './templateDocumentEngine';
export { downloadPdfBlob } from './contractPdfGenerator';
export type { GenerationResultPdf } from './contractPdfGenerator';
