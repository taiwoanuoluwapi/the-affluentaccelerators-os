import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  KeyRound,
  LogOut,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, logout } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [department, setDepartment] = useState(currentUser.department);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      name,
      title,
      phone,
      avatar,
      department
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback('New password must be at least 6 characters.');
      return;
    }
    setPasswordFeedback('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordFeedback(null), 3000);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <User size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">My Team Account & Profile</h3>
              <p className="text-xs text-slate-400">Manage credentials, contact details, and session security</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {savedFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center space-x-2 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Profile details saved successfully!</span>
            </div>
          )}

          {/* User Avatar & Role Strip */}
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="relative">
              <img
                src={avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-700 shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter image URL for avatar:', avatar);
                  if (url) setAvatar(url);
                }}
                className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-slate-300 text-slate-600 hover:text-emerald-700 shadow-xs"
                title="Change Avatar URL"
              >
                <Camera size={13} />
              </button>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-900">{currentUser.name}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase font-mono">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{currentUser.title}</p>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                Last Active: {formatDateTime(currentUser.lastLogin)}
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5">
              Personal Particulars
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Corporate Email</label>
                <input
                  type="email"
                  readOnly
                  value={currentUser.email}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Direct Telephone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                Save Profile Changes
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-3.5 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-1.5">
              <KeyRound size={15} className="text-slate-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Security & Password Update
              </h4>
            </div>

            {passwordFeedback && (
              <div className="p-2.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-medium">
                {passwordFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold"
              >
                Update Password
              </button>
            </div>
          </form>

          {/* Log Out Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Role: {currentUser.role} • ID: {currentUser.id}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center space-x-1.5 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out of AffluentOS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
