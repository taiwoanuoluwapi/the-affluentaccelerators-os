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
  FileSpreadsheet,
  Database,
  Activity,
  ExternalLink,
  Settings
} from 'lucide-react';

interface AuthViewProps {
  onOpenOnboarding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onOpenOnboarding }) => {
  const {
    login,
    signup,
    users,
    supabaseLiveConnected,
    supabaseLiveLatency,
    supabaseProjectRef,
    testSupabaseHealth,
    updateSupabaseCredentials,
    supabaseConfig
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('fulfilmenttaiwo@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Executive Leadership');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(supabaseConfig.projectUrl);
  const [customKey, setCustomKey] = useState(supabaseConfig.anonKey);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || 'Invalid credentials or unauthorized account.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signup({ name, email, phone, department, password });
      if (!res.success) {
        setError(res.message);
      } else {
        setSuccess(res.message);
        if (!res.requiresApproval) {
          setTimeout(() => setMode('login'), 2000);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (userEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await login(userEmail);
      if (!res.success) {
        setError(res.message || 'Could not switch persona.');
      }
    } catch (err: any) {
      setError(err?.message || 'Quick login error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const res = await testSupabaseHealth();
      setPingResult(res.message);
    } catch (err: any) {
      setPingResult(err?.message || 'Ping failed');
    } finally {
      setTestingPing(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingPing(true);
    try {
      const res = await updateSupabaseCredentials(customUrl, customKey);
      setPingResult(res.message);
      if (res.success) {
        setTimeout(() => setShowConfigModal(false), 1200);
      }
    } catch (err: any) {
      setPingResult(err?.message || 'Could not save credentials');
    } finally {
      setTestingPing(false);
    }
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
          
          {/* Live Supabase Connection Badge */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer bg-white shadow-2xs hover:bg-slate-50 text-slate-700 border-slate-200"
              title="Click to view live Supabase project configuration"
            >
              <span className={`w-2 h-2 rounded-full ${supabaseLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <Database size={11} className={supabaseLiveConnected ? 'text-emerald-700' : 'text-slate-400'} />
              <span>
                {supabaseLiveConnected
                  ? `Supabase Live (${supabaseProjectRef}${supabaseLiveLatency ? ` • ${supabaseLiveLatency}ms` : ''})`
                  : 'Supabase Connecting...'}
              </span>
              <Settings size={10} className="text-slate-400 ml-0.5" />
            </button>
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
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{success}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company / Whitelisted Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. fulfilmenttaiwo@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Supabase Password</label>
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
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 mt-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{loading ? 'Authenticating with Supabase...' : 'Sign In to AffluentOS'}</span>
                  <ArrowRight size={15} />
                </button>

                {onOpenOnboarding && (
                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onOpenOnboarding}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <Sparkles size={13} className="text-emerald-600" />
                      <span>Invited to Join? Complete Onboarding Form →</span>
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 leading-snug">
                  <strong>Live Supabase Auth:</strong> Creating an account creates a secure profile in PostgreSQL and verifies your email against the authorized staff whitelist.
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Taiwo Anuoluwapo"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Corporate or Whitelisted Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="fulfilmenttaiwo@gmail.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Set Your Login Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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
                      placeholder="+234 800 000 0000"
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
                      <option value="Executive Leadership">Executive Leadership</option>
                      <option value="Commercial Growth">Commercial Growth</option>
                      <option value="Advisory & Consulting">Advisory & Consulting</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 mt-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{loading ? 'Creating Supabase Profile...' : 'Register Corporate Account'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <div className="space-y-3.5 text-xs">
                <p className="text-slate-600">
                  Enter your company email address. If registered in Supabase, an administrative password reset token will be dispatched.
                </p>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. fulfilmenttaiwo@gmail.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <button
                  onClick={() => {
                    setSuccess(`Password reset instructions queued for ${email || 'your email'}.`);
                    setTimeout(() => setMode('login'), 2000);
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Send Reset Token
                </button>
                <div className="text-center">
                  <button
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Personas - Instant Testing */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <Sparkles size={12} className="text-amber-500" />
                <span>One-Click Role Preview (RBAC)</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-mono">Instant Switch</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 6).map(u => (
                <button
                  key={u.id}
                  onClick={() => handleQuickDemoLogin(u.email)}
                  className="p-2 text-left bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all flex items-center space-x-2 text-xs shadow-2xs group cursor-pointer"
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
          <span>Supabase RBAC & Row Level Security Enforced</span>
        </div>
      </div>

      {/* Supabase Connection Details Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <Database size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Supabase Project Connection</h4>
                  <p className="text-[11px] text-slate-500">Live PostgreSQL backend & GoTrue Auth engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Status: {supabaseLiveConnected ? 'Connected & Healthy' : 'Connecting'}</span>
                  <span className="text-[11px] text-emerald-800">
                    Project Reference: <code className="font-mono font-bold">{supabaseProjectRef}</code>
                    {supabaseLiveLatency && ` • Latency: ${supabaseLiveLatency}ms`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRunPing}
                  disabled={testingPing}
                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Activity size={12} className={testingPing ? 'animate-spin' : ''} />
                  <span>{testingPing ? 'Testing...' : 'Ping Test'}</span>
                </button>
              </div>

              {pingResult && (
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                  {pingResult}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Publishable Key (Client API)</label>
                <input
                  type="text"
                  value={customKey}
                  onChange={e => setCustomKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/sql/new`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline flex items-center space-x-1 text-[11px] font-bold"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink size={12} />
                </a>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={testingPing}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    Save & Reconnect
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
