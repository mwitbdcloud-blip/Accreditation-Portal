import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  User,
  Mail,
  Lock,
  RotateCcw,
  CheckCircle2,
  Shield,
  Upload,
} from 'lucide-react';
import { UserRole } from '../types';

export interface ProfileData {
  fullName: string;
  email: string;
  password?: string;
  photoUrl?: string;
}

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    role: 'Agent' | 'Staff' | 'Admin';
    email: string;
    affiliateCode?: string;
    displayName: string;
    photoUrl?: string;
  };
  onSaveProfile: (updated: ProfileData) => Promise<void> | void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  const [fullName, setFullName] = useState(currentUser.displayName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentUser.photoUrl);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo upload
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (under 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Selected photo exceeds 3MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Reset Photo to default avatar
  const handleResetPhoto = () => {
    setPhotoUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset Password to temporary default password
  const handleResetPassword = () => {
    const defaultPass = currentUser.role === 'Admin' ? 'admin123' : currentUser.role === 'Staff' ? 'staff123' : 'password123';
    setNewPassword(defaultPass);
    setConfirmPassword(defaultPass);
    setSuccessMsg(`Password reset to standard temporary password: ${defaultPass}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your new password.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: newPassword ? newPassword : undefined,
        photoUrl,
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  const getRoleBadgeStyle = () => {
    if (currentUser.role === 'Admin') return 'bg-purple-100 text-purple-900 border-purple-200';
    if (currentUser.role === 'Staff') return 'bg-blue-100 text-blue-900 border-blue-200';
    return 'bg-emerald-100 text-emerald-900 border-emerald-200';
  };

  return (
    <div id="profile-editor-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-900/80 text-blue-300 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Profile Editor</h3>
              <p className="text-xs text-slate-400">
                Update or reset your photo profile, full name, password and email address
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role & Affiliate Code Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Account Role:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold border ${getRoleBadgeStyle()}`}>
              {currentUser.role}
            </span>
          </div>
          {currentUser.affiliateCode && (
            <span className="font-mono font-bold text-blue-950">
              {currentUser.affiliateCode}
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Profile Photo */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-800 flex items-center justify-center text-white font-bold text-xl">
                    {fullName.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-sm transition"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Profile Photo</h4>
                <p className="text-[11px] text-slate-500">
                  Upload an official portrait (JPG or PNG, max 3MB).
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-950 font-semibold border border-slate-300 rounded-lg transition"
                >
                  <Upload className="w-3 h-3" /> Upload Photo
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 font-medium rounded-lg transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Full Legal Name */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-900" /> Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Maria Cristina Santos"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          {/* 3. Email Address */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-900" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@megaworld.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used for system login authentication, notifications, and communications.
            </p>
          </div>

          {/* 4. Password (Change or Reset) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-900" /> Change / Reset Password
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[11px] font-semibold text-blue-900 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset to Default
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Leave blank if you wish to keep your current password unchanged.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition shadow-xs"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
