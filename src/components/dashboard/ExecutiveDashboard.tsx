import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Inbox,
  TrendingUp,
  Users2,
  CheckCircle,
  Briefcase,
  GitBranch,
  DollarSign,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatDate, formatRelativeTime, isOverdue } from '../../utils/formatters';

interface DashboardProps {
  onSelectInquiry: (id: string) => void;
  onSelectDeal: (id: string) => void;
  onSelectProject: (id: string) => void;
  setCurrentTab: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<DashboardProps> = ({
  onSelectInquiry,
  onSelectDeal,
  onSelectProject,
  setCurrentTab
}) => {
  const {
    currentUser,
    kpis,
    inquiries,
    deals,
    projects,
    activities,
    followUps,
    completeFollowUp,
    users
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | 'month' | 'quarter'>('month');

  // Follow-ups assigned to current user or all if admin
  const userFollowUps = followUps.filter(f =>
    currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? !f.completed
      : !f.completed && f.assignedUserId === currentUser.id
  );

  const overdueFollowUps = userFollowUps.filter(f => isOverdue(f.dueDate));
  const todayFollowUps = userFollowUps.filter(f => {
    const d = new Date(f.dueDate);
    const today = new Date();
    return !isOverdue(f.dueDate) && d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  // User's active deals
  const myDeals = deals.filter(d =>
    currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? d.stageId !== 'closed_won' && d.stageId !== 'closed_lost'
      : d.ownerId === currentUser.id && d.stageId !== 'closed_won' && d.stageId !== 'closed_lost'
  );

  // Growth Chart Data (Inquiries over time)
  const inquiryGrowthData = [
    { name: 'Week 1', inquiries: 3, converted: 1 },
    { name: 'Week 2', inquiries: 5, converted: 2 },
    { name: 'Week 3', inquiries: 8, converted: 4 },
    { name: 'Week 4', inquiries: inquiries.length, converted: deals.filter(d => d.stageId === 'closed_won').length }
  ];

  // Pipeline Stage Distribution Data
  const stagesOrder = [
    { id: 'new_lead', name: 'New Lead' },
    { id: 'initial_contact', name: 'Contact' },
    { id: 'discovery', name: 'Discovery' },
    { id: 'qualified_opportunity', name: 'Qualified' },
    { id: 'consultation_scheduled', name: 'Consultation' },
    { id: 'proposal_recommendation', name: 'Proposal' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'closed_won', name: 'Won' }
  ];

  const pipelineChartData = stagesOrder.map(s => {
    const stageDeals = deals.filter(d => d.stageId === s.id);
    const totalVal = stageDeals.reduce((sum, d) => sum + d.value, 0);
    return {
      stage: s.name,
      value: totalVal / 1000000, // In Millions NGN
      count: stageDeals.length
    };
  });

  // Inquiry Sources Data
  const sourcesMap: Record<string, number> = {};
  inquiries.forEach(i => {
    sourcesMap[i.source] = (sourcesMap[i.source] || 0) + 1;
  });
  const sourceColors = ['#059669', '#0284c7', '#d97706', '#8b5cf6', '#10b981', '#f59e0b', '#64748b'];
  const sourcesData = Object.keys(sourcesMap).map((key, idx) => ({
    name: key,
    value: sourcesMap[key],
    color: sourceColors[idx % sourceColors.length]
  }));

  // Team Performance Data
  const teamPerformanceData = users
    .filter(u => u.role === 'bd_manager' || u.role === 'sales_rep' || u.role === 'super_admin')
    .map(u => {
      const userActs = activities.filter(a => a.userId === u.id).length;
      const userWon = deals.filter(d => d.ownerId === u.id && d.stageId === 'closed_won');
      const wonValue = userWon.reduce((sum, d) => sum + d.value, 0) / 1000000;
      return {
        name: u.name.split(' ')[0],
        activities: userActs,
        wonValue: wonValue,
        wonDeals: userWon.length
      };
    });

  // Funnel Data
  const funnelStages = [
    { label: 'Total Inquiries', count: inquiries.length, pct: 100, color: 'bg-emerald-600' },
    { label: 'Contacted & Discovery', count: inquiries.filter(i => i.status !== 'new').length + deals.length, pct: 85, color: 'bg-emerald-500' },
    { label: 'Qualified Opportunities', count: kpis.qualifiedLeads + deals.length, pct: 65, color: 'bg-emerald-400' },
    { label: 'Proposals & Negotiations', count: deals.filter(d => d.stageId === 'proposal_recommendation' || d.stageId === 'negotiation' || d.stageId === 'closed_won').length, pct: 45, color: 'bg-amber-500' },
    { label: 'Closed Won Clients', count: kpis.closedDealsWonCount, pct: 25, color: 'bg-teal-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Date Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-800">
              Welcome back, {currentUser.name}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Operational Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Affluentaccelerators operations, leads, pipeline, and team performance overview.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setDateFilter('7d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === '7d' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === 'month' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('quarter')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === 'quarter' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === 'all' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Inquiries */}
        <div
          onClick={() => setCurrentTab('inquiries')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{kpis.totalInquiries}</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +{kpis.newInquiriesThisMonth} this mo
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Live synced with Google Sheets</span>
        </div>

        {/* Qualified Leads */}
        <div
          onClick={() => setCurrentTab('inquiries')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Qualified Leads</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{kpis.qualifiedLeads}</span>
            <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
              {kpis.activeProspects} prospects
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Commercial readiness verified</span>
        </div>

        {/* Active Pipeline Deals */}
        <div
          onClick={() => setCurrentTab('pipeline')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Deals</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitBranch size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{kpis.activeOpportunities}</span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono">
              {formatCurrency(kpis.pipelineTotalValue)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Weighted: {formatCurrency(Math.round(kpis.weightedPipelineValue))}</span>
        </div>

        {/* Closed Won Revenue */}
        <div
          onClick={() => setCurrentTab('pipeline')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Closed Won Deals</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">{formatCurrency(kpis.totalWonRevenue)}</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>{kpis.closedDealsWonCount} won</span>
            <span className="text-emerald-600 font-semibold">{kpis.winRate}% win rate</span>
          </div>
        </div>

        {/* Consulting Projects & Follow-ups */}
        <div
          onClick={() => setCurrentTab('activities')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Follow-ups & Engagements</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{kpis.activeProjects}</span>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
              {kpis.overdueFollowUpsCount} overdue
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {kpis.outstandingFollowUpsCount} total follow-ups due
          </span>
        </div>
      </div>

      {/* Main Grid: My Work Today + Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Visual Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Pipeline Stage Breakdown Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Sales Pipeline Value by Stage</h3>
                <p className="text-xs text-slate-400">Total pipeline value across active stages in Million NGN</p>
              </div>
              <button
                onClick={() => setCurrentTab('pipeline')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>View Kanban</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v}M`} />
                  <Tooltip
                    formatter={(val: number) => [`₦${val}M NGN`, 'Stage Value']}
                    contentStyle={{ backgroundColor: '#064e3b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#047857" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Conversion Funnel & Inquiry Growth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Lead Conversion Funnel</h3>
              <p className="text-xs text-slate-400 mb-4">Progression from website inquiry to closed engagement</p>
              <div className="space-y-3">
                {funnelStages.map(stage => (
                  <div key={stage.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{stage.label}</span>
                      <span className="font-bold text-slate-800">{stage.count} ({stage.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                        style={{ width: `${stage.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquiry Sources Donut Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Inquiry Channels & Sources</h3>
              <p className="text-xs text-slate-400 mb-2">Where business inquiries originate</p>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourcesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {sourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} Inquiries`, 'Count']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {sourcesData.map(s => (
                  <div key={s.name} className="flex items-center space-x-1.5 text-[11px] text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                    <span>{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Performance Leaderboard */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Commercial Team Performance</h3>
                <p className="text-xs text-slate-400">Activities recorded vs Closed revenue attributed</p>
              </div>
              <button
                onClick={() => setCurrentTab('team')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Directory</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="activities" name="Activities Logged" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wonValue" name="Won Revenue (₦M)" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): My Work Today & Recent Activity */}
        <div className="space-y-6">
          {/* MY WORK TODAY WORKSPACE */}
          <div className="bg-gradient-to-br from-emerald-900 to-[#043e2f] p-5 rounded-2xl text-white shadow-card border border-emerald-700/60">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-700/50 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="font-bold text-sm">My Work Today</h3>
              </div>
              <span className="text-[11px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-400/30">
                {userFollowUps.length} Pending
              </span>
            </div>

            {/* Overdue alert if any */}
            {overdueFollowUps.length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2.5">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white">Action Required: {overdueFollowUps.length} Overdue Follow-ups</span>
                  <span>Prioritize client calls and milestone communications.</span>
                </div>
              </div>
            )}

            {/* Today's Tasks & Followups */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-700">
              {userFollowUps.length === 0 ? (
                <div className="py-6 text-center text-emerald-200/60 text-xs">
                  <CheckCircle size={28} className="mx-auto mb-2 text-emerald-400 opacity-60" />
                  All caught up! No pending follow-ups assigned to you.
                </div>
              ) : (
                userFollowUps.map(f => {
                  const overdue = isOverdue(f.dueDate);
                  return (
                    <div
                      key={f.id}
                      className={`p-3 rounded-xl transition-all border ${
                        overdue
                          ? 'bg-rose-950/40 border-rose-700/50 hover:bg-rose-950/60'
                          : 'bg-emerald-950/50 border-emerald-800/60 hover:bg-emerald-950/80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="font-semibold text-xs text-white block truncate">{f.title}</span>
                          <span className="text-[11px] text-emerald-200/70 block truncate">
                            {f.businessName} ({f.targetName})
                          </span>
                          <span
                            className={`text-[10px] inline-flex items-center mt-1 font-mono ${
                              overdue ? 'text-rose-300 font-bold' : 'text-emerald-300'
                            }`}
                          >
                            <Clock size={11} className="mr-1" />
                            {formatRelativeTime(f.dueDate)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const outcome = prompt('Enter outcome note for completed follow-up:');
                            if (outcome) {
                              completeFollowUp(f.id, outcome);
                            }
                          }}
                          className="px-2 py-1 bg-white/10 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] font-semibold text-emerald-200 border border-emerald-500/30 transition-colors shrink-0"
                          title="Complete follow-up"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setCurrentTab('activities')}
              className="w-full mt-3 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-semibold text-center border border-emerald-600/40 transition-colors"
            >
              Open Follow-up Workspace →
            </button>
          </div>

          {/* RECENT ACTIVITY FEED */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Company Activity Feed</h3>
              <span className="text-[10px] font-mono text-slate-400">Live Audit</span>
            </div>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {activities.slice(0, 6).map(act => (
                <div key={act.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 mt-0.5 border border-slate-200">
                    {act.type === 'call' && <PhoneCall size={13} className="text-blue-600" />}
                    {act.type === 'whatsapp' && <MessageSquare size={13} className="text-emerald-600" />}
                    {act.type === 'discovery_meeting' && <Users2 size={13} className="text-purple-600" />}
                    {act.type === 'proposal_submission' && <DollarSign size={13} className="text-amber-600" />}
                    {act.type === 'follow_up' && <CheckCircle2 size={13} className="text-emerald-600" />}
                    {!['call', 'whatsapp', 'discovery_meeting', 'proposal_submission', 'follow_up'].includes(act.type) && (
                      <Calendar size={13} className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">{act.userName}</span>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0">
                        {formatRelativeTime(act.date)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug line-clamp-2 mt-0.5">{act.summary}</p>
                    <span className="text-[10px] text-emerald-700 font-medium block truncate mt-0.5">
                      • {act.relatedTitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
