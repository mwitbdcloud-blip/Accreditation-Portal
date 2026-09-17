import React, { useState } from 'react';
import { ShieldCheck, UserPlus, LogIn, Sparkles, CheckCircle, ArrowRight, Calendar, Clock } from 'lucide-react';
import { REGIONS, POSITIONS, Region, Position, REGION_CODE_MAP } from '../types';
import { MegaworldLogo } from './MegaworldLogo';
import { formatDate, safeDatePart, computeExpiryDate } from '../utils/dateFormatter';
import { isLiveEnvironment } from '../utils/environment';

interface AuthViewProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onRegister: (data: {
    fullName: string;
    email: string;
    password?: string;
    region: Region;
    position: Position;
    accreditationStartDate?: string;
    accreditationExpiryDate?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onRegister, isLoading }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state - clean inputs without prefilled demo credentials
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [showStaffAdminAccess, setShowStaffAdminAccess] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRegion, setRegRegion] = useState<Region>('Asia Pacific 2');
  const [regPosition, setRegPosition] = useState<Position>('Marketing Associate');
  const [accreditationStartDate, setAccreditationStartDate] = useState(() =>
    safeDatePart(new Date())
  );
  const [regAcceptedTerms, setRegAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculatedExpiryDate = computeExpiryDate(accreditationStartDate, 4);

  const regRegionCode = REGION_CODE_MAP[regRegion] || 'AP2';
  const previewAffiliateCode = `IPA-${regRegionCode}-XXXXXX`;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await onLogin(loginEmail, loginPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regAcceptedTerms) {
      setErrorMessage('You must accept the Megaworld Terms and Conditions to register.');
      return;
    }
    if (!regFullName || !regEmail) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    try {
      await onRegister({
        fullName: regFullName,
        email: regEmail,
        mobileNumber: regMobile,
        password: regPassword,
        region: regRegion,
        position: regPosition,
        accreditationStartDate,
        accreditationExpiryDate: calculatedExpiryDate,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center flex flex-col items-center">
        <div className="mb-4">
          <MegaworldLogo variant="full" theme="dark" size="lg" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
          International Property Affiliates
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Global Operations & Accreditation Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          {/* Tabs: Login / Register */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              id="tab-login"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition ${
                mode === 'login'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-register"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition ${
                mode === 'register'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              New Affiliate Registration
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Affiliate Code or Email Address
                  </label>
                  <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Agent Access Point
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  placeholder="e.g. IPA-AP2-000001 or name@example.com"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Your permanent <strong>Affiliate Code</strong> is your primary access point. Staff and Admin can dispatch credentials with temporary password for access and renewal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password / Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Enter your password or temporary password"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Secured via Firebase Auth</span>
                <span className="text-blue-900 font-semibold cursor-pointer hover:underline">
                  Forgot Password?
                </span>
              </div>

              <button
                type="submit"
                id="sign-in-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> {isLoading ? 'Signing in...' : 'Sign In to Portal'}
              </button>

              {/* Staff and Admin Only Access (Hidden entirely on live site, accessible only in local development) */}
              {!isLiveEnvironment() && (
                <div className="pt-3 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Restricted Access (Dev Only)</span>
                    <button
                      type="button"
                      id="toggle-staff-admin-credentials"
                      onClick={() => setShowStaffAdminAccess((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-blue-900 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{showStaffAdminAccess ? 'Hide Staff & Admin Access' : 'Staff & Admin Authorized Access'}</span>
                    </button>
                  </div>

                  {showStaffAdminAccess && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                          Staff & Admin Authorized Access
                        </p>
                        <span className="text-[9px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          BD Internal Only
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">
                        Authorized Megaworld International Business Development personnel credentials:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          id="staff-quick-login-btn"
                          onClick={() => {
                            setLoginEmail('staff@megaworld.com');
                            setLoginPassword('staff123');
                          }}
                          className="p-2 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-[11px] transition text-left group shadow-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-blue-900">
                            <span>BD Staff</span>
                            <span className="text-[9px] bg-blue-50 text-blue-800 px-1 rounded font-normal">Reviewer</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-600 truncate">staff@megaworld.com</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pass: staff123</div>
                        </button>

                        <button
                          type="button"
                          id="admin-quick-login-btn"
                          onClick={() => {
                            setLoginEmail('admin@megaworld.com');
                            setLoginPassword('admin123');
                          }}
                          className="p-2 bg-white hover:bg-amber-50 border border-slate-200 rounded-lg text-[11px] transition text-left group shadow-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-amber-900">
                            <span>BD Super Admin</span>
                            <span className="text-[9px] bg-amber-50 text-amber-800 px-1 rounded font-normal">Admin</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-600 truncate">admin@megaworld.com</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pass: admin123</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name (as on Government ID)
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Maria Santos Dela Cruz"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="maria.delacruz@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mobile / WhatsApp Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="+63 917 123 4567"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Create secure password"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Region/Territory
                  </label>
                  <select
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value as Region)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-800"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Position Tier
                  </label>
                  <select
                    value={regPosition}
                    onChange={(e) => setRegPosition(e.target.value as Position)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-800"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Accreditation Start Date & 4-Month Cycle Duration */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="reg-accreditation-date" className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" /> Accreditation Start Date
                  </label>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3 h-3" /> 4 Months Duration
                  </span>
                </div>

                <div className="space-y-1">
                  <input
                    type="date"
                    id="reg-accreditation-date"
                    required
                    value={accreditationStartDate}
                    onChange={(e) => setAccreditationStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-amber-300 bg-white rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none text-slate-800 font-medium"
                  />
                  <p className="text-[11px] text-amber-900">
                    Registration initiates your official 4-month international accreditation term.
                  </p>
                </div>

                {/* 4-Month Validity Period Preview */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Accredited From</span>
                    <span className="font-semibold text-slate-900">
                      {accreditationStartDate ? formatDate(accreditationStartDate) : 'Today'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Valid Until (4 Mos)</span>
                    <span className="font-bold text-amber-900">
                      {calculatedExpiryDate ? formatDate(calculatedExpiryDate) : '4 Months'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permanent Affiliate Code Preview Callout */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-950">Permanent Affiliate Code Preview:</span>
                  <span className="font-mono font-bold text-blue-900 text-xs">{previewAffiliateCode}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Registration generates your permanent Affiliate Code. You will complete your personal details, bank information, team upline, ID verification, and contract once inside the portal.
                </p>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reg-terms"
                  checked={regAcceptedTerms}
                  onChange={(e) => setRegAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-blue-900 rounded focus:ring-blue-900"
                />
                <label htmlFor="reg-terms" className="text-xs text-slate-600 leading-tight">
                  I agree to the Megaworld International Affiliate Terms & Conditions, Real Estate Code of Ethics, and Permanent Code Assignment Policy.
                </label>
              </div>

              <button
                type="submit"
                id="register-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> {isLoading ? 'Registering...' : 'Register & Assign Permanent Code'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
