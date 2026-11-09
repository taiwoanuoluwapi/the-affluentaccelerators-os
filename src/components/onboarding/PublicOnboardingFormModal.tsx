import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  X,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PublicOnboardingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillEmail?: string;
  prefillRole?: UserRole;
  inviteToken?: string;
}

export const PublicOnboardingFormModal: React.FC<PublicOnboardingFormModalProps> = ({
  isOpen,
  onClose,
  prefillEmail = '',
  prefillRole = 'sales_rep',
  inviteToken = ''
}) => {
  const { submitOnboardingForm, googleSettings } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(prefillEmail || '');
  const [phone, setPhone] = useState('');
  const [requestedRole, setRequestedRole] = useState<UserRole>(prefillRole || 'sales_rep');
  const [department, setDepartment] = useState('Commercial Growth');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [password, setPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitting(true);
    try {
      const result = await submitOnboardingForm({
        inviteToken: inviteToken || undefined,
        fullName,
        email,
        phone: phone || '+234 800 000 0000',
        requestedRole,
        department,
        bio: bio || 'Professional onboarding applicant.',
        linkedinUrl: linkedinUrl || undefined,
        password
      });
      setSubmittedData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setBio('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#043e2f] to-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              AO
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-900">
                  User & Team Onboarding Form
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Public Candidate View
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Data submitted here writes to Google Sheets & Supabase with status <span className="font-semibold text-amber-700">"unapproved"</span>
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
          {!submittedData ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Context Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-slate-700">
                <FileSpreadsheet className="text-emerald-700 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    Direct Integration Pipeline Active:
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Submitting this form immediately generates a profile in Supabase Auth and appends a row to the Google Sheet tab <span className="font-mono font-bold text-emerald-800">[{googleSettings.onboardingSheetName || 'User Onboarding & Approvals'}]</span>. A partner will verify and approve your account on the sheet.
                  </p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Babatunde Ogunlesi"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Corporate Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="b.ogunlesi@affluentaccelerators.com"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    LinkedIn / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned / Requested Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={requestedRole}
                    onChange={e => setRequestedRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="sales_rep">Senior Sales Representative</option>
                    <option value="consultant">Lead Strategy Consultant & Analyst</option>
                    <option value="bd_manager">Business Development Manager</option>
                    <option value="admin">Operations & Project Coordinator</option>
                    <option value="intern">Operations & Research Fellow / Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="Commercial Growth">Commercial Growth</option>
                    <option value="Advisory & Consulting">Advisory & Consulting</option>
                    <option value="Operations & Coordination">Operations & Coordination</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>
              </div>

              {/* Bio & Background */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Bio & Domain Experience
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Summarize your past industry achievements, consulting experience, or sales deal closing background..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Password for Supabase Auth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Set Your Secure Login Password (Supabase Auth)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters with letters & numbers"
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <span>
                  I confirm that all details provided are accurate and agree to adhere to The Affluentaccelerators client confidentiality and internal data handling standards.
                </span>
              </label>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !agreedTerms}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Writing to Google Sheet & Supabase...</span>
                  ) : (
                    <>
                      <span>Submit Onboarding Application</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Post-Submission Confirmation State showing Google Sheet write details */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-xl shadow-sm">
                  ✓
                </div>
                <h4 className="text-base font-bold text-emerald-950">
                  Onboarding Form Successfully Submitted!
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Your details have been securely recorded in Supabase and posted to the central operations Google Sheet.
                </p>
              </div>

              {/* Google Sheet Live Posting Details */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="text-emerald-700" size={16} />
                    <span className="font-bold text-xs text-slate-800">
                      Google Sheets Integration Record
                    </span>
                  </div>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    STATUS: unapproved
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Spreadsheet</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {googleSettings.spreadsheetName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Section / Tab</span>
                      <span className="font-mono font-bold text-emerald-800 block">
                        {submittedData.googleSheetTab}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Row</span>
                      <span className="font-mono font-bold text-slate-800 block">
                        Row #{submittedData.googleSheetRowIndex}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Initial Status</span>
                      <span className="font-mono font-bold text-amber-700 block">
                        "unapproved"
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    <span className="font-bold">Next Step:</span> The Founder or Operations Admin will open this Google Sheet and review Row #{submittedData.googleSheetRowIndex}. Once they toggle the status dropdown cell from <span className="font-mono font-bold">"unapproved"</span> to <span className="font-mono font-bold text-emerald-800">"approved"</span>, Supabase automatically unlocks your login and routes assigned contacts to your account!
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Submit Another Profile
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
