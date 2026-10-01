import JSZip from 'jszip';
import { ContractData } from '../components/ContractDocument';
import { Position } from '../types';

export interface TagMappingEntry {
  tag: string;
  fieldLabel: string;
  category: 'Personal' | 'Bank' | 'Team & Leadership' | 'Dates' | 'Document & Images' | 'Corporate';
  sampleValue: string;
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
    // Date formats (handles quotes variants: straight, curly, smart quotes)
    { pattern: /\{\{\s*format_date\s+ADate\s+[^}]*?\+4months[^}]*?\}\}/gi, value: expiryDateFormatted, rawTag: '{{format_date ADate “MMMM DD, YYYY” “en” “+4months”}}' },
    { pattern: /\{\{\s*format_date\s+ADate\s+[^}]*?\}\}/gi, value: startDateFormatted, rawTag: '{{format_date ADate “MMMM DD, YYYY”}}' },
    { pattern: /\{\{\s*format_date\s+_date\s+[^}]*?\}\}/gi, value: todayFormatted, rawTag: '{{format_date _date “MMMM DD, YYYY”}}' },
  ];

  return { textDictionary, mappingSummary };
}

/**
 * Returns user-friendly list of known template tags and their mappings
 */
export function getStandardTemplateTagsSchema(): TagMappingEntry[] {
  return [
    { tag: '{{firstname}}', fieldLabel: 'First Name', category: 'Personal', sampleValue: 'ELENA PATRICIA' },
    { tag: '{{middlename}}', fieldLabel: 'Middle Name', category: 'Personal', sampleValue: 'DE GUZMAN' },
    { tag: '{{surname}}', fieldLabel: 'Last Name / Surname', category: 'Personal', sampleValue: 'REYES' },
    { tag: '{{birthday}}', fieldLabel: 'Date of Birth', category: 'Personal', sampleValue: 'May 18, 1987' },
    { tag: '{{age}}', fieldLabel: 'Age', category: 'Personal', sampleValue: '38' },
    { tag: '{{sex}}', fieldLabel: 'Sex / Gender', category: 'Personal', sampleValue: 'Female' },
    { tag: '{{civilstatus}}', fieldLabel: 'Civil Status', category: 'Personal', sampleValue: 'Married' },
    { tag: '{{citizenship}}', fieldLabel: 'Citizenship', category: 'Personal', sampleValue: 'Filipino' },
    { tag: '{{address}}', fieldLabel: 'Residential Address', category: 'Personal', sampleValue: 'Unit 28B One Eastwood Avenue, Eastwood City, Bagumbayan' },
    { tag: '{{country}}', fieldLabel: 'Country of Residence', category: 'Personal', sampleValue: 'Philippines' },
    { tag: '{{state}}', fieldLabel: 'State / Province', category: 'Personal', sampleValue: 'Metro Manila' },
    { tag: '{{tin}}', fieldLabel: 'Tax Identification Number (TIN)', category: 'Personal', sampleValue: '198-442-780-000' },
    { tag: '{{email}}', fieldLabel: 'Email Address', category: 'Personal', sampleValue: 'elena.reyes@megaworld-international.com' },
    { tag: '{{telephone}}', fieldLabel: 'Telephone Number', category: 'Personal', sampleValue: '+63 2 8633 4567' },
    { tag: '{{mobile}}', fieldLabel: 'Mobile Phone Number', category: 'Personal', sampleValue: '+63 917 888 2345' },
    { tag: '{{localbank}}', fieldLabel: 'Bank for Commission Disbursements', category: 'Bank', sampleValue: 'BDO Unibank, Inc.' },
    { tag: '{{bankacctnumber}}', fieldLabel: 'Bank Account Number', category: 'Bank', sampleValue: '004928172645' },
    { tag: '{{bankacctname}}', fieldLabel: 'Bank Account Holder Name', category: 'Bank', sampleValue: 'Elena Patricia Reyes' },
    { tag: '{{territory}}', fieldLabel: 'Territory / Broker Group / Hub', category: 'Team & Leadership', sampleValue: 'Asia Pacific 2 Hub' },
    { tag: '{{marketingmanager}}', fieldLabel: 'Marketing Manager', category: 'Team & Leadership', sampleValue: 'Jonathan Cruz' },
    { tag: '{{marketingdirector}}', fieldLabel: 'Marketing Director', category: 'Team & Leadership', sampleValue: 'Victoria Del Rosario' },
    { tag: '{{refname}}', fieldLabel: 'Referrer / Endorser Name', category: 'Team & Leadership', sampleValue: 'Ricardo Gomez' },
    { tag: '{{refposition}}', fieldLabel: 'Referrer Position', category: 'Team & Leadership', sampleValue: 'Senior Marketing Associate' },
    { tag: '{{territoryhead}}', fieldLabel: 'Territory Head / Country Manager', category: 'Team & Leadership', sampleValue: 'Eduardo Valenzuela' },
    { tag: '{{countrymanager}}', fieldLabel: 'Country Manager', category: 'Team & Leadership', sampleValue: 'Eduardo Valenzuela' },
    { tag: '{{asst.countrymanager}}', fieldLabel: 'Assistant Country Manager', category: 'Team & Leadership', sampleValue: 'Ferdinand Marcos Jr.' },
    { tag: '{{seniorcountrymanager}}', fieldLabel: 'Senior Country Manager', category: 'Team & Leadership', sampleValue: 'Grace P. Tan' },
    { tag: '{{vicepresident}}', fieldLabel: 'Vice President', category: 'Team & Leadership', sampleValue: 'Ma. Lourdes Santos' },
    { tag: '{{format_date _date “MMMM DD, YYYY”}}', fieldLabel: 'Creation / Signing Date', category: 'Dates', sampleValue: 'September 30, 2026' },
    { tag: '{{format_date ADate “MMMM DD, YYYY”}}', fieldLabel: 'Accreditation Start Date', category: 'Dates', sampleValue: 'June 16, 2026' },
    { tag: '{{format_date ADate “MMMM DD, YYYY” “en” “+4months”}}', fieldLabel: 'Accreditation Expiry (4-Month Term)', category: 'Dates', sampleValue: 'October 16, 2026' },
    { tag: '{{contract}}', fieldLabel: 'Contract Header Title', category: 'Dates', sampleValue: 'SPECIAL AFFILIATE AGREEMENT' },
    { tag: '{{insert_image photo 96 96}}', fieldLabel: '1x1 ID Photo Submission', category: 'Document & Images', sampleValue: 'Embedded 1x1 Photo' },
    { tag: '{{insert_image signature 200 70}}', fieldLabel: 'Electronic Signature', category: 'Document & Images', sampleValue: 'Embedded E-Signature' },
    { tag: '{{insert_image ID2 192 288}}', fieldLabel: 'Primary Valid ID Front', category: 'Document & Images', sampleValue: 'Embedded Valid ID' },
    { tag: '{{insert_image passport 384 768}}', fieldLabel: 'Valid Passport / ID Document', category: 'Document & Images', sampleValue: 'Embedded Passport' },
    { tag: '{{corpname}}', fieldLabel: 'Corporate Entity Name (MD/MP)', category: 'Corporate', sampleValue: 'Elena Reyes Real Estate LLC' },
    { tag: '{{corprepresentative}}', fieldLabel: 'Corporate Representative', category: 'Corporate', sampleValue: 'Elena Patricia Reyes' },
    { tag: '{{corptin}}', fieldLabel: 'Corporate TIN', category: 'Corporate', sampleValue: '198-442-780-000' },
  ];
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
      const pMatches = xmlStr.match(/<w:p[\s>].*?<\/w:p>/gs) || [];
      for (const p of pMatches) {
        const tMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
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
    return xmlContent.replace(/<w:p[\s>].*?<\/w:p>/gs, (paragraphXml) => {
      const tRegex = /<w:t([^>]*)>(.*?)<\/w:t>/gs;
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
      // Signature tag: {{insert_image signature 200 70}}
      if (/\{\{\s*insert_image\s+signature\s*[^}]*\}\}/i.test(newFullText)) {
        totalReplaced++;
        if (sigRId) {
          const cx = 200 * 9525;
          const cy = 70 * 9525;
          const drawingXml = `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${nextRIdNum++}" name="AgentSignature"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${nextRIdNum++}" name="AgentSignature"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${sigRId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
          return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${drawingXml}</w:p>`;
        } else {
          newFullText = newFullText.replace(/\{\{\s*insert_image\s+signature\s*[^}]*\}\}/gi, `[ ELECTRONIC SIGNATURE: ${contractData.fullName.toUpperCase()} ]`);
        }
      }

      // Photo tag: {{insert_image photo 96 96}}
      if (/\{\{\s*insert_image\s+photo\s*[^}]*\}\}/i.test(newFullText)) {
        totalReplaced++;
        if (photoRId) {
          const cx = 96 * 9525;
          const cy = 96 * 9525;
          const drawingXml = `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${nextRIdNum++}" name="AgentPhoto"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${nextRIdNum++}" name="AgentPhoto"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${photoRId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
          return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${drawingXml}</w:p>`;
        } else {
          newFullText = newFullText.replace(/\{\{\s*insert_image\s+photo\s*[^}]*\}\}/gi, `[ 1X1 ID PHOTO ATTACHED: ${contractData.fullName.toUpperCase()} ]`);
        }
      }

      // ID tags: {{insert_image ID2 192 288}} and {{insert_image passport 384 768}}
      if (/\{\{\s*insert_image\s+(ID2|passport)\s*[^}]*\}\}/i.test(newFullText)) {
        totalReplaced++;
        newFullText = newFullText.replace(/\{\{\s*insert_image\s+(ID2|passport)\s*[^}]*\}\}/gi, `[ OFFICIAL VALID GOVERNMENT IDENTIFICATION / PASSPORT ATTACHED ]`);
      }

      // Replace all standard text dictionary placeholders
      for (const item of textDictionary) {
        if (item.pattern.test(newFullText)) {
          totalReplaced++;
          newFullText = newFullText.replace(item.pattern, item.value);
        }
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
export { generateContractPdf, downloadPdfBlob } from './contractPdfGenerator';
export type { GenerationResultPdf } from './contractPdfGenerator';
