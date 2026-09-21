import React, { useState } from 'react';
import { ShieldCheck, UserPlus, LogIn, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { REGIONS, Region, REGION_CODE_MAP, Position } from '../types';
import { MegaworldLogo } from './MegaworldLogo';
import { isLiveEnvironment } from '../utils/environment';

interface AuthViewProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onGoogleLogin?: () => Promise<void>;
  onRegister: (data: {
    fullName: string;
    email: string;
    mobileNumber?: string;
    password?: string;
    region: Region;
    position?: Position;
    accreditationStartDate?: string;
    accreditationExpiryDate?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onGoogleLogin, onRegister, isLoading }) => {
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
  const [regAcceptedTerms, setRegAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

              {onGoogleLogin && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400">
                      <span className="bg-white px-2">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="google-signin-btn"
                    disabled={isLoading}
                    onClick={async () => {
                      setErrorMessage('');
                      try {
                        await onGoogleLogin();
                      } catch (err: any) {
                        setErrorMessage(err.message || 'Google sign-in failed.');
                      }
                    }}
                    className="w-full py-2 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs transition flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.39 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </>
              )}

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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Region / Territory
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

              {/* Permanent Affiliate Code Preview & Portal Access Information Callout */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-950">Permanent Affiliate Code Preview:</span>
                  <span className="font-mono font-bold text-blue-900 text-xs px-2.5 py-0.5 bg-white rounded-md border border-blue-200 shadow-2xs">
                    {previewAffiliateCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Account Access Only:</strong> Registration creates your account and assigns your permanent Affiliate Code. It does not count as accreditation. Once you access your portal, you can proceed with the official accreditation process.
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
                <UserPlus className="w-4 h-4" /> {isLoading ? 'Registering...' : 'Register & Access Portal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
