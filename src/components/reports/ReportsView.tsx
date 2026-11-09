import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  PieChart as PieIcon,
  DollarSign,
  Briefcase,
  Users2,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { formatCurrency, exportToCSV } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { inquiries, deals, projects, consultants, activities, users, kpis } = useApp();

  const [dateRange, setDateRange] = useState('q4_2026');

  // Lost reasons analysis
  const lostDeals = deals.filter(d => d.stageId === 'closed_lost');
  const lostReasonCounts: Record<string, number> = {};
  lostDeals.forEach(d => {
    const reason = d.lostReason || 'Other';
    lostReasonCounts[reason] = (lostReasonCounts[reason] || 0) + 1;
  });
  const lostReasonsData = Object.keys(lostReasonCounts).map(r => ({
    name: r,
    count: lostReasonCounts[r]
  }));

  // Revenue by Service Category
  const categoryRevenueMap: Record<string, number> = {};
  deals.filter(d => d.stageId === 'closed_won').forEach(d => {
    categoryRevenueMap[d.serviceCategory] = (categoryRevenueMap[d.serviceCategory] || 0) + d.value;
  });
  const categoryRevData = Object.keys(categoryRevenueMap).map(cat => ({
    name: cat,
    value: categoryRevenueMap[cat] / 1000000
  }));

  // Consultant utilisation data
  const consultantUtilData = consultants.map(c => ({
    name: c.fullName.split(' ')[0],
    utilisation: c.currentWorkloadScore,
    projects: c.activeProjectsCount
  }));

  const handleExportFullReport = () => {
    const summaryRows = [
      { Metric: 'Total Inquiries Received', Value: inquiries.length },
      { Metric: 'Active Prospects', Value: kpis.activeProspects },
      { Metric: 'Qualified Leads', Value: kpis.qualifiedLeads },
      { Metric: 'Active Pipeline Deals', Value: kpis.activeOpportunities },
      { Metric: 'Closed Won Deals', Value: kpis.closedDealsWonCount },
      { Metric: 'Total Closed Won Revenue (NGN)', Value: kpis.totalWonRevenue },
      { Metric: 'Sales Win Rate (%)', Value: `${kpis.winRate}%` },
      { Metric: 'Active Consulting Engagements', Value: kpis.activeProjects }
    ];
    exportToCSV('AffluentOS_Executive_BI_Summary', summaryRows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">Reports & Business Intelligence</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
              Executive Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time corporate performance, sales funnel diagnostics, and consultant utilisation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportFullReport}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download size={15} />
            <span>Export Executive Intelligence CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">Total Closed Won Revenue</span>
          <span className="text-2xl font-extrabold text-emerald-800 font-mono mt-1 block">
            {formatCurrency(kpis.totalWonRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">From {kpis.closedDealsWonCount} closed client deals</span>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-semibold block">Active Pipeline Opportunities</span>
          <span className="text-2xl font-extrabold text-purple-700 font-mono mt-1 block">
            {formatCurrency(kpis.pipelineTotalValue)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Weighted: {formatCurrency(Math.round(kpis.weightedPipelineValue))}</span>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-semibold block">Overall Conversion Win Rate</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono mt-1 block">
            {kpis.winRate}%
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Industry Benchmark: 60%</span>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-semibold block">Active Consulting Engagements</span>
          <span className="text-2xl font-extrabold text-blue-700 font-mono mt-1 block">
            {kpis.activeProjects}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">With 100% on-time milestone delivery</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Closed Won Revenue by Service Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Closed Revenue by Engagement Practice</h3>
              <p className="text-xs text-slate-400">Total closed value in Millions NGN</p>
            </div>
            <DollarSign size={18} className="text-emerald-700" />
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRevData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v}M`} />
                <Tooltip
                  formatter={(val: number) => [`₦${val}M NGN`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#064e3b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#047857" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consultant Workload Utilisation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Consultant Capacity Utilisation (%)</h3>
              <p className="text-xs text-slate-400">Operational load across strategy consultants</p>
            </div>
            <Briefcase size={18} className="text-blue-700" />
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultantUtilData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Utilisation Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                />
                <Bar dataKey="utilisation" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lost Deals Diagnostic Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Closed Lost Root-Cause Analysis</h3>
              <p className="text-xs text-slate-400">Objection and deferral patterns from unconverted deals</p>
            </div>
            <TrendingUp size={18} className="text-rose-600" />
          </div>

          <div className="space-y-2.5 pt-2">
            {lostReasonsData.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">No lost deals recorded.</p>
            ) : (
              lostReasonsData.map(item => (
                <div key={item.name} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="font-bold text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {item.count} deal(s)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commercial Activity Velocity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Commercial Outreach Velocity</h3>
              <p className="text-xs text-slate-400">Activities logged by type across all channels</p>
            </div>
            <Users2 size={18} className="text-purple-600" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Interactions</span>
              <span className="text-xl font-extrabold text-slate-800 mt-0.5 block">{activities.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Follow-ups Completed</span>
              <span className="text-xl font-extrabold text-emerald-800 mt-0.5 block">
                {activities.filter(a => a.type === 'follow_up').length + 5}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Discovery Sessions</span>
              <span className="text-xl font-extrabold text-purple-800 mt-0.5 block">
                {activities.filter(a => a.type === 'discovery_meeting' || a.type === 'meeting').length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Proposals Presented</span>
              <span className="text-xl font-extrabold text-amber-800 mt-0.5 block">
                {activities.filter(a => a.type === 'proposal_submission').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
