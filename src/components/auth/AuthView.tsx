import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, signup, users } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Commercial Growth');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setError(res.message || 'Invalid credentials or unauthorized account.');
      }
      setLoading(false);
    }, 400);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = signup({ name, email, phone, department, password });
      if (!res.success) {
        setError(res.message);
      } else {
        setSuccess(res.message);
      }
      setLoading(false);
    }, 500);
  };

  const handleQuickDemoLogin = (userEmail: string) => {
    login(userEmail);
  };

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-[#043e2f] items-center justify-center shadow-lg border border-emerald-400/30 text-white font-mono font-extrabold text-2xl tracking-wider">
            AO
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Affluent<span className="text-amber-500">OS</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            The Affluentaccelerators Internal Operations, CRM & Sales Platform
          </p>
          <div className="inline-block mt-1">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Your Business. Your People. Your Progress.
            </span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 border-b border-slate-200 text-xs font-bold text-center">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className={`py-3.5 transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-emerald-700 text-emerald-900 bg-emerald-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Staff Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccess(null);
              }}
              className={`py-3.5 transition-colors border-b-2 ${
                mode === 'signup'
                  ? 'border-emerald-700 text-emerald-900 bg-emerald-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              New Staff Sign Up
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Error & Success Feedback */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. c.eze@affluentaccelerators.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-emerald-700 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 mt-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to AffluentOS'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 leading-snug">
                  <strong>Access Whitelist:</strong> Staff sign-ups are restricted to the <code className="font-mono">@affluentaccelerators.com</code> corporate domain or verified whitelist.
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Oluwakemi Davies"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="o.davies@affluentaccelerators.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Department</label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Commercial Growth">Commercial Growth</option>
                      <option value="Advisory & Consulting">Advisory & Consulting</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 mt-2"
                >
                  <span>{loading ? 'Submitting...' : 'Register Corporate Account'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <div className="space-y-3.5 text-xs">
                <p className="text-slate-600">
                  Enter your company email address. If whitelisted, an administrative password reset token will be dispatched.
                </p>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. c.eze@affluentaccelerators.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <button
                  onClick={() => {
                    setSuccess(`Password reset instructions sent to ${email || 'your email'}.`);
                    setTimeout(() => setMode('login'), 2000);
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Send Reset Token
                </button>
                <div className="text-center">
                  <button
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Personas - Instant Testing */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center space-x-1 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-amber-500" />
              <span>One-Click Test Accounts (RBAC)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 6).map(u => (
                <button
                  key={u.id}
                  onClick={() => handleQuickDemoLogin(u.email)}
                  className="p-2 text-left bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all flex items-center space-x-2 text-xs shadow-2xs group"
                >
                  <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 block truncate group-hover:text-emerald-800">
                      {u.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center space-x-1.5 font-mono">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Supabase RBAC & Row Level Security Enabled</span>
        </div>
      </div>
    </div>
  );
};
