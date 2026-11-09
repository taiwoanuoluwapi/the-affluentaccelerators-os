import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  Plus,
  PhoneCall,
  MessageSquare,
  Mail,
  Users2,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Filter,
  DollarSign,
  X
} from 'lucide-react';
import { formatDate, formatDateTime, formatRelativeTime, isOverdue, isDueToday, formatCurrency } from '../../utils/formatters';
import { ActivityType, FollowUpItem } from '../../types';

interface ActivitiesWorkspaceProps {
  onOpenLogActivity: () => void;
  onOpenNewInquiry: () => void;
}

export const ActivitiesWorkspace: React.FC<ActivitiesWorkspaceProps> = ({
  onOpenLogActivity,
  onOpenNewInquiry
}) => {
  const { followUps, activities, completeFollowUp, users, currentUser, deals, inquiries } = useApp();

  const [followUpTab, setFollowUpTab] = useState<'due_today' | 'overdue' | 'upcoming' | 'completed'>('due_today');
  const [completeModalItem, setCompleteModalItem] = useState<FollowUpItem | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [scheduleNextDate, setScheduleNextDate] = useState('');

  // Follow-ups filtering
  const overdueItems = followUps.filter(f => !f.completed && isOverdue(f.dueDate));
  const dueTodayItems = followUps.filter(f => !f.completed && isDueToday(f.dueDate));
  const upcomingItems = followUps.filter(f => !f.completed && !isOverdue(f.dueDate) && !isDueToday(f.dueDate));
  const completedItems = followUps.filter(f => f.completed);

  const getDisplayedItems = () => {
    switch (followUpTab) {
      case 'overdue':
        return overdueItems;
      case 'due_today':
        return dueTodayItems;
      case 'upcoming':
        return upcomingItems;
      case 'completed':
        return completedItems;
    }
  };

  const handleConfirmComplete = () => {
    if (!completeModalItem) return;
    completeFollowUp(completeModalItem.id, outcomeNotes || 'Completed follow-up interaction.', scheduleNextDate || undefined);
    setCompleteModalItem(null);
    setOutcomeNotes('');
    setScheduleNextDate('');
  };

  // BD Performance Stats for current user
  const userActivities = activities.filter(a => a.userId === currentUser.id);
  const userCalls = userActivities.filter(a => a.type === 'call' || a.type === 'whatsapp').length;
  const userMeetings = userActivities.filter(a => a.type === 'discovery_meeting' || a.type === 'meeting').length;
  const userProposals = userActivities.filter(a => a.type === 'proposal_submission').length;
  const userDealsWon = deals.filter(d => d.ownerId === currentUser.id && d.stageId === 'closed_won');
  const userRevenue = userDealsWon.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">BD & Follow-up Workspace</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
              Commercial Cadence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage daily client outreach, telephone discovery calls, and milestone follow-ups
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenNewInquiry}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            + Create New Lead
          </button>
          <button
            onClick={onOpenLogActivity}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Log Call / Activity</span>
          </button>
        </div>
      </div>

      {/* BD Performance Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">Outreach Calls & Chats</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{userCalls}</span>
          <span className="text-[10px] text-slate-400">Phone & WhatsApp logged</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">Discovery Sessions</span>
          <span className="text-xl font-extrabold text-purple-700 mt-1 block">{userMeetings}</span>
          <span className="text-[10px] text-slate-400">Executive meetings</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">Proposals Presented</span>
          <span className="text-xl font-extrabold text-amber-700 mt-1 block">{userProposals}</span>
          <span className="text-[10px] text-slate-400">Formal decks submitted</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">Deals Won</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{userDealsWon.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold font-mono">
            {formatCurrency(userRevenue)}
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">Follow-up Adherence</span>
          <span className="text-xl font-extrabold text-blue-700 mt-1 block">94%</span>
          <span className="text-[10px] text-slate-400">{completedItems.length} completed</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Follow-up Workspace */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {/* Subtabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex space-x-2 text-xs font-semibold">
              <button
                onClick={() => setFollowUpTab('due_today')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                  followUpTab === 'due_today'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Due Today</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{dueTodayItems.length}</span>
              </button>

              <button
                onClick={() => setFollowUpTab('overdue')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                  followUpTab === 'overdue'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span>Overdue Alert</span>
                <span className="bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {overdueItems.length}
                </span>
              </button>

              <button
                onClick={() => setFollowUpTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                  followUpTab === 'upcoming'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Upcoming</span>
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">{upcomingItems.length}</span>
              </button>

              <button
                onClick={() => setFollowUpTab('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                  followUpTab === 'completed'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Completed</span>
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">{completedItems.length}</span>
              </button>
            </div>
          </div>

          {/* List of items */}
          <div className="space-y-3 min-h-[350px]">
            {getDisplayedItems().length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                No follow-ups in this queue. You're completely up to date!
              </div>
            ) : (
              getDisplayedItems().map(item => {
                const overdue = !item.completed && isOverdue(item.dueDate);
                const assigned = users.find(u => u.id === item.assignedUserId);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      overdue
                        ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                        : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{item.title}</span>
                        {overdue && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300 flex items-center space-x-1">
                            <AlertCircle size={10} />
                            <span>Overdue</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        Target: <span className="font-semibold text-slate-800">{item.businessName}</span> ({item.targetName})
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span>Due: {formatDateTime(item.dueDate)} ({formatRelativeTime(item.dueDate)})</span>
                        {assigned && <span>• Assigned: {assigned.name}</span>}
                      </div>
                    </div>

                    {!item.completed && (
                      <button
                        onClick={() => setCompleteModalItem(item)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold self-start sm:self-auto shrink-0 shadow-xs"
                      >
                        Record Outcome & Complete
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 col): Recent Activity Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-800">Live Outreach Logs</h3>
            <span className="text-[10px] font-mono text-slate-400">All Representatives</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activities.map(act => (
              <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{act.summary}</span>
                  <span className="text-[10px] text-slate-400">{formatRelativeTime(act.date)}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{act.outcome}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-400">
                  <span className="font-medium text-emerald-800">• {act.userName}</span>
                  <span className="text-slate-500">{act.relatedTitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPLETE FOLLOW-UP MODAL */}
      {completeModalItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-floating space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-base text-slate-800">Complete Follow-up</h3>
              <button onClick={() => setCompleteModalItem(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Target:</span>
              <span className="font-bold text-slate-800">{completeModalItem.title}</span>
              <p className="text-slate-600 mt-0.5">{completeModalItem.businessName} ({completeModalItem.targetName})</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Outcome & Client Response *</label>
              <textarea
                value={outcomeNotes}
                onChange={e => setOutcomeNotes(e.target.value)}
                placeholder="What did the client state? What is the agreed next step?"
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Schedule Next Follow-up (Optional)</label>
              <input
                type="datetime-local"
                value={scheduleNextDate}
                onChange={e => setScheduleNextDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCompleteModalItem(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-4 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
