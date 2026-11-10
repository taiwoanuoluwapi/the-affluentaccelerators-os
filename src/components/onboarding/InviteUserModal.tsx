import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  X,
  Mail,
  UserPlus,
  Copy,
  Check,
  Send,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboardingPreview?: (inviteUrl: string) => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onOpenOnboardingPreview
}) => {
  const { inviteUserByEmail } = useApp();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('sales_rep');
  const [department, setDepartment] = useState('Commercial Growth');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const newInvite = inviteUserByEmail(email, role, department, customNotes);
    setGeneratedInviteUrl(newInvite.inviteUrl);
    setIsGenerated(true);
    setEmailSentNotice(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmailText = () => {
    const emailText = `Subject: Invitation to join AffluentOS Operations & Client CRM

Hello,

You have been invited to join the internal operations platform at The Affluentaccelerators as ${role.toUpperCase()} (${department}).

${customNotes ? `Note from partner: "${customNotes}"\n\n` : ''}Please click the secure link below to complete your onboarding profile:
${generatedInviteUrl}

Once submitted, your profile is routed to the central Google Sheets queue for administrative approval, which immediately activates your Supabase account.

Warm regards,
The Affluentaccelerators Operations Team`;

    navigator.clipboard.writeText(emailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setEmail('');
    setCustomNotes('');
    setEmailSentNotice(false);
  };

  const roleOptions: { value: UserRole; label: string; desc: string; dept: string }[] = [
    {
      value: 'sales_rep',
      label: 'Commercial & Sales Representative',
      desc: 'Manages assigned lead contacts, proposals, discovery calls, and pipeline deals.',
      dept: 'Commercial Growth'
    },
    {
      value: 'consultant',
      label: 'Management & Strategy Consultant',
      desc: 'Conducts diagnostic audits, deliverable reviews, and client advisory engagements.',
      dept: 'Advisory & Consulting'
    },
    {
      value: 'bd_manager',
      label: 'Business Development Manager',
      desc: 'Oversees high-level institutional partnerships, key account strategy, and pipeline conversion.',
      dept: 'Commercial Growth'
    },
    {
      value: 'admin',
      label: 'Operations & Project Coordinator',
      desc: 'Coordinates client scheduling, workflow execution, document vault, and operational reporting.',
      dept: 'Operations & Coordination'
    },
    {
      value: 'intern',
      label: 'Operations & Research Fellow / Intern',
      desc: 'Assists with market research, meeting prep notes, and client diagnostic data entry.',
      dept: 'Operations'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-[#043e2f] text-white flex items-center justify-center shadow-xs">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Invite New User by Email
              </h3>
              <p className="text-xs text-slate-500">
                Dispatches an onboarding invitation link leading to the registration form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!isGenerated ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  User Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="candidate@company.com or @affluentaccelerators.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  The candidate will receive an invitation email containing a secure link to complete their onboarding profile.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Role & Access Tier <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {roleOptions.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                        role === opt.value
                          ? 'bg-emerald-50/60 border-emerald-600 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={role === opt.value}
                        onChange={() => {
                          setRole(opt.value);
                          setDepartment(opt.dept);
                        }}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {opt.dept}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Unit
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Custom Welcome Note / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  placeholder="e.g., Welcome aboard! Please complete your profile with your phone and bio for WhatsApp CRM routing."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Workflow notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5 text-amber-900 text-xs">
                <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Next in the Workflow:</span> Once submitted, the candidate's response will post directly into the Google Sheet tab <span className="font-mono font-bold text-amber-800">[User Onboarding & Approvals]</span> with status <span className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">"unapproved"</span>. You can approve them directly on the spreadsheet or here in AffluentOS!
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Generate Invitation & Email Link</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Success Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Invitation Link Successfully Generated!
                </h4>
                <p className="text-xs text-emerald-800">
                  An onboarding invitation has been created for <span className="font-bold">{email}</span>.
                </p>
              </div>

              {/* Shareable Link Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Shareable Onboarding Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Send this link to the user via WhatsApp, Slack, or corporate email.
                </p>
              </div>

              {/* Email Preview Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs">
                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between font-medium text-slate-600">
                  <div className="flex items-center space-x-2">
                    <span>Simulated Email Notification Dispatched</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      SMTP Ready
                    </span>
                  </div>
                  <button
                    onClick={handleCopyEmailText}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedEmail ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedEmail ? 'Email Copied!' : 'Copy Formatted Email'}</span>
                  </button>
                </div>
                <div className="p-3.5 space-y-2 bg-white text-slate-700">
                  <div className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">To:</span> {email}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">Subject:</span> Invitation to join AffluentOS Operations & Client CRM
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-200/60 leading-relaxed text-[11px]">
                    <p className="font-semibold text-slate-800">Hello,</p>
                    <p className="mt-1">
                      You have been invited to join the internal operations platform at The Affluentaccelerators as <span className="font-bold text-emerald-800">{role.toUpperCase()}</span>.
                    </p>
                    {customNotes && (
                      <p className="mt-1.5 italic text-slate-600 border-l-2 border-emerald-500 pl-2">
                        "{customNotes}"
                      </p>
                    )}
                    <p className="mt-2 text-slate-500">
                      Please click the secure button below to fill out your onboarding form. Once submitted, your profile will be posted to the internal Google Sheets registry for final partner sign-off.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                {onOpenOnboardingPreview && (
                  <button
                    onClick={() => {
                      onOpenOnboardingPreview(generatedInviteUrl);
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open Form Preview as Candidate</span>
                    <ExternalLink size={14} />
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Invite Another
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
