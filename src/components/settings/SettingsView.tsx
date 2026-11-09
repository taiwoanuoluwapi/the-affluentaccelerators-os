import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Users2,
  Building,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  History,
  RotateCcw,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    users,
    auditLogs,
    googleSettings,
    currentUser,
    resetToInitialData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'branding' | 'roles' | 'audit'>('branding');
  const [auditFilter, setAuditFilter] = useState('all');

  const filteredLogs = auditLogs.filter(
    l => auditFilter === 'all' || l.entityType === auditFilter
  );

  const permissionsMatrix: { role: UserRole; label: string; desc: string; inquiries: string; crm: string; pipeline: string; consulting: string; settings: string }[] = [
    {
      role: 'super_admin',
      label: 'Super Admin / Founder',
      desc: 'Full company-wide oversight and unrestricted executive permissions.',
      inquiries: 'Full Access (All)',
      crm: 'Full Access (All)',
      pipeline: 'Full Access (All)',
      consulting: 'Full Access (All)',
      settings: 'Full Config & Security'
    },
    {
      role: 'admin',
      label: 'Operations Manager',
      desc: 'Operational coordination, lead triage, consultant assignment.',
      inquiries: 'Manage & Assign',
      crm: 'Manage & Merge',
      pipeline: 'Monitor All Stages',
      consulting: 'Coordinate & Assign',
      settings: 'Operational Settings'
    },
    {
      role: 'bd_manager',
      label: 'Business Development Manager',
      desc: 'Lead prospecting, qualification, commercial deals, outreach.',
      inquiries: 'Assigned Leads & Create',
      crm: 'Create & Manage Assigned',
      pipeline: 'Create & Advance Deals',
      consulting: 'Request Assignment',
      settings: 'View Only'
    },
    {
      role: 'sales_rep',
      label: 'Sales Representative',
      desc: 'Discovery calls, proposal submission, conversion closing.',
      inquiries: 'Assigned Prospects',
      crm: 'Assigned Contacts',
      pipeline: 'Manage Assigned Deals',
      consulting: 'No Access',
      settings: 'No Access'
    },
    {
      role: 'consultant',
      label: 'Consultant / Business Analyst',
      desc: 'Client engagement execution, diagnostics, milestone reports.',
      inquiries: 'Assigned Diagnostics',
      crm: 'Authorised Client Info',
      pipeline: 'No Access',
      consulting: 'Manage Tasks & Uploads',
      settings: 'No Access'
    },
    {
      role: 'intern',
      label: 'Team Fellow / Intern',
      desc: 'Research synthesis, task execution, document prep.',
      inquiries: 'Assigned Research',
      crm: 'Restricted View',
      pipeline: 'No Access',
      consulting: 'Assigned Tasks Only',
      settings: 'No Access'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">Platform Settings & Governance</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              Role-Based Access Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Branding, role permissions matrix, team management, and immutable audit logs
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset AffluentOS to clean initial operational dataset?')) {
              resetToInitialData();
            }
          }}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
        >
          <RotateCcw size={14} />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'branding' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Company Identity & Branding
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'roles' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Roles & RBAC Matrix
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'audit' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History size={14} />
          <span>System Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: BRANDING */}
      {activeTab === 'branding' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-sm text-slate-900">Brand Identity & Visual Standards</h3>
            <p className="text-slate-400 mt-0.5">Specifications for The Affluentaccelerators internal platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Application Name</label>
                <input
                  type="text"
                  readOnly
                  value="AffluentOS"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Parent Organisation</label>
                <input
                  type="text"
                  readOnly
                  value="The Affluentaccelerators"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Company Tagline</label>
                <input
                  type="text"
                  readOnly
                  value="Your Business. Your People. Your Progress."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-emerald-800 font-semibold italic"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">Visual Identity Tokens</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-[#064e3b]"></div>
                    <span className="font-semibold text-slate-800">Deep Emerald Green (#064E3B)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Primary Brand</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-[#d97706]"></div>
                    <span className="font-semibold text-slate-800">Warm Gold Accent (#D97706)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Secondary Brand</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-[#0f172a]"></div>
                    <span className="font-semibold text-slate-800">Dark Charcoal Text (#0F172A)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Typography</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & RBAC MATRIX */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Database Role-Based Access Control (RBAC)</h3>
            <p className="text-slate-400 mt-0.5">
              Strict permissions enforced server-side. Users cannot access unauthorized endpoints by URL alteration.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">User Role</th>
                  <th className="p-3">Inquiries</th>
                  <th className="p-3">CRM / Contacts</th>
                  <th className="p-3">Sales Deals</th>
                  <th className="p-3">Projects</th>
                  <th className="p-3">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map(m => (
                  <tr key={m.role} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{m.label}</span>
                      <span className="text-[10px] text-slate-400">{m.desc}</span>
                    </td>
                    <td className="p-3 font-medium text-emerald-800">{m.inquiries}</td>
                    <td className="p-3 font-medium text-slate-700">{m.crm}</td>
                    <td className="p-3 font-medium text-purple-800">{m.pipeline}</td>
                    <td className="p-3 font-medium text-blue-800">{m.consulting}</td>
                    <td className="p-3 font-medium text-slate-600">{m.settings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Immutable Corporate Audit Log</h3>
              <p className="text-slate-400 mt-0.5">Every inquiry assignment, deal update, and project milestone is recorded</p>
            </div>

            <select
              value={auditFilter}
              onChange={e => setAuditFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Entity Actions</option>
              <option value="Inquiry">Inquiry Actions</option>
              <option value="Deal">Deal Actions</option>
              <option value="Project">Project Actions</option>
              <option value="Contact">Contact Actions</option>
              <option value="GoogleSync">Google Synchronisation</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between text-xs space-x-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{log.details}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    User: {log.userName} ({log.userRole})
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
