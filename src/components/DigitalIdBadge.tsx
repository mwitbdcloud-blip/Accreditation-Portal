import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  QrCode,
  Download,
  Maximize2,
  Minimize2,
  Printer,
  RotateCw,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Share2,
} from 'lucide-react';
import { AgentProfile, AccreditationApplication } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { MegaworldLogo } from './MegaworldLogo';
import { safeHtml2Canvas } from '../utils/colorSanitizer';
import QRCode from 'qrcode';

interface DigitalIdBadgeProps {
  agent: AgentProfile;
  latestApplication?: AccreditationApplication | null;
  onNavigateToAccreditation?: () => void;
  className?: string;
}

export const DigitalIdBadge: React.FC<DigitalIdBadgeProps> = ({
  agent,
  latestApplication,
  onNavigateToAccreditation,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreenCardRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://mwiaccreditationportal.netlify.app'}/?verify=${encodeURIComponent(agent.affiliateCode)}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => {
        console.error('Failed to generate verification QR code:', err);
      });
  }, [verificationUrl]);

  // Determine active photo: agent.photoUrl, agent.idPhotoUrl, or latestApplication.idPhotoUrl
  const photoUrl =
    agent.photoUrl ||
    agent.idPhotoUrl ||
    latestApplication?.idPhotoUrl ||
    latestApplication?.personalDetails?.idPhotoUrl;

  const isActive = agent.accreditationStatus === 'Active';
  const isUnderReview =
    agent.accreditationStatus === 'Pending Review' ||
    latestApplication?.status === 'Submitted' ||
    latestApplication?.status === 'Under Review';
  const isExpiringSoon = agent.accreditationStatus === 'Expiring Soon';
  const isExpired = agent.accreditationStatus === 'Expired';

  const positionTitle =
    agent.position && agent.position !== 'Pending Accreditation'
      ? agent.position
      : latestApplication?.position || 'International Property Affiliate';

  const startDateFormatted = agent.accreditationStartDate
    ? formatDate(agent.accreditationStartDate)
    : latestApplication?.dateSubmitted
    ? formatDate(latestApplication.dateSubmitted)
    : isActive
    ? 'Official Term'
    : 'Pending Approval';

  const expiryDateFormatted = agent.accreditationExpiryDate
    ? formatDate(agent.accreditationExpiryDate)
    : isActive
    ? 'Active Cycle'
    : 'Pending Approval';

  // Status visual attributes
  const getStatusDisplay = () => {
    if (isActive) {
      return {
        label: 'OFFICIALLY ACCREDITED',
        sublabel: 'Active 4-Month Term',
        accentColor: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgTint: 'bg-emerald-950/40',
      };
    }
    if (isExpiringSoon) {
      return {
        label: 'RENEWAL OPEN',
        sublabel: 'Cycle Expiring Soon',
        accentColor: 'text-amber-400',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-500/40',
        bgTint: 'bg-amber-950/40',
      };
    }
    if (isUnderReview) {
      return {
        label: 'APPLICATION UNDER REVIEW',
        sublabel: 'Credentials Verification in Progress',
        accentColor: 'text-blue-300',
        dotColor: 'bg-blue-400',
        borderColor: 'border-blue-500/40',
        bgTint: 'bg-blue-950/40',
      };
    }
    if (isExpired) {
      return {
        label: 'ACCREDITATION EXPIRED',
        sublabel: 'Renewal Application Required',
        accentColor: 'text-rose-400',
        dotColor: 'bg-rose-400',
        borderColor: 'border-rose-500/40',
        bgTint: 'bg-rose-950/40',
      };
    }
    return {
      label: 'PENDING ACCREDITATION',
      sublabel: 'Initial Application Required',
      accentColor: 'text-slate-300',
      dotColor: 'bg-slate-400',
      borderColor: 'border-slate-500/40',
      bgTint: 'bg-slate-900/40',
    };
  };

  const statusInfo = getStatusDisplay();

  const handleCopyVerification = () => {
    navigator.clipboard.writeText(
      `Megaworld International Official Affiliate Verification:\nAgent: ${agent.fullName}\nIPA Code: ${agent.affiliateCode}\nPosition: ${positionTitle}\nStatus: ${statusInfo.label}\nPortal Link: ${verificationUrl}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadBadge = async (targetRef: React.RefObject<HTMLDivElement | null>) => {
    if (!targetRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await safeHtml2Canvas(targetRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#070d19',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Megaworld_Digital_ID_${agent.affiliateCode}_${isFlipped ? 'Back' : 'Front'}.png`;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export Digital ID badge image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintBadge = () => {
    window.print();
  };

  // Reusable card face renderer
  const renderCardFace = (isBack: boolean) => {
    if (isBack) {
      return (
        <div className="relative w-full h-full p-6 sm:p-7 flex flex-col justify-between text-white overflow-hidden select-none">
          {/* Subtle Guilloche / Security Lattice Background */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, #ffffff 2%, transparent 0%), radial-gradient(circle at 75px 75px, #d4af37 2%, transparent 0%)`,
              backgroundSize: '100px 100px',
            }}
          />

          {/* Top Header & Megaworld Crest */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <MegaworldLogo size="sm" theme="dark" variant="emblem-only" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Megaworld International
                  </h4>
                  <p className="text-[10px] text-amber-300 font-mono">
                    Global Marketing & Sales Division
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Official Credential
              </span>
            </div>

            {/* Scope of Authority & Authorized Townships */}
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-amber-300/90 block mb-1">
                  Scope of Representation & Authority
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
                  The individual named on the reverse side is an accredited International Property Affiliate (IPA) authorized by Megaworld International to present marketing collateral, quote standard inventory price lists, and assist prospective purchasers in executing official reservation agreements.
                </p>
              </div>

              {/* Authorized Townships Portfolio */}
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Authorized Megaworld Townships & Developments:
                </span>
                <p className="text-slate-300 leading-normal font-sans">
                  Uptown Bonifacio · McKinley Hill · Newport City · Eastwood City · Westside City · ArcoVia City · Iloilo Business Park · The Mactan Newtown · Boracay Newcoast
                </p>
              </div>
            </div>
          </div>

          {/* Central Security & QR Code Verification */}
          <div className="my-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">
                Direct Client Verification
              </span>
              <p className="text-[10px] text-slate-300">
                Scan QR with smartphone camera to confirm live accreditation standing:
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-amber-300 font-bold">
                  ID: {agent.affiliateCode}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQrModal(true);
                  }}
                  className="text-[9px] text-blue-300 hover:text-white underline font-semibold cursor-pointer"
                >
                  Enlarge QR
                </button>
              </div>
            </div>

            {/* Authentic Scannable QR Code */}
            <div
              className="shrink-0 p-1.5 bg-white rounded-xl shadow-md cursor-pointer hover:ring-2 hover:ring-amber-400 transition"
              onClick={(e) => {
                e.stopPropagation();
                setShowQrModal(true);
              }}
              title="Click to enlarge QR code for client scanning"
            >
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`Scannable Verification QR Code for ${agent.affiliateCode}`}
                  className="w-16 h-16 sm:w-18 sm:h-18 block object-contain rounded-xs"
                />
              ) : (
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Footer Official Verification & Contact */}
          <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <Building2 className="w-3 h-3 text-amber-400" /> Alliance Global Tower, Taguig, Philippines
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                SEC / DTI Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span>Security Stamp: MW-IPA-{agent.affiliateCode.replace(/[^0-9]/g, '')}-2026</span>
              <span>Tap to flip to front</span>
            </div>
          </div>
        </div>
      );
    }

    // FRONT SIDE: Main Identity & Official Presentation
    return (
      <div className="relative w-full h-full p-6 sm:p-7 flex flex-col justify-between text-white overflow-hidden select-none">
        {/* Subtle Background Pattern & Gold Accents */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #ffffff 2%, transparent 0%), radial-gradient(circle at 75px 75px, #d4af37 2%, transparent 0%)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Top Metallic Lanyard Slot Simulation */}
        <div className="flex justify-center mb-1">
          <div className="w-16 h-2 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-inner" />
        </div>

        {/* Official Header */}
        <div className="text-center space-y-1 border-b border-slate-700/60 pb-3">
          <div className="flex items-center justify-center gap-2">
            <MegaworldLogo size="sm" theme="dark" variant="emblem-only" />
            <span className="font-black tracking-widest text-xs uppercase text-white font-sans">
              MEGAWORLD INTERNATIONAL
            </span>
          </div>
          <div className="text-[9px] tracking-widest font-semibold uppercase text-amber-300/90">
            Property Affiliate Digital Identification
          </div>
        </div>

        {/* Middle Section: Photo & Primary Credentials */}
        <div className="my-auto py-2 flex flex-col items-center text-center space-y-3">
          {/* Executive Portrait Frame */}
          <div className="relative">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/60 shadow-xl p-1 bg-gradient-to-b from-amber-400/20 to-blue-900/40">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={agent.fullName}
                  className="w-full h-full object-cover object-top rounded-xl"
                  onError={(e) => {
                    // Fallback to initials if image link breaks
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-slate-300">
                  <span className="text-2xl font-serif font-bold text-amber-300">
                    {agent.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">
                    Affiliate Photo
                  </span>
                </div>
              )}
            </div>

            {/* Official Authenticated Seal Badge */}
            <div
              className="absolute -bottom-2 -right-2 p-1.5 bg-blue-950 rounded-full border-2 border-amber-400 shadow-md text-amber-300"
              title="Verified Megaworld Affiliate Seal"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          {/* Full Legal Name */}
          <div className="space-y-0.5">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
              {agent.fullName}
            </h3>
            <p className="text-xs font-semibold tracking-wide uppercase text-amber-300">
              {positionTitle}
            </p>
            <p className="text-[11px] text-slate-400">
              {agent.region || 'Asia Pacific 2'} Division
            </p>
          </div>

          {/* Permanent Affiliate Code Plate */}
          <div className="w-full max-w-xs py-2 px-3 bg-slate-950/80 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              IPA Code:
            </span>
            <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
              {agent.affiliateCode}
            </span>
          </div>

          {/* Accreditation Status Badge & Validity Period */}
          <div
            className={`w-full max-w-xs p-2.5 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgTint} flex flex-col items-center justify-center text-center space-y-1`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor} ${isActive ? 'animate-pulse' : ''}`} />
              <span className={`text-[11px] font-black uppercase tracking-wider ${statusInfo.accentColor}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
              <span>Term:</span>
              <strong className="text-white">{startDateFormatted}</strong>
              <span>–</span>
              <strong className="text-white">{expiryDateFormatted}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Bar: QR Verification & Hologram Bar */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowQrModal(true);
            }}
            className="flex items-center gap-2 text-left p-1 rounded-lg hover:bg-slate-800/60 transition cursor-pointer group"
            title="Click to display client verification QR code"
          >
            <div className="p-1.5 bg-white/10 group-hover:bg-amber-400/20 rounded-lg border border-white/10 text-amber-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-300 group-hover:text-amber-300 uppercase tracking-wider block">
                Scan QR Code
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                Live Verification
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            className="text-[10px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition px-2 py-1 rounded bg-slate-900 border border-slate-800"
            title="Click to view back of card"
          >
            <RotateCw className="w-3 h-3" />
            Flip Card
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="digital-id-badge-view" className={`space-y-6 ${className}`}>
      {/* Top Section Banner / Explanation */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <Award className="w-3.5 h-3.5" /> Client Credential Verification • Digital ID Badge
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Digital ID Badge for Client Presentation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Present this official digital credential to clients during meetings, property presentations, or online consultations. It certifies your authorized position, active accreditation term, and verified affiliate code with Megaworld International.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            id="btn-present-fullscreen"
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            title="Present badge in fullscreen view for clients"
          >
            <Maximize2 className="w-4 h-4 text-slate-950" />
            Present to Client
          </button>

          <button
            type="button"
            id="btn-enlarge-qr"
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-950 hover:bg-blue-900 border border-blue-700/60 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            title="Display large QR code for client phone scanner"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            Scan QR Code
          </button>

          <button
            type="button"
            id="btn-download-badge"
            disabled={isDownloading}
            onClick={() => handleDownloadBadge(cardRef)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Download high-resolution image of this badge"
          >
            <Download className="w-4 h-4 text-amber-400" />
            {isDownloading ? 'Saving...' : 'Save Badge (PNG)'}
          </button>

          <button
            type="button"
            id="btn-copy-verification-link"
            onClick={handleCopyVerification}
            className="px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition flex items-center gap-2 cursor-pointer"
            title="Copy verification summary to clipboard"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied Details!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-300" />
                Copy Verification
              </>
            )}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Digital ID Badge successfully saved to your downloads folder as high-resolution PNG!
          </span>
          <button
            onClick={() => setDownloadSuccess(false)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Badge Interactive Preview + Client Verification Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: The 3D Badge Preview Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Card Flip Instructions */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
              <span className="font-semibold text-slate-700">
                {isFlipped ? 'Back Side: Scope of Authority' : 'Front Side: Identification Card'}
              </span>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-blue-900 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Flip to {isFlipped ? 'Front' : 'Back'}
              </button>
            </div>

            {/* The Badge Container with Card Click to Flip */}
            <div
              id="digital-id-card-element"
              ref={cardRef}
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full aspect-[3/4.6] max-w-[340px] rounded-3xl bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 border-2 border-amber-400/40 shadow-2xl overflow-hidden cursor-pointer hover:border-amber-400 transition-all duration-300 transform hover:scale-[1.01]"
              style={{
                boxShadow: '0 20px 40px -15px rgba(2, 6, 23, 0.7), 0 0 20px 2px rgba(212, 175, 55, 0.15)',
              }}
            >
              {renderCardFace(isFlipped)}
            </div>

            {/* Controls Below Card */}
            <div className="w-full mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-900" />
                Flip Badge View
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Present Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Key Profile Details & Verification Checklist */}
        <div className="lg:col-span-7 space-y-5">
          {/* Official Verification Highlights Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Verified Agent Identification Record
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-900">
                {agent.affiliateCode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Legal Signatory Name
                </span>
                <strong className="text-slate-900 text-sm block font-serif">
                  {agent.fullName}
                </strong>
                <span className="text-[11px] text-slate-500 font-sans">
                  Registered Property Affiliate
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Position Tier
                </span>
                <strong className="text-blue-950 text-sm block">
                  {positionTitle}
                </strong>
                <span className="text-[11px] text-slate-500">
                  {agent.region || 'Asia Pacific 2'} Region
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Accreditation Status
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                  <strong className={`text-xs ${isActive ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {statusInfo.label}
                  </strong>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {statusInfo.sublabel}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Term Duration
                </span>
                <strong className="text-slate-900 text-xs block">
                  {startDateFormatted} to {expiryDateFormatted}
                </strong>
                <span className="text-[11px] text-slate-500">
                  4-Month Rolling Cycle
                </span>
              </div>
            </div>

            {/* Client Presentation Tips */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs text-blue-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-blue-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Best Practices for Client Presentation:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>
                  <strong>In-person meetings:</strong> Tap <em>Present to Client</em> to display the badge full-screen on your phone or tablet before presenting property pricing.
                </li>
                <li>
                  <strong>Online/Zoom consultations:</strong> Share your screen with the badge or send the downloaded PNG card via WhatsApp, Telegram, or email.
                </li>
                <li>
                  <strong>Client Verification:</strong> Instruct the client to scan the QR code on the back of the badge to confirm your active authorization directly on the official portal.
                </li>
              </ul>
            </div>
          </div>

          {/* Direct Actions Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Need to update your badge photo or details?</span>
              <span className="text-[11px] text-slate-500">
                Ensure your 1x1 formal portrait is updated in your accreditation profile.
              </span>
            </div>

            {onNavigateToAccreditation && (
              <button
                type="button"
                onClick={onNavigateToAccreditation}
                className="py-2 px-3.5 rounded-xl font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition text-xs flex items-center gap-1.5"
              >
                Update Profile / Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN CLIENT PRESENTATION MODAL */}
      {isFullscreen && (
        <div
          id="fullscreen-client-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative flex flex-col items-center max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close & Flip Bar */}
            <div className="w-full flex items-center justify-between text-white text-xs mb-3 px-2">
              <span className="font-mono text-amber-300 font-bold flex items-center gap-1.5">
                <MegaworldLogo size="sm" theme="dark" variant="emblem-only" />
                Client Presentation Mode
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Flip
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Close Fullscreen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* The Badge in Fullscreen */}
            <div
              ref={fullscreenCardRef}
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full aspect-[3/4.6] rounded-3xl bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 border-2 border-amber-400/50 shadow-2xl overflow-hidden cursor-pointer"
              style={{
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px 5px rgba(212, 175, 55, 0.25)',
              }}
            >
              {renderCardFace(isFlipped)}
            </div>

            {/* Bottom Modal Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 border border-blue-700 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                Enlarge QR Code
              </button>

              <button
                type="button"
                onClick={() => handleDownloadBadge(fullscreenCardRef)}
                className="py-2 px-3.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Save Image (PNG)
              </button>

              <button
                type="button"
                onClick={handleCopyVerification}
                className="py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied!' : 'Copy Summary'}
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENLARGED QR CODE MODAL FOR CLIENT SMARTPHONE SCANNING */}
      {showQrModal && (
        <div
          id="enlarged-qr-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative flex flex-col items-center max-w-sm w-full bg-slate-900 rounded-3xl border-2 border-amber-400/50 p-6 sm:p-7 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MegaworldLogo size="sm" theme="dark" variant="emblem-only" />
                <span className="font-bold text-xs uppercase text-white font-sans">
                  Official Verification QR
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Agent Info */}
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white font-serif">
                {agent.fullName}
              </h4>
              <p className="text-xs text-amber-300 font-mono font-bold">
                {agent.affiliateCode}
              </p>
              <p className="text-[11px] text-slate-400">
                {positionTitle} • {agent.region || 'Asia Pacific 2'}
              </p>
            </div>

            {/* Crisp High-Res QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400/40">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`Verification QR Code for ${agent.affiliateCode}`}
                  className="w-52 h-52 sm:w-56 sm:h-56 block object-contain"
                />
              ) : (
                <div className="w-52 h-52 sm:w-56 sm:h-56 bg-white flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Instruction Callout */}
            <div className="text-center space-y-1 px-2">
              <p className="text-xs font-semibold text-slate-200">
                Point any smartphone camera to scan
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automatically opens the official Megaworld International live accreditation certificate verifying active standing and authorized representation.
              </p>
            </div>

            {/* Actions */}
            <div className="w-full pt-2 flex flex-col gap-2">
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Live Verification Record
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyVerification}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-300" />}
                  {copiedLink ? 'Copied Details!' : 'Copy Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
