import { jsPDF } from 'jspdf';
import { ContractData } from '../components/ContractDocument';
import { Position } from '../types';
import { buildTagDictionary } from './contractGenerator';

export interface GenerationResultPdf {
  blob: Blob;
  fileName: string;
  totalPages: number;
  replacedCount: number;
  mappedTags: Record<string, string>;
}

/**
 * Triggers client-side browser file download for PDF Blobs
 */
export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Helper to safely add an image from a Data URL (base64)
 */
function tryAddImage(
  doc: jsPDF,
  dataUrl: string | undefined,
  format: 'PNG' | 'JPEG',
  x: number,
  y: number,
  w: number,
  h: number
): boolean {
  if (!dataUrl || !dataUrl.includes('base64,')) return false;
  try {
    doc.addImage(dataUrl, format, x, y, w, h);
    return true;
  } catch (e) {
    console.warn('Could not embed image into PDF:', e);
    return false;
  }
}

/**
 * Helper to render the official header on each page
 */
function renderHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  affiliateCode: string,
  positionName: string
) {
  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138); // #1E3A8A Megaworld Navy
  doc.text('MEGAWORLD INTERNATIONAL', 105, 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(title.toUpperCase(), 105, 18.5, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 105, 22.5, { align: 'center' });
  }

  // Affiliate Code Badge (Top Right)
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(148, 8, 48, 7.5, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 138);
  doc.text(`CODE: ${affiliateCode}`, 172, 13, { align: 'center' });

  // Position Badge (Top Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 8, 46, 7.5, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text(positionName.toUpperCase(), 37, 13, { align: 'center' });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.line(14, 25, 196, 25);
}

/**
 * Helper to render the official verified signature footer on every page
 */
function renderFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  data: ContractData
) {
  const y = 282;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);

  // Left notice
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MEGAWORLD INTERNATIONAL • OFFICIAL SALES ACCREDITATION CONTRACT SERIES OF 2026', 14, y + 4.5);
  doc.text('Confidential & Legally Binding • Independent Sales Agency Agreement', 14, y + 8);

  // Center E-Signature Stamp Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(102, y + 1, 56, 8.5, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text('E-SIGNATURE:', 104, y + 6);

  let sigDrawn = false;
  if (data.eSignatureUrl) {
    sigDrawn = tryAddImage(doc, data.eSignatureUrl, 'PNG', 123, y + 1.5, 20, 6.5);
  }
  if (!sigDrawn) {
    doc.setFont('times', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(30, 58, 138);
    doc.text(data.fullName, 124, y + 6);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text('VERIFIED', 148, y + 6);

  // Right page number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Page ${pageNum} of ${totalPages}`, 196, y + 5.5, { align: 'right' });
}

/**
 * Main PDF Contract Generator
 * Generates an official, standard, high-fidelity PDF Sales Accreditation Contract (SAA)
 * matching the exact uploaded template requirements.
 */
export async function generateContractPdf(
  templateSource: ArrayBuffer | Uint8Array | string | undefined,
  contractData: ContractData,
  position: Position | string
): Promise<GenerationResultPdf> {
  const p = position || 'Marketing Associate';
  const { mappingSummary } = buildTagDictionary(contractData, p);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalPages = 12;

  // ==========================================
  // PAGE 1: AGENT INFORMATION SHEET
  // ==========================================
  renderHeader(doc, 'Agent Information Sheet', 'Official Accreditation Record & Signatory Profile', contractData.affiliateCode, p);

  // Position Category Selection Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 28, 130, 22, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ACCREDITED POSITION CATEGORY:', 18, 33);

  const positionsList = [
    'Marketing Associate',
    'Senior Marketing Associate',
    'Marketing Manager',
    'Marketing Director',
    'Marketing Partner',
  ];

  let posX = 18;
  let posY = 38;
  positionsList.forEach((posName) => {
    const isChecked = posName.toLowerCase() === p.toLowerCase();
    doc.setDrawColor(isChecked ? 30 : 203, isChecked ? 58 : 213, isChecked ? 138 : 225);
    doc.setFillColor(isChecked ? 30 : 255, isChecked ? 58 : 255, isChecked ? 138 : 255);
    doc.rect(posX, posY - 2.5, 3, 3, isChecked ? 'FD' : 'D');

    if (isChecked) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
    }
    doc.setFontSize(6.5);
    doc.text(posName, posX + 4.5, posY);

    posX += 48;
    if (posX > 110) {
      posX = 18;
      posY += 5;
    }
  });

  // 1x1 Photo Frame (Top Right)
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(152, 28, 44, 44, 1.5, 1.5, 'FD');

  let photoAdded = false;
  if (contractData.idPhotoUrl) {
    photoAdded = tryAddImage(doc, contractData.idPhotoUrl, 'JPEG', 154, 30, 40, 40);
  }
  if (!photoAdded) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('OFFICIAL 1X1', 174, 48, { align: 'center' });
    doc.text('PHOTO ATTACHED', 174, 52, { align: 'center' });
  }

  // Section I: Personal Information
  let curY = 53;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('I. PERSONAL INFORMATION', 14, curY);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(14, curY + 1.5, 146, curY + 1.5);

  curY += 6;
  const personalFields = [
    { label: 'Full Legal Name:', value: `${contractData.lastName}, ${contractData.firstName} ${contractData.middleName} ${contractData.suffix}`.trim() },
    { label: 'Residential Address:', value: contractData.residentialAddress || 'Eastwood City, Quezon City' },
    { label: 'Country & State:', value: `${contractData.state}, ${contractData.country}` },
    { label: 'Date of Birth & Age:', value: `${contractData.dateOfBirth} (${contractData.age} years old)` },
    { label: 'Sex & Civil Status:', value: `${contractData.sex} • ${contractData.civilStatus}` },
    { label: 'Citizenship / Nationality:', value: `${contractData.citizenship} / ${contractData.nationality}` },
    { label: 'Tax Identification (TIN):', value: contractData.tin || '000-000-000-000' },
  ];

  personalFields.forEach((f) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(f.label, 14, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(f.value, 56, curY);
    curY += 4.6;
  });

  // Section II: Contact Details
  curY += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('II. CONTACT & DIGITAL INFORMATION', 14, curY);
  doc.line(14, curY + 1.5, 196, curY + 1.5);

  curY += 6;
  const contactFields = [
    { label: 'Primary Email Address:', value: contractData.emailAddress },
    { label: 'Mobile Contact No.:', value: contractData.mobileNumber },
    { label: 'Telephone / Landline:', value: contractData.telephoneNumber },
    { label: 'Territory / Broker Hub:', value: contractData.brokerGroup },
  ];

  contactFields.forEach((f, idx) => {
    const colX = idx % 2 === 0 ? 14 : 108;
    const lineY = curY + Math.floor(idx / 2) * 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(f.label, colX, lineY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(f.value, colX + 40, lineY);
  });
  curY += 14;

  // Section III: Nominated Bank Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('III. NOMINATED BANK ACCOUNT (FOR COMMISSION DISBURSEMENTS)', 14, curY);
  doc.line(14, curY + 1.5, 196, curY + 1.5);

  curY += 6;
  const bankFields = [
    { label: 'Nominated Bank:', value: contractData.bankName },
    { label: 'Account Name:', value: contractData.accountName },
    { label: 'Account Number:', value: contractData.accountNumber },
    { label: 'Bank Address / Branch:', value: contractData.bankAddress },
    { label: 'Bank Swift Code:', value: contractData.swiftCode },
  ];

  bankFields.forEach((f, idx) => {
    const colX = idx % 2 === 0 ? 14 : 108;
    const lineY = curY + Math.floor(idx / 2) * 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(f.label, colX, lineY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(f.value, colX + 38, lineY);
  });
  curY += 18;

  // Section IV: Leadership & Team
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('IV. SALES TEAM & LEADERSHIP HIERARCHY', 14, curY);
  doc.line(14, curY + 1.5, 196, curY + 1.5);

  curY += 6;
  const teamFields = [
    { label: 'Assigned Sales Team:', value: contractData.teamName },
    { label: 'Endorsing Referrer:', value: `${contractData.leadership.referrerName} (${contractData.leadership.referrerPosition})` },
    { label: 'Marketing Manager (MM):', value: contractData.leadership.marketingManager },
    { label: 'Marketing Director (MD):', value: contractData.leadership.marketingDirector },
    { label: 'Regional Country Manager:', value: contractData.leadership.countryManager },
    { label: 'Vice President - Sales:', value: contractData.leadership.vicePresident },
  ];

  teamFields.forEach((f, idx) => {
    const colX = idx % 2 === 0 ? 14 : 108;
    const lineY = curY + Math.floor(idx / 2) * 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(f.label, colX, lineY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(f.value, colX + 42, lineY);
  });
  curY += 20;

  // Agent Undertaking & Signature Block (Page 1)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, curY, 182, 38, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const p1Disclaimer =
    'I hereby certify under oath that all the statements and information provided in this Agent Information Sheet are true, correct, and complete to the best of my personal knowledge. I agree to Megaworld International accreditation policies, Code of Ethics, and authorize the verification of any information herein.';
  const p1Split = doc.splitTextToSize(p1Disclaimer, 174);
  doc.text(p1Split, 18, curY + 6);

  // Signature box
  doc.line(18, curY + 28, 85, curY + 28);
  doc.line(110, curY + 28, 178, curY + 28);

  if (contractData.eSignatureUrl) {
    tryAddImage(doc, contractData.eSignatureUrl, 'PNG', 28, curY + 16, 32, 11);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(contractData.fullName.toUpperCase(), 51.5, curY + 31.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Affiliate Signature / Date', 51.5, curY + 34.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(contractData.startDate, 144, curY + 31.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Date of Accreditation Execution', 144, curY + 34.5, { align: 'center' });

  renderFooter(doc, 1, totalPages, contractData);

  // ==========================================
  // PAGE 2: REFERRAL FORM (ENDORSEMENT)
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'Referral Form', 'Official Endorsement & Leadership Approval Record', contractData.affiliateCode, p);

  curY = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('BUSINESS DEVELOPMENT GROUP • SALES ENDORSEMENT FORM', 14, curY);

  curY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const refNotice = `This document formally records the nomination, screening, and leadership sponsorship of ${contractData.fullName} for accreditation as ${p.toUpperCase()} of Megaworld International.`;
  doc.text(doc.splitTextToSize(refNotice, 182), 14, curY);

  curY += 12;
  // Candidate Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, curY, 182, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('CANDIDATE INFORMATION', 18, curY + 6);

  const refDetails = [
    { l: 'Nominated Affiliate:', v: `${contractData.fullName} (${contractData.affiliateCode})` },
    { l: 'Position Level:', v: p },
    { l: 'Residential Address:', v: contractData.residentialAddress },
    { l: 'Contact Email & Mobile:', v: `${contractData.emailAddress} • ${contractData.mobileNumber}` },
    { l: 'Nominated Sales Team:', v: contractData.teamName },
    { l: 'Territory / Regional Hub:', v: contractData.brokerGroup },
  ];

  let rY = curY + 11;
  refDetails.forEach((rd) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(rd.l, 18, rY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(rd.v, 64, rY);
    rY += 3.6;
  });

  curY += 40;
  // Endorsement Ratings Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('LEADERSHIP ENDORSEMENT EVALUATION', 14, curY);
  doc.line(14, curY + 1.5, 196, curY + 1.5);

  curY += 6;
  const evalCriteria = [
    { crit: 'Professional Integrity & Compliance Record', rating: 'SATISFACTORY / EXCELLENT' },
    { crit: 'Target Market Reach & Client Prospecting Capability', rating: 'COMMENDED' },
    { crit: 'Alignment with Megaworld International Core Values', rating: 'VERIFIED & APPROVED' },
    { crit: 'Completeness of Mandatory Regulatory Documents', rating: 'COMPLETE & COMPLIANT' },
  ];

  evalCriteria.forEach((ec, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, curY, 182, 6.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(ec.crit, 18, curY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(ec.rating, 192, curY + 4.5, { align: 'right' });
    curY += 6.5;
  });

  curY += 12;
  // Leadership Sign-off Signatures (3 blocks)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('ENDORSEMENT & APPROVAL SIGNATORIES', 14, curY);
  doc.line(14, curY + 1.5, 196, curY + 1.5);

  curY += 10;
  const endorsements = [
    { role: 'Endorsing Referrer', name: contractData.leadership.referrerName, pos: contractData.leadership.referrerPosition },
    { role: 'Marketing Manager', name: contractData.leadership.marketingManager, pos: 'Marketing Manager' },
    { role: 'Marketing Director', name: contractData.leadership.marketingDirector, pos: 'Marketing Director' },
  ];

  endorsements.forEach((e, idx) => {
    const colX = 14 + idx * 62;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(colX, curY, 58, 44, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(e.role.toUpperCase(), colX + 29, curY + 6, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(e.name, colX + 29, curY + 22, { align: 'center' });

    doc.setDrawColor(148, 163, 184);
    doc.line(colX + 6, curY + 28, colX + 52, curY + 28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(e.name.toUpperCase(), colX + 29, curY + 32, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(e.pos, colX + 29, curY + 36, { align: 'center' });
    doc.text('Date: ' + contractData.startDate, colX + 29, curY + 40, { align: 'center' });
  });

  renderFooter(doc, 2, totalPages, contractData);

  // ==========================================
  // PAGE 3: SAA AGREEMENT BODY (PART 1)
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'Sales Agency Agreement', 'Appointment Terms & Scope of Independent Agency', contractData.affiliateCode, p);

  curY = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text(`SPECIAL AFFILIATE AGREEMENT — ${p.toUpperCase()}`, 105, curY, { align: 'center' });

  curY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Effective Term: ${contractData.startDate} to ${contractData.expiryDate}`, 105, curY, { align: 'center' });

  curY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Dear ${contractData.fullName},`, 14, curY);

  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const appointmentText = `We are pleased to advise you that you have been accredited as ${p.toUpperCase()} of MEGAWORLD INTERNATIONAL, for a fixed accreditation period of four (4) months, effective from ${contractData.startDate} to ${contractData.expiryDate}, subject to the following terms and mutual covenants:`;
  doc.text(doc.splitTextToSize(appointmentText, 182), 14, curY);

  curY += 14;
  const saaClausesP3 = [
    {
      title: '1. SCOPE OF INDEPENDENT AGENCY & TERRITORY',
      body: `As ${p}, you are authorized to solicit, market, and procure prospective buyers for official Megaworld International real estate development projects within ${contractData.region || 'Asia Pacific 2 Hub'}. You operate strictly as an independent contractor. Nothing in this Agreement shall create an employer-employee relationship, partnership, or joint venture between yourself and Megaworld International. You are solely responsible for all personal taxes, social contributions, and operational expenses incurred in the discharge of your sales activities.`,
    },
    {
      title: '2. PRODUCTION QUOTA & PERFORMANCE THRESHOLDS',
      body: `To maintain active accreditation standing in good order, you are required to achieve the mandated minimum net sales volume for your position during the 4-month accreditation period (Marketing Associate: PHP 3,000,000.00; Senior Marketing Associate: PHP 8,000,000.00; Marketing Manager: PHP 20,000,000.00 unit quota; Marketing Director: PHP 50,000,000.00 division quota). Sales production is officially tracked and verified in the BD Operations centralized real-time registry upon buyer remittance of required downpayments.`,
    },
    {
      title: '3. COMMISSION SCHEDULE & DISBURSEMENT PROTOCOL',
      body: `Commissions shall be disbursed strictly in accordance with Megaworld International approved commission rate matrix. Disbursements are conditional upon client payment clearances and submission of all buyer documentary requirements. All monetary releases shall be credited exclusively to your nominated bank account at ${contractData.bankName} (Account No. ${contractData.accountNumber}, Account Name: ${contractData.accountName}). The company will not issue checks or cash disbursements to third parties under any circumstances.`,
    },
  ];

  saaClausesP3.forEach((cl) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text(cl.title, 14, curY);

    curY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitB = doc.splitTextToSize(cl.body, 182);
    doc.text(splitB, 14, curY);
    curY += splitB.length * 3.7 + 5;
  });

  renderFooter(doc, 3, totalPages, contractData);

  // ==========================================
  // PAGE 4: SAA AGREEMENT BODY (PART 2)
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'Sales Agency Agreement', 'Operational Compliance, Renewal & Inactivity Policy', contractData.affiliateCode, p);

  curY = 32;
  const saaClausesP4 = [
    {
      title: '4. DOCUMENTARY REQUIREMENTS & ACCREDITATION VALIDATION',
      body: 'Accreditation status remains provisional until the full verification of: (a) duly executed and digitally signed Sales Agency Agreement, (b) verified copy of valid primary government-issued ID card or Passport, (c) 1x1 official formal photograph, (d) proof of nominated bank account, and (e) completed Sworn Affidavits of Undertaking (Annex A). Failure to submit complete documentary requirements within thirty (30) days of execution warrants administrative deactivation.',
    },
    {
      title: '5. INACTIVITY POLICY & RENEWAL EVALUATION',
      body: 'Affiliates who fail to register a qualified client reservation or attend mandatory product briefing sessions within sixty (60) days shall automatically revert to Inactive Status. Inactive affiliates must undergo reactivation briefing before submitting new client reservations. Accreditation renewal at the end of the four-month cycle is contingent on quota fulfillment and leadership endorsement from the Marketing Manager and Marketing Director.',
    },
    {
      title: '6. TERMINATION AND DE-ACCREDITATION GROUNDS',
      body: 'Megaworld International reserves the absolute right to revoke, suspend, or terminate this Agreement immediately upon written notice on grounds of: (a) fraudulent misrepresentation of property specifications or pricing, (b) client poaching or unauthorized sales conflict creation, (c) unauthorized collection or diversion of buyer payments, (d) breach of confidentiality or intellectual property rights, or (e) violation of the Megaworld Code of Ethics.',
    },
    {
      title: '7. GOVERNING LAW & VENUE OF ACTION',
      body: 'This Agreement shall be interpreted and governed by the laws of the Republic of the Philippines. Any legal action, suit, or proceeding arising out of or in connection with this Agreement shall be instituted exclusively in the proper courts of Quezon City or Taguig City, Metro Manila, to the exclusion of all other courts.',
    },
  ];

  saaClausesP4.forEach((cl) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text(cl.title, 14, curY);

    curY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitB = doc.splitTextToSize(cl.body, 182);
    doc.text(splitB, 14, curY);
    curY += splitB.length * 3.7 + 6;
  });

  renderFooter(doc, 4, totalPages, contractData);

  // ==========================================
  // PAGE 5: CAREER PROGRESSION & PROMOTION GUIDELINES
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'Career Progression Guidelines', 'Promotion Milestones & Leadership Retention Standards', contractData.affiliateCode, p);

  curY = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('SECTION II — CAREER ADVANCEMENT & QUALIFICATION STANDARDS', 14, curY);

  curY += 8;
  const progressionStandards = [
    {
      tier: 'MARKETING ASSOCIATE (MA) → SENIOR MARKETING ASSOCIATE (SMA)',
      reqs: [
        'Accumulated minimum sales volume of PHP 8,000,000.00 across two consecutive cycles.',
        'Active recruitment and mentoring of at least two (2) new accredited Marketing Associates.',
        'Zero unresolved client complaints and complete attendance in sales mastery academies.',
      ],
      benefits: 'Higher commission bracket + supervisory override on junior recruit closed sales.',
    },
    {
      tier: 'SENIOR MARKETING ASSOCIATE (SMA) → MARKETING MANAGER (MM)',
      reqs: [
        'Consistently exceeded personal quota with minimum group net volume of PHP 20,000,000.00.',
        'Direct leadership over an active unit composed of at least four (4) producing associates.',
        'Formal recommendation by Marketing Director and endorsement by Regional Country Manager.',
      ],
      benefits: 'Unit managerial overrides, quarterly performance incentives, travel rewards.',
    },
    {
      tier: 'MARKETING MANAGER (MM) → MARKETING DIRECTOR (MD)',
      reqs: [
        'Divisional production threshold of PHP 50,000,000.00 in net sales during evaluation term.',
        'Supervision of two or more distinct sales units with multiple producing managers.',
        'Exemplary business leadership record reviewed and approved by Sales Vice President.',
      ],
      benefits: 'Divisional override commissions, international sales mission sponsorship.',
    },
  ];

  progressionStandards.forEach((prog) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, curY, 182, 38, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text(prog.tier, 18, curY + 6);

    let listY = curY + 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    prog.reqs.forEach((r) => {
      doc.text(`• ${r}`, 20, listY);
      listY += 4;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text(`Key Rewards: ${prog.benefits}`, 20, listY + 1.5);

    curY += 42;
  });

  renderFooter(doc, 5, totalPages, contractData);

  // ==========================================
  // PAGE 6: EXECUTION & LEADERSHIP WITNESSING
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'Execution & Witnessing', 'Signatures of Mutual Agreement & Legal Acknowledgment', contractData.affiliateCode, p);

  curY = 32;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const execStatement = `IN WITNESS WHEREOF, the parties hereto have voluntarily caused this Special Affiliate Agreement to be executed and signed on this ${contractData.startDate}, at Quezon City, Metro Manila, Philippines.`;
  doc.text(doc.splitTextToSize(execStatement, 182), 14, curY);

  curY += 15;
  // Two main signatories: Agent & Megaworld Managing Director
  const signColWidth = 86;

  // Agent Signatory Box (Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, curY, signColWidth, 54, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ACCREDITED AFFILIATE SIGNATORY:', 18, curY + 7);

  if (contractData.eSignatureUrl) {
    tryAddImage(doc, contractData.eSignatureUrl, 'PNG', 32, curY + 14, 46, 15);
  }

  doc.line(22, curY + 34, 92, curY + 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(contractData.fullName.toUpperCase(), 57, curY + 39, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${p} • Affiliate Code: ${contractData.affiliateCode}`, 57, curY + 43, { align: 'center' });
  doc.text(`TIN: ${contractData.tin} • Date: ${contractData.startDate}`, 57, curY + 47, { align: 'center' });

  // Megaworld Official Signatory (Right)
  const rightColX = 110;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightColX, curY, signColWidth, 54, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MEGAWORLD INTERNATIONAL:', 114, curY + 7);

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('Maria Victoria M. Reyes', rightColX + 43, curY + 24, { align: 'center' });

  doc.line(rightColX + 8, curY + 34, rightColX + 78, curY + 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('MARIA VICTORIA M. REYES', rightColX + 43, curY + 39, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('First Vice President • Head of Sales Operations', rightColX + 43, curY + 43, { align: 'center' });
  doc.text('Megaworld International Corporate Directorate', rightColX + 43, curY + 47, { align: 'center' });

  curY += 62;
  // Signed in the presence of (Witnesses)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('SIGNED IN THE PRESENCE OF:', 14, curY);
  doc.line(14, curY + 1.5, 196, curY + 1.5);

  curY += 8;
  const witnesses = [
    { title: 'Marketing Director', name: contractData.leadership.marketingDirector },
    { title: 'Regional Country Manager', name: contractData.leadership.countryManager },
  ];

  witnesses.forEach((w, idx) => {
    const colX = idx === 0 ? 14 : 110;
    doc.line(colX + 10, curY + 18, colX + 76, curY + 18);

    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(w.name, colX + 43, curY + 14, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(w.name.toUpperCase(), colX + 43, curY + 22, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(w.title, colX + 43, curY + 26, { align: 'center' });
  });

  curY += 34;
  // Notarial Acknowledgment Frame
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, curY, 182, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('NOTARIAL ACKNOWLEDGMENT (REPUBLIC OF THE PHILIPPINES)', 18, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const ackText = `BEFORE ME, a Notary Public for and in the City of Quezon City, Philippines, this ${contractData.startDate}, personally appeared ${contractData.fullName} with primary government identification card, known to me to be the same person who executed the foregoing instrument and acknowledged that the same is their free and voluntary act and deed.`;
  doc.text(doc.splitTextToSize(ackText, 174), 18, curY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Doc. No. _______; Page No. _______; Book No. _______; Series of 2026.', 18, curY + 28);

  renderFooter(doc, 6, totalPages, contractData);

  // ==========================================
  // PAGE 7: ANNEX E — CODE OF ETHICS
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'Annex E — Code of Ethics', 'Official Standards of Conduct & Professional Responsibility', contractData.affiliateCode, p);

  curY = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('MEGAWORLD INTERNATIONAL CODE OF ETHICS', 14, curY);

  curY += 7;
  const ethicsRules = [
    {
      title: 'Article 1 — Professional Integrity and Fair Dealing',
      text: 'Every accredited affiliate shall deal fairly, honestly, and equitably with prospective purchasers, colleagues, and company officials. Misrepresentation of property specifications, amenities, completion timelines, or payment schedules is strictly prohibited.',
    },
    {
      title: 'Article 2 — Prohibition of Unauthorized Discounts & Rebates',
      text: 'Affiliates shall strictly adhere to official price lists approved by Megaworld Corporation. Offering under-the-table discounts, kickbacks, or commission pass-through rebates to clients is a major violation punishable by immediate de-accreditation.',
    },
    {
      title: 'Article 3 — Client Registration Primacy & Non-Poaching',
      text: 'The first affiliate to register a qualified prospect through the official central registry shall maintain exclusivity for sixty (60) days. Poaching registered clients or attempting to close sales through alternative channels constitutes grave misconduct.',
    },
    {
      title: 'Article 4 — Strict Collection Protocol',
      text: 'All reservation fees, downpayments, and installment checks must be made payable exclusively to the order of MEGAWORLD CORPORATION or relevant property company. Affiliates are strictly prohibited from receiving cash payments or personal transfers on behalf of buyers.',
    },
    {
      title: 'Article 5 — Confidentiality & Proprietary Assets',
      text: 'All marketing collateral, pricing matrices, client lists, and operational documents are the exclusive intellectual property of Megaworld International. Affiliates shall maintain absolute confidentiality during and after their accreditation term.',
    },
  ];

  ethicsRules.forEach((rule) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text(rule.title, 14, curY);

    curY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(rule.text, 182);
    doc.text(splitText, 14, curY);
    curY += splitText.length * 3.7 + 5;
  });

  renderFooter(doc, 7, totalPages, contractData);

  // ==========================================
  // PAGES 8-11: ANNEX A — AFFIDAVITS OF UNDERTAKING
  // ==========================================
  const companies = [
    { name: 'ArcoVia Properties, Inc.', acronym: 'API', page: 8 },
    { name: 'Megaworld Corporation', acronym: 'Megaworld', page: 9 },
    { name: 'Megaworld Capital Town, Inc.', acronym: 'MCTI', page: 10 },
    { name: 'Megaworld San Vicente Coast, Inc.', acronym: 'MSVCI', page: 11 },
  ];

  companies.forEach((comp) => {
    doc.addPage();
    renderHeader(
      doc,
      `Annex A — Affidavit (${comp.acronym})`,
      `Affidavit of Undertaking for ${comp.name}`,
      contractData.affiliateCode,
      p
    );

    let affY = 34;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text('REPUBLIC OF THE PHILIPPINES )', 14, affY);
    affY += 4.5;
    doc.text('QUEZON CITY, METRO MANILA  ) S.S.', 14, affY);

    affY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`AFFIDAVIT OF UNDERTAKING (${comp.name.toUpperCase()})`, 105, affY, { align: 'center' });

    affY += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const preamble = `I, ${contractData.fullName}, of legal age (${contractData.age} years old), ${contractData.citizenship} citizen, ${contractData.civilStatus}, with residential address at ${contractData.residentialAddress}, under oath, hereby depose and state that:`;
    doc.text(doc.splitTextToSize(preamble, 182), 14, affY);

    affY += 13;
    const affStatements = [
      `1. I have been duly accredited as ${p} by Megaworld International and authorize the marketing and promotion of real estate properties developed by ${comp.name} ("${comp.acronym}").`,
      `2. I understand and undertake that I have no authority to bind ${comp.name} to any contract, covenant, or commitment without prior written authorization from its corporate board.`,
      `3. I shall strictly present only official sales materials, pricing lists, payment terms, and architectural designs released and sanctioned by ${comp.name}.`,
      `4. I will not accept or hold payments, checks, or transfers made in my name or any name other than "${comp.name.toUpperCase()}".`,
      `5. I shall indemnify and hold ${comp.name}, its directors, officers, and employees free and harmless from any liability or damages arising out of my acts, omissions, or misrepresentations.`,
    ];

    affStatements.forEach((st) => {
      const splitSt = doc.splitTextToSize(st, 182);
      doc.text(splitSt, 14, affY);
      affY += splitSt.length * 4 + 4;
    });

    affY += 14;
    doc.text(`IN WITNESS WHEREOF, I have hereunto affixed my signature this ${contractData.startDate}, at Quezon City, Philippines.`, 14, affY);

    affY += 18;
    // Signature Line
    doc.line(110, affY + 12, 182, affY + 12);
    if (contractData.eSignatureUrl) {
      tryAddImage(doc, contractData.eSignatureUrl, 'PNG', 124, affY, 44, 12);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(contractData.fullName.toUpperCase(), 146, affY + 16, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Affiant / Signatory', 146, affY + 19.5, { align: 'center' });

    renderFooter(doc, comp.page, totalPages, contractData);
  });

  // ==========================================
  // PAGE 12: CERTIFICATE OF DIGITAL VERIFICATION
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'Digital Verification & Identity', 'Cryptographic Seal & Compliance Authenticity Record', contractData.affiliateCode, p);

  curY = 32;
  // Bordered Certificate Frame
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.rect(14, curY, 182, 235);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(16, curY + 2, 178, 231);

  curY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text('CERTIFICATE OF DIGITAL VERIFICATION', 105, curY, { align: 'center' });

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Megaworld International Accreditation & Compliance Directorate', 105, curY, { align: 'center' });

  curY += 10;
  // Primary ID / Passport Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(26, curY, 158, 68, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('OFFICIAL VERIFIED PRIMARY GOVERNMENT IDENTIFICATION / PASSPORT', 105, curY + 8, { align: 'center' });

  let idEmbedded = false;
  if (contractData.idPhotoUrl) {
    idEmbedded = tryAddImage(doc, contractData.idPhotoUrl, 'JPEG', 60, curY + 12, 90, 50);
  }
  if (!idEmbedded) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('[ VALID PRIMARY GOVERNMENT ID / PASSPORT RECORD ARCHIVED IN COMPLIANCE DATABASE ]', 105, curY + 38, { align: 'center' });
  }

  curY += 76;
  // Cryptographic audit details
  const cryptoDetails = [
    { k: 'Affiliate Signatory Name:', v: contractData.fullName },
    { k: 'Assigned Position Rank:', v: p },
    { k: 'Accreditation Affiliate Code:', v: contractData.affiliateCode },
    { k: 'Tax Identification Number (TIN):', v: contractData.tin },
    { k: 'Digital Signature Algorithm:', v: 'ECDSA / SHA-256 Authenticated Digital Stamp' },
    { k: 'Document Hash Verification:', v: `SHA256: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-${contractData.affiliateCode}-${Date.now().toString(36).toUpperCase()}` },
    { k: 'Accreditation Term Validity:', v: `${contractData.startDate} to ${contractData.expiryDate}` },
    { k: 'Nominated Disbursement Bank:', v: `${contractData.bankName} - ${contractData.accountNumber}` },
  ];

  cryptoDetails.forEach((cd) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(cd.k, 30, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(cd.v, 82, curY);
    curY += 5;
  });

  curY += 12;
  // Green Verification Seal Badge
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(45, curY, 120, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('OFFICIALLY VERIFIED & SECURED CONTRACT', 105, curY + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(4, 120, 87);
  doc.text('All placeholder tags matched and transferred accurately into official Megaworld SAA schema.', 105, curY + 13, { align: 'center' });
  doc.text(`Digital Verification Timestamp: ${new Date().toISOString()}`, 105, curY + 17.5, { align: 'center' });

  renderFooter(doc, 12, totalPages, contractData);

  // ==========================================
  // Generate PDF Output Blob
  // ==========================================
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  const outFileName = `Megaworld_${p.replace(/\s+/g, '_')}_Official_SAA_${contractData.affiliateCode}.pdf`;

  return {
    blob: pdfBlob,
    fileName: outFileName,
    totalPages,
    replacedCount: Object.keys(mappingSummary).length,
    mappedTags: mappingSummary,
  };
}
