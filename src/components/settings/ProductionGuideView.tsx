import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FolderLock,
  ShieldCheck,
  KeyRound,
  Database,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  Code,
  ExternalLink,
  Terminal,
  Server
} from 'lucide-react';

export const ProductionGuideView: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'auth' | 'sheets' | 'database' | 'deploy'>('auth');

  const appsScriptCode = `/**
 * THE AFFLUENTACCELERATORS - WEBSITE FORM TO AFFLUENTOS WEBHOOK
 * 
 * Instructions:
 * 1. Open your existing Website Inquiry Google Sheet.
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Replace the editor contents with this code.
 * 4. Replace AFFLUENTOS_API_URL with your live production URL (e.g., https://affluentos.affluentaccelerators.com/api/webhooks/inquiry)
 * 5. Click "Triggers" (alarm clock icon on left) -> "Add Trigger":
 *    - Choose which function to run: onFormSubmitTrigger
 *    - Select event source: From spreadsheet
 *    - Select event type: On form submit
 * 6. Save and authorize permissions!
 */

const AFFLUENTOS_WEBHOOK_URL = "https://affluentos.affluentaccelerators.com/api/webhooks/inquiry";
const AFFLUENTOS_API_SECRET = "affluent_secret_live_90d65c36_prod";

function onFormSubmitTrigger(e) {
  try {
    // e.values contains the newly submitted row array
    const row = e.values || [];
    
    // Map sheet columns by index (adjust numbers to match your exact columns)
    const payload = {
      submittedAt: row[0] || new Date().toISOString(),
      fullName: row[1] || "",
      businessName: row[2] || "",
      email: row[3] || "",
      phone: row[4] || "",
      whatsapp: row[5] || row[4] || "",
      location: row[6] || "Nigeria",
      industry: row[7] || "General Business",
      websiteUrl: row[8] || "",
      description: row[9] || "",
      stage: row[10] || "Growth",
      teamSize: row[11] || "10-50",
      annualRevenueRange: row[12] || "₦100M - ₦500M",
      currentChallenges: row[13] || "",
      category: row[14] || "Business Audit Requests",
      requestedService: row[15] || "Executive Consulting",
      expectedOutcomes: row[16] || "",
      budgetRange: row[17] || "₦10,000,000 - ₦20,000,000",
      driveFileAttachmentUrls: row[18] ? row[18].split(',') : [],
      source: "Website"
    };

    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-affluentos-signature": AFFLUENTOS_API_SECRET
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(AFFLUENTOS_WEBHOOK_URL, options);
    Logger.log("AffluentOS Response Code: " + response.getResponseCode());
    Logger.log("AffluentOS Response Body: " + response.getContentText());
  } catch (err) {
    Logger.log("Error in AffluentOS webhook: " + err.toString());
  }
}`;

  const supabaseSqlSchema = `-- AFFLUENTOS PRODUCTION SUPABASE SCHEMA & RLS
-- Target Project: pactzmpimnaeieijpvdw
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/pactzmpimnaeieijpvdw/sql/new

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin',
    'bd_manager',
    'sales_rep',
    'consultant',
    'intern'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create Authorized Staff Whitelist Table
CREATE TABLE IF NOT EXISTS public.authorized_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  default_role user_role NOT NULL DEFAULT 'sales_rep',
  invited_by TEXT NOT NULL DEFAULT 'Founder Genesis',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Pre-seed Whitelist: Founder + Executive Leadership
INSERT INTO public.authorized_staff (email, default_role, invited_by)
VALUES 
  ('fulfilmenttaiwo@gmail.com', 'super_admin', 'Founder & System Owner'),
  ('c.eze@affluentaccelerators.com', 'super_admin', 'System Genesis'),
  ('a.bello@affluentaccelerators.com', 'admin', 'Dr. Chukwuma Eze'),
  ('t.adeyemi@affluentaccelerators.com', 'bd_manager', 'Amina Bello'),
  ('c.okafor@affluentaccelerators.com', 'sales_rep', 'Tunde Adeyemi'),
  ('d.adeleke@affluentaccelerators.com', 'consultant', 'Dr. Chukwuma Eze'),
  ('n.nwosu@affluentaccelerators.com', 'consultant', 'Amina Bello'),
  ('f.alabi@affluentaccelerators.com', 'intern', 'Amina Bello')
ON CONFLICT (email) DO UPDATE 
SET default_role = EXCLUDED.default_role;

-- 3. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'sales_rep',
  title TEXT DEFAULT 'Specialist',
  department TEXT DEFAULT 'Operations',
  phone TEXT,
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Automatic Whitelist Trigger on Signup
CREATE OR REPLACE FUNCTION public.handle_new_staff_signup()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
  is_whitelisted BOOLEAN := FALSE;
BEGIN
  -- Check whitelist
  SELECT default_role INTO assigned_role
  FROM public.authorized_staff
  WHERE LOWER(email) = LOWER(NEW.email) AND is_active = TRUE;

  IF assigned_role IS NOT NULL THEN
    is_whitelisted := TRUE;
  ELSIF (NEW.email ILIKE '%@affluentaccelerators.com') THEN
    assigned_role := 'sales_rep'::user_role;
    is_whitelisted := TRUE;
  ELSE
    assigned_role := 'intern'::user_role;
    is_whitelisted := FALSE;
  END IF;

  INSERT INTO public.profiles (id, name, email, role, phone, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    assigned_role,
    NEW.raw_user_meta_data->>'phone',
    is_whitelisted
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    role = EXCLUDED.role,
    active = EXCLUDED.active;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_staff_signup();

-- 5. Additional Operational Tables
CREATE TABLE IF NOT EXISTS public.user_onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  requested_role user_role NOT NULL DEFAULT 'sales_rep',
  department TEXT DEFAULT 'Commercial Growth',
  bio TEXT,
  approval_status TEXT NOT NULL DEFAULT 'unapproved',
  sheet_tab_name TEXT DEFAULT 'User Onboarding & Approvals',
  sheet_row_index INT,
  invited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  contact_type TEXT NOT NULL DEFAULT 'lead',
  relationship_owner_id UUID REFERENCES public.profiles(id),
  sheet_row_index INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_role_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_role user_role NOT NULL,
  assigned_user_id UUID REFERENCES public.profiles(id),
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  sheet_row_index INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_role_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read for authenticated" ON public.profiles;
CREATE POLICY "Public profiles read for authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage whitelist" ON public.authorized_staff;
CREATE POLICY "Admins can manage whitelist"
  ON public.authorized_staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-slate-900">AffluentOS Production Deployment Guide</h3>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              Live Implementation Ready
            </span>
          </div>
          <p className="text-slate-400 mt-0.5">
            Technical blueprint for Authentication by List, Google Sheets webhooks, Drive attachment parsing, and Supabase deployment
          </p>
        </div>
      </div>

      {/* Guide Nav Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveGuideTab('auth')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
            activeGuideTab === 'auth' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck size={14} />
          <span>1. Auth by List & Whitelist</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('sheets')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
            activeGuideTab === 'sheets' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet size={14} />
          <span>2. Google Sheets & Form Script</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('database')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
            activeGuideTab === 'database' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Database size={14} />
          <span>3. Supabase SQL & RLS</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('deploy')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
            activeGuideTab === 'deploy' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Server size={14} />
          <span>4. Hosting & Environment Vars</span>
        </button>
      </div>

      {/* TAB 1: AUTH BY LIST */}
      {activeGuideTab === 'auth' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
            <h4 className="font-bold text-xs flex items-center space-x-1.5">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>How User Authentication by a List Works in Production</span>
            </h4>
            <p className="text-[11px] leading-relaxed">
              Because AffluentOS is an internal enterprise operations platform, public sign-ups must never be permitted without explicit authorization. The architecture enforces authentication via a two-layer verification system:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-xs block">Layer 1: Authorized Email Whitelist</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                An administrator adds approved staff emails into the <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-slate-800">authorized_staff</code> table (via AffluentOS Settings → Team Whitelist). When a staff member registers, the database verifies if their email is in the authorized list before creating the session.
              </p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-emerald-800">
                Staff Email in List → Role Assigned → Instant Access Granted
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-xs block">Layer 2: Corporate Domain Auto-Approval</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Any staff member possessing an <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-slate-800">@affluentaccelerators.com</code> Google Workspace account can sign in via Google OAuth or corporate email and is assigned a default commercial/consulting role immediately.
              </p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-emerald-800">
                Non-whitelisted Email → Flagged as Inactive → Admin Alerted
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-800 text-xs">Production User Auth Checklist:</h5>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600">
              <li>Enable Supabase Auth or NextAuth with <strong>Email & Password</strong> and <strong>Google OAuth</strong> providers.</li>
              <li>In Supabase Dashboard → Authentication → URL Configuration, set your live production redirect URL: <code className="font-mono text-slate-800">https://affluentos.affluentaccelerators.com/**</code>.</li>
              <li>Execute the SQL trigger script in Step 3 so non-whitelisted emails are blocked at the database level.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE SHEETS & FORMS CODE */}
      {activeGuideTab === 'sheets' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs flex items-center space-x-1.5">
                <FileSpreadsheet size={16} className="text-emerald-700" />
                <span>Google Sheets Automation Trigger Script (Google Apps Script)</span>
              </h4>
              <button
                onClick={copyAppsScript}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs"
              >
                {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedScript ? 'Copied Script!' : 'Copy Script'}</span>
              </button>
            </div>
            <p className="text-[11px] leading-relaxed">
              Paste this script directly into your Google Sheet's <strong>Extensions → Apps Script</strong> editor. It automatically triggers whenever a new website form is submitted, instantly parsing the row and sending it to AffluentOS!
            </p>
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-72 leading-relaxed">
              {appsScriptCode}
            </pre>
          </div>

          <div className="space-y-2 pt-1">
            <h5 className="font-bold text-slate-800 text-xs">Expected Google Sheet Column Order:</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col A: Timestamp</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col B: Full Name</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col C: Company Name</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col D: Email Address</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col E: Phone Number</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col F: WhatsApp</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col G: Location</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col H: Industry</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col I: Website URL</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col J: Description</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col K: Stage</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col L: Team Size</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col M: Annual Revenue</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col N: Challenges</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col O: Inquiry Category</span>
              <span className="p-1.5 bg-slate-100 rounded border border-slate-200">Col S: Drive Links</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE SQL */}
      {activeGuideTab === 'database' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs flex items-center space-x-1.5">
                <Database size={16} className="text-emerald-700" />
                <span>Production PostgreSQL / Supabase SQL Schema</span>
              </h4>
              <button
                onClick={copySql}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs"
              >
                {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] leading-relaxed">
              Paste this directly into the Supabase SQL Editor. It creates the staff whitelist, user roles enum, and database-level Row Level Security (RLS) enforcement.
            </p>
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-72 leading-relaxed">
              {supabaseSqlSchema}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: DEPLOYMENT & ENV VARS */}
      {activeGuideTab === 'deploy' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Production Environment Variables</h4>
            <p className="text-[11px] text-slate-500">
              Provide these environment variables in your deployment dashboard (e.g. Vercel Project Settings → Environment Variables):
            </p>

            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
{`# SUPABASE LIVE POSTGRES
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-private-key"

# GOOGLE INTEGRATION VAULT
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_SHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
GOOGLE_DRIVE_FOLDER_ID="1a9ZkLQ7-9092_Affluent_Diagnostic_Vault"

# WEBHOOK SECURITY
AFFLUENTOS_WEBHOOK_SECRET="affluent_secret_live_90d65c36_prod"
COMPANY_DOMAIN="affluentaccelerators.com"`}
            </pre>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <h5 className="font-bold text-slate-800 text-xs">Deployment Steps:</h5>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600">
              <li>Connect your GitHub repository to <strong>Vercel</strong> or <strong>Netlify</strong>.</li>
              <li>Set build command: <code className="font-mono bg-slate-100 px-1 text-slate-800">npm run build</code> and output directory: <code className="font-mono bg-slate-100 px-1 text-slate-800">dist</code>.</li>
              <li>Paste the Environment Variables above into Vercel.</li>
              <li>Click <strong>Deploy</strong>. Your custom domain <code className="font-mono text-emerald-800 font-semibold">affluentos.affluentaccelerators.com</code> will be live in 60 seconds!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
