import React from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import { safeHtml2Canvas } from './colorSanitizer';

export interface WelcomeLetterData {
  recipientName: string;
  salutationName: string;
  affiliateCode: string;
  position: string;
  region: string;
  letterDateFormatted: string;
  expiryDateFormatted: string;
  refNumber?: string;
  customNote?: string;
}

interface WelcomeLetterDocumentProps {
  data: WelcomeLetterData;
  onOpenGuide?: () => void;
}

/**
 * Pure 1-page Welcome Letter React Component for Off-Screen PDF Capture and Screen Display.
 * Matches the official Megaworld International Welcome Letter Deck format (2026) with 100% fidelity:
 * - Serif typography throughout the body and sign-off
 * - Top-right layered cyan/cerulean swooping waves
 * - Bottom-left layered cyan/cerulean swooping waves
 * - CREATE benefits vertical single-column list with hollow round bullets and blue highlighted initials
 * - Dynamic position, region, and expiry date
 * - Executive sign-off by Mr. Javier Romeo K. Abustan
 * - Official corporate web, phone, Facebook, Twitter, and Instagram contact handles
 */
export const WelcomeLetterDocument: React.FC<WelcomeLetterDocumentProps> = ({ data, onOpenGuide }) => {
  return (
    <div
      id="welcome-letter-sheet"
      className="welcome-letter-sheet relative w-[794px] min-h-[1123px] bg-white text-slate-900 font-serif p-10 sm:p-12 flex flex-col justify-between box-border select-text shrink-0 shadow-2xl rounded-sm"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        fontFamily: "'Times New Roman', Times, Georgia, serif",
      }}
    >
      {/* TOP-RIGHT CURVED GRADIENT WAVES ACCENT */}
      <div className="absolute top-0 right-0 w-[420px] h-[190px] pointer-events-none overflow-hidden z-0">
        <svg viewBox="0 0 500 240" className="w-full h-full" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="wlTopGrad1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="wlTopGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="wlTopGrad3" x1="10%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0070ba" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Outermost soft cyan wave */}
          <path d="M120 0 C240 50 360 110 500 200 L500 0 Z" fill="url(#wlTopGrad1)" />
          {/* Middle sky blue wave */}
          <path d="M220 0 C320 55 410 115 500 155 L500 0 Z" fill="url(#wlTopGrad2)" />
          {/* Front vibrant cerulean wave */}
          <path d="M310 0 C390 45 450 85 500 110 L500 0 Z" fill="url(#wlTopGrad3)" />
        </svg>
      </div>

      {/* BOTTOM-LEFT CURVED GRADIENT WAVES ACCENT */}
      <div className="absolute bottom-0 left-0 w-[480px] h-[190px] pointer-events-none overflow-hidden z-0">
        <svg viewBox="0 0 560 220" className="w-full h-full" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="wlBotGrad1" x1="0%" y1="50%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="wlBotGrad2" x1="0%" y1="30%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="wlBotGrad3" x1="0%" y1="10%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0070ba" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Outermost soft wave */}
          <path d="M0 35 C170 75 370 155 560 220 L0 220 Z" fill="url(#wlBotGrad1)" />
          {/* Middle wave */}
          <path d="M0 90 C150 115 310 170 450 220 L0 220 Z" fill="url(#wlBotGrad2)" />
          {/* Innermost deep wave */}
          <path d="M0 135 C120 145 230 185 330 220 L0 220 Z" fill="url(#wlBotGrad3)" />
        </svg>
      </div>

      {/* RELATIVE CONTENT LAYER */}
      <div className="relative z-10 flex flex-col justify-between flex-1">
        {/* UPPER DOCUMENT SECTION */}
        <div>
          {/* TOP HEADER: OFFICIAL MEGAWORLD INTERNATIONAL LOGO */}
          <div className="flex items-center justify-between pb-6">
            <img
              src="/assets/aistudio/Megaworld_International_Logo_blue_4-02_2fcc5f75.png"
              alt="Megaworld International"
              className="h-16 w-auto object-contain bg-transparent shrink-0 select-none"
            />
          </div>

          {/* DATE */}
          <div className="text-[14px] text-slate-900 font-serif pt-1">
            {data.letterDateFormatted}
          </div>

          {/* SALUTATION */}
          <div className="pt-6 font-bold text-[15px] text-slate-950 font-serif">
            Dear {data.salutationName},
          </div>

          {/* BODY PARAGRAPHS */}
          <div className="pt-4 space-y-3.5 text-[13.5px] leading-relaxed text-slate-900 font-serif">
            {/* PARAGRAPH 1 */}
            <p className="text-slate-950">
              Thank you very much for joining our growing{' '}
              <strong className="font-bold text-slate-950">
                Megaworld Corporation - International Marketing Division
              </strong>{' '}
              family!
            </p>

            {/* PARAGRAPH 2 */}
            <p className="text-justify text-slate-950">
              It is my distinct privilege to welcome you to our group of dynamic and driven real estate
              sales professionals operating in key territories all over the world. Just like them, you
              were accepted because of your knowledge, attitudes, skills and integrity that form the core
              of our business. It is our fervent hope that you will champion, observe, and respect the
              corporate values we espouse toward the achievement of our corporate vision and dreams. In
              the process, we hope you achieve yours too.
            </p>

            {/* BENEFITS LEAD-IN */}
            <p className="text-slate-950 pt-1">
              As a new member, you are entitled to the following benefits:
            </p>

            {/* BENEFITS: VERTICAL 'CREATE' ORDER */}
            <ul className="pl-8 py-1 space-y-1.5 text-[13.5px] text-slate-950 font-serif list-none">
              <li className="flex items-center gap-3.5">
                <span className="w-2 h-2 rounded-full border border-slate-700 inline-block shrink-0" />
                <span>
                  <strong className="font-serif font-bold text-[#0080c8] text-[15px]">C</strong>areer Development
                </span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="w-2 h-2 rounded-full border border-slate-700 inline-block shrink-0" />
                <span>
                  <strong className="font-serif font-bold text-[#0080c8] text-[15px]">R</strong>ewarding Commission
                </span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="w-2 h-2 rounded-full border border-slate-700 inline-block shrink-0" />
                <span>
                  <strong className="font-serif font-bold text-[#0080c8] text-[15px]">E</strong>xciting Promos and Incentives
                </span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="w-2 h-2 rounded-full border border-slate-700 inline-block shrink-0" />
                <span>
                  <strong className="font-serif font-bold text-[#0080c8] text-[15px]">A</strong>cquaintances and Conferences
                </span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="w-2 h-2 rounded-full border border-slate-700 inline-block shrink-0" />
                <span>
                  <strong className="font-serif font-bold text-[#0080c8] text-[15px]">T</strong>raining and Self-Development
                </span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="w-2 h-2 rounded-full border border-slate-700 inline-block shrink-0" />
                <span>
                  <strong className="font-serif font-bold text-[#0080c8] text-[15px]">E</strong>nriching Experience
                </span>
              </li>
            </ul>

            {/* PLATFORMS & GUIDE */}
            <p className="text-justify text-slate-950 pt-1">
              Please check this{' '}
              {onOpenGuide ? (
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="text-[#0080c8] underline font-medium hover:text-[#0060aa] cursor-pointer inline p-0 m-0 bg-transparent border-none font-serif"
                >
                  guide
                </button>
              ) : (
                <span className="text-[#0080c8] underline font-medium">guide</span>
              )}{' '}
              and sign up at our 1.) <strong className="font-bold text-slate-950">Agent’s Hub</strong> - the
              one-stop, web-based sales management tool to access latest inventory, computations, updates and
              promotions; 2.) <strong className="font-bold text-slate-950">TBD Cloud</strong> - access and
              download presentation materials of Megaworld and its subsidiaries; and 3.){' '}
              <strong className="font-bold text-slate-950">Sales and Commission Portal</strong> - for
              monitoring commission and generating sales reports.
            </p>

            {/* POSITION, REGION & EXPIRY */}
            <p className="text-justify text-slate-950 pt-1">
              You are signed up as a{' '}
              <strong className="font-bold text-slate-950">{data.position}</strong> under{' '}
              <strong className="font-bold text-slate-950">{data.region}</strong> region. Your sales
              contract expires on{' '}
              <strong className="font-bold text-slate-950">{data.expiryDateFormatted}</strong> and is
              renewable upon further evaluation of your sales performance. You may also refer to your Sales
              Agency Agreement for the details of your sales targets & commission structure.
            </p>

            {/* CLOSING GREETING */}
            <p className="text-slate-950 pt-1 font-normal">
              We wish you all the best. Welcome to our world! Welcome to Megaworld!
            </p>

            {/* OPTIONAL OPERATIONS REMARKS */}
            {data.customNote && (
              <div className="p-2.5 bg-blue-50/70 border-l-3 border-[#0060AA] rounded-r-lg text-[12px] space-y-0.5 mt-1 font-sans">
                <span className="font-bold text-[#0060AA] block">Management Remarks:</span>
                <span className="text-slate-800 italic">{data.customNote}</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SIGN-OFF & CONTACT INFORMATION */}
        <div className="pt-8 pb-3 flex items-end justify-between">
          {/* Left Column: Sign-off */}
          <div className="font-serif space-y-0.5">
            <p className="text-[14px] text-slate-950">Sincerely,</p>
            <div className="h-10" /> {/* Clean breathing room for signature */}
            <p className="font-bold text-slate-950 tracking-wide text-[13.5px]">
              MR. JAVIER ROMEO K. ABUSTAN
            </p>
            <p className="text-[13px] text-slate-700">Managing Director</p>
          </div>

          {/* Right Column: Contact & Social Handles */}
          <div className="space-y-1.5 text-[#0080c8] font-sans text-[11px] pb-1">
            {/* Web */}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <a
                href="https://www.megaworldinternational.com"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                www.megaworldinternational.com
              </a>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <span>(632) 894-6300</span>
            </div>

            {/* Facebook */}
            <div className="flex items-start gap-2">
              <div className="w-3.5 h-3.5 bg-[#0080c8] rounded-[2px] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white font-bold text-[9px] leading-none select-none font-sans">
                  f
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span>MegaworldInternationalOfficial</span>
                <span>MegaworldInternationalRecruitment</span>
              </div>
            </div>

            {/* Twitter */}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
              <span>@megaworld_intl</span>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 fill-none stroke-current stroke-2 shrink-0"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span>@megaworld_intl</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generates an official single-page Welcome Letter PDF.
 * Uses an off-screen pristine DOM render to guarantee that all content,
 * branding, dates, and sign-offs fit precisely onto 1 standard A4 page.
 */
export async function generateWelcomeLetterPdfBlob(
  data: WelcomeLetterData
): Promise<{ blob: Blob; fileName: string }> {
  const safeCode = (data.affiliateCode || 'Agent').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Megaworld_International_Welcome_Letter_${safeCode}.pdf`;

  const tempHost = document.createElement('div');
  tempHost.id = `wl-pdf-export-${Date.now()}`;
  tempHost.style.cssText =
    'position: fixed; left: -9999px; top: 0; width: 794px; height: 1123px; opacity: 1; pointer-events: none; z-index: -99999; background: #ffffff;';
  document.body.appendChild(tempHost);

  const root = createRoot(tempHost);
  try {
    await new Promise<void>((resolve) => {
      root.render(<WelcomeLetterDocument data={data} />);
      setTimeout(resolve, 350);
    });

    // Ensure all images are fully loaded and decoded
    const images = Array.from(tempHost.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(
      images.map(async (img) => {
        try {
          if ('decode' in img && !img.complete) {
            await img.decode();
          }
        } catch {
          // ignore
        }
      })
    );

    // Wait for document fonts
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch {
      // ignore
    }

    const sheetElement = tempHost.querySelector<HTMLElement>('#welcome-letter-sheet') || tempHost;

    const canvas = await safeHtml2Canvas(sheetElement, {
      scale: 2.2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Add image fitting the exact 1 page A4 dimensions
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    const blob = pdf.output('blob');
    return { blob, fileName };
  } finally {
    try {
      root.unmount();
    } catch (e) {
      // ignore
    }
    if (document.body.contains(tempHost)) {
      document.body.removeChild(tempHost);
    }
  }
}

/**
 * Convenience helper to generate and trigger direct client-side download of the 1-page Welcome Letter PDF
 */
export async function downloadWelcomeLetterPdf(data: WelcomeLetterData): Promise<void> {
  const { blob, fileName } = await generateWelcomeLetterPdfBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
