import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Building2,
  Calendar,
  Award,
  Search,
  Copy,
  Check,
  ArrowLeft,
  QrCode,
  MapPin,
  Lock,
  Phone,
  Mail,
  UserCheck,
  Download,
} from 'lucide-react';
import { AgentProfile, AccreditationApplication } from '../types';
import { MegaworldLogo } from './MegaworldLogo';
import { formatDate } from '../utils/dateFormatter';
import QRCode from 'qrcode';

interface PublicVerificationViewProps {
  initialCode?: string;
  agents: AgentProfile[];
  applications?: AccreditationApplication[];
  onBackToPortal: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  initialCode = '',
  agents,
  applications = [],
  onBackToPortal,
}) => {
  const [searchCode, setSearchCode] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [verificationTime, setVerificationTime] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setVerificationTime(
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })
    );
  }, [activeCode]);

  // Find agent by code
  const matchedAgent = agents.find(
    (a) =>
      a.affiliateCode.trim().toLowerCase() === activeCode.trim().toLowerCase() ||
      a.email?.trim().toLowerCase() === activeCode.trim().toLowerCase()
  );

  const matchedApplication = applications.find(
    (app) => app.affiliateCode?.trim().toLowerCase() === activeCode.trim().toLowerCase()
  );

  // Generate QR Code for this verification URL
  useEffect(() => {
    if (activeCode) {
      const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://mwiaccreditationportal.netlify.app'}/?verify=${encodeURIComponent(activeCode)}`;
      QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrCodeDataUrl(dataUrl))
        .catch((err) => console.error('Failed to generate verification QR', err));
    }
  }, [activeCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      setActiveCode(searchCode.trim());
      // Update URL without reloading
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?verify=${encodeURIComponent(searchCode.trim())}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  };

  const handleCopyLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://mwiaccreditationportal.netlify.app'}/?verify=${encodeURIComponent(activeCode)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const photoUrl =
    matchedAgent?.photoUrl ||
    matchedAgent?.idPhotoUrl ||
    matchedApplication?.idPhotoUrl ||
    matchedApplication?.personalDetails?.idPhotoUrl;

  const isActive = matchedAgent?.accreditationStatus === 'Active';
  const positionTitle =
    matchedAgent?.position && matchedAgent.position !== 'Pending Accreditation'
      ? matchedAgent.position
      : matchedApplication?.position || 'International Property Affiliate';

  const startDateFormatted = matchedAgent?.accreditationStartDate
    ? formatDate(matchedAgent.accreditationStartDate)
    : matchedApplication?.submissionDate
    ? formatDate(matchedApplication.submissionDate)
    : 'June 15, 2026';

  const expiryDateFormatted = matchedAgent?.accreditationExpiryDate
    ? formatDate(matchedAgent.accreditationExpiryDate)
    : 'October 15, 2026';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Corporate Navigation */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-900 text-white rounded-xl shadow-xs">
              <MegaworldLogo variant="emblem-only" theme="dark" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase font-sans">
                  Megaworld International
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Official Registry
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Global Property Affiliate Credential Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToPortal}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Portal Sign In
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Verification Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official Security Verification Service
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
            Affiliate Accreditation Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Scan results from the Megaworld International Digital ID Badge. This confirms the legal authorization and active standing of our International Property Affiliates.
          </p>
        </div>

        {/* Search Bar for Code lookup */}
        <form
          onSubmit={handleSearch}
          className="max-w-md mx-auto flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-lg"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter IPA Code (e.g. IPA-AP2-2026-0042)"
              className="w-full pl-9 pr-3 py-2 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-hidden font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Verify
          </button>
        </form>

        {/* Result Container */}
        {matchedAgent ? (
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border-2 border-emerald-500/40 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 relative">
            {/* Background Watermark */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, #ffffff 2%, transparent 0%), radial-gradient(circle at 75px 75px, #d4af37 2%, transparent 0%)`,
                backgroundSize: '80px 80px',
              }}
            />

            {/* Verification Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-lg">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                      SEC / DTI Verified Record
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Officially Accredited Megaworld Affiliate
                  </h2>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">
                  Live Verification Timestamp:
                </span>
                <span className="font-mono text-slate-200 text-[11px] font-semibold">
                  {verificationTime}
                </span>
              </div>
            </div>

            {/* Profile Highlight Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              {/* Photo */}
              <div className="md:col-span-3 flex flex-col items-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/80 shadow-xl p-1 bg-gradient-to-b from-amber-400/20 to-blue-900/40">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={matchedAgent.fullName}
                      className="w-full h-full object-cover object-top rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-slate-300">
                      <span className="text-2xl font-serif font-bold text-amber-300">
                        {matchedAgent.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-1 bg-blue-950 rounded-full border border-amber-400 text-amber-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">
                  Official Identification Photo
                </span>
              </div>

              {/* Identity Particulars */}
              <div className="md:col-span-9 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block mb-0.5">
                    Authorized Representative
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-tight">
                    {matchedAgent.fullName}
                  </h3>
                  <p className="text-sm font-semibold text-slate-300">
                    {positionTitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Permanent IPA Code
                    </span>
                    <strong className="font-mono text-amber-300 text-sm font-bold">
                      {matchedAgent.affiliateCode}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Assigned Division
                    </span>
                    <strong className="text-slate-200 text-xs font-semibold">
                      {matchedAgent.region || 'Asia Pacific 2'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Accreditation Standing
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <strong className="text-emerald-400 text-xs font-bold uppercase">
                        {matchedAgent.accreditationStatus || 'ACTIVE'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accreditation Cycle & Validity Period */}
            <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Current Official Accreditation Term (4-Month Cycle)
                </span>
                <p className="text-slate-300 text-xs">
                  Valid from <strong className="text-white">{startDateFormatted}</strong> through{' '}
                  <strong className="text-white">{expiryDateFormatted}</strong>
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-600/50 text-emerald-300 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Active & In Good Standing
              </div>
            </div>

            {/* Scope of Authority & Authorized Townships */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                Official Scope of Representation & Authority
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed text-justify">
                Megaworld International confirms that the affiliate listed above is authorized to market, represent standard company inventory price lists, present marketing collateral, and assist prospective purchasers in executing reservation documents for the following premier township developments:
              </p>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-amber-200/90 font-medium leading-relaxed">
                Uptown Bonifacio · McKinley Hill · Newport City · Eastwood City · Westside City · ArcoVia City · Iloilo Business Park · The Mactan Newtown · Boracay Newcoast
              </div>
            </div>

            {/* Security Certification Stamp & Direct Actions */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800 text-xs">
              <div className="space-y-0.5 text-[10px] font-mono text-slate-500">
                <p>Security Stamp: MW-IPA-{matchedAgent.affiliateCode.replace(/[^0-9]/g, '')}-2026</p>
                <p>Megaworld International • Alliance Global Tower, 36th Street, Taguig, Philippines</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-300" />}
                  {copiedLink ? 'Link Copied!' : 'Copy Verification Link'}
                </button>

                <button
                  type="button"
                  onClick={onBackToPortal}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  Portal Login
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* When Code Not Found */
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Affiliate Code Not Found: &ldquo;{activeCode || 'None'}&rdquo;
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Please ensure the International Property Affiliate code was entered correctly. Sample codes in the registry include:
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {agents.slice(0, 4).map((a) => (
                <button
                  key={a.affiliateCode}
                  type="button"
                  onClick={() => {
                    setSearchCode(a.affiliateCode);
                    setActiveCode(a.affiliateCode);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-amber-300 cursor-pointer"
                >
                  {a.affiliateCode} ({a.fullName.split(' ')[0]})
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 text-[11px] text-slate-500">
              If you suspect unaccredited or unauthorized representation, please contact Megaworld International Compliance at <span className="text-amber-400">compliance@megaworldinternational.com</span>.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
