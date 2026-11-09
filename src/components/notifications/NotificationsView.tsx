import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, Clock, Inbox, GitBranch, Briefcase, Filter } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';

interface NotificationsViewProps {
  onSelectInquiry: (id: string) => void;
  onSelectDeal: (id: string) => void;
  onSelectProject: (id: string) => void;
  setCurrentTab: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectInquiry,
  onSelectDeal,
  onSelectProject,
  setCurrentTab
}) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter(
    n => filterType === 'all' || n.type === filterType
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClickNotif = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.type === 'inquiry' && notif.linkTarget) {
      onSelectInquiry(notif.linkTarget);
      setCurrentTab('inquiries');
    } else if (notif.type === 'deal' && notif.linkTarget) {
      onSelectDeal(notif.linkTarget);
      setCurrentTab('pipeline');
    } else if (notif.type === 'project' && notif.linkTarget) {
      onSelectProject(notif.linkTarget);
      setCurrentTab('projects');
    } else if (notif.type === 'followup') {
      setCurrentTab('activities');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">In-App Notification Center</h2>
            {unreadCount > 0 && (
              <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational alerts, lead assignment notices, deal stage transitions, and follow-up reminders
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 text-xs font-semibold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('inquiry')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'inquiry' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inquiries
        </button>
        <button
          onClick={() => setFilterType('deal')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'deal' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Deals
        </button>
        <button
          onClick={() => setFilterType('followup')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'followup' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Follow-ups
        </button>
        <button
          onClick={() => setFilterType('project')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'project' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Projects
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => handleClickNotif(n)}
              className={`p-4 flex items-start space-x-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                !n.read ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  n.type === 'inquiry'
                    ? 'bg-emerald-600'
                    : n.type === 'deal'
                    ? 'bg-purple-600'
                    : n.type === 'project'
                    ? 'bg-blue-600'
                    : 'bg-amber-600'
                }`}
              >
                {n.type === 'inquiry' && <Inbox size={18} />}
                {n.type === 'deal' && <GitBranch size={18} />}
                {n.type === 'project' && <Briefcase size={18} />}
                {n.type === 'followup' && <Clock size={18} />}
                {n.type === 'system' && <Bell size={18} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs ${!n.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 self-center"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
