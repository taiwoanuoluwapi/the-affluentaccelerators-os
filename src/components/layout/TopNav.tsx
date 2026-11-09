import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  Bell,
  Plus,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/formatters';

interface TopNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewInquiry: () => void;
  onOpenNewDeal: () => void;
  onOpenNewContact: () => void;
  onOpenLogActivity: () => void;
  onOpenGoogleModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewInquiry,
  onOpenNewDeal,
  onOpenNewContact,
  onOpenLogActivity,
  onOpenGoogleModal
}) => {
  const {
    currentUser,
    users,
    switchUser,
    googleSettings,
    triggerGoogleSync,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    globalSearchQuery,
    setGlobalSearchQuery,
    resetToInitialData
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncMessage('Connecting to Google Sheets & Drive...');
    try {
      const res = await triggerGoogleSync();
      setSyncMessage(res.count > 0 ? `Synced! 1 new lead imported.` : `Synced! Database up to date.`);
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setSyncMessage('Sync encountered an issue.');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Executive & Operations Dashboard';
      case 'inquiries':
        return 'Inquiry Management System';
      case 'contacts':
        return 'CRM & Organisation Directory';
      case 'pipeline':
        return 'Sales Pipeline & Deals';
      case 'activities':
        return 'Business Development & Follow-up Workspace';
      case 'projects':
        return 'Consulting Engagements & Projects';
      case 'team':
        return 'Consultant Directory & Workload Distribution';
      case 'reports':
        return 'Business Intelligence & Executive Analytics';
      case 'documents':
        return 'Google Drive & Document Vault';
      case 'notifications':
        return 'Notification Center';
      case 'settings':
        return 'Platform Settings & Governance';
      default:
        return 'AffluentOS';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shadow-xs">
      {/* Left: View title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <span>{getPageTitle(currentTab)}</span>
        </h1>
        <div className="hidden lg:flex items-center text-xs text-slate-400 space-x-1.5 font-medium">
          <span>•</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            Affluentaccelerators Internal
          </span>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={e => setGlobalSearchQuery(e.target.value)}
            placeholder="Search inquiries, contacts, deals, projects, team..."
            className="w-full pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-mono"
            >
              ESC
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Google Sheets Live Sync Pill */}
        <div className="relative">
          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isSyncing
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
            }`}
            title="Synchronise latest entries from Google Sheets and Google Drive"
          >
            <RefreshCw
              size={13}
              className={`text-emerald-600 ${isSyncing ? 'animate-spin text-amber-600' : ''}`}
            />
            <span className="hidden sm:inline font-semibold">Google Sheets</span>
            <span className="hidden md:inline text-slate-500 font-normal">
              {syncMessage || (isSyncing ? 'Syncing...' : formatRelativeTime(googleSettings.lastSyncedAt))}
            </span>
          </button>
        </div>

        {/* Quick New Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNewDropdownOpen(!newDropdownOpen)}
            className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Record</span>
            <ChevronDown size={13} className="opacity-80" />
          </button>

          {newDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-floating border border-slate-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setNewDropdownOpen(false)}
            >
              <button
                onClick={onOpenNewInquiry}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>New Inquiry / Lead</span>
              </button>
              <button
                onClick={onOpenNewDeal}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>New Sales Deal</span>
              </button>
              <button
                onClick={onOpenLogActivity}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Log BD Activity / Call</span>
              </button>
              <button
                onClick={onOpenNewContact}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Add Contact / Client</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={onOpenGoogleModal}
                className="w-full text-left px-3.5 py-2 text-slate-600 hover:bg-slate-50 flex items-center space-x-2.5 text-xs"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Google Integration Setup</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-floating border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">In-App Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-emerald-700 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.type === 'inquiry') setCurrentTab('inquiries');
                      if (n.type === 'deal') setCurrentTab('pipeline');
                      if (n.type === 'project') setCurrentTab('projects');
                      if (n.type === 'followup') setCurrentTab('activities');
                      setNotifDropdownOpen(false);
                    }}
                    className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                      !n.read ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-800 mb-0.5">
                      <span className="font-semibold truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-snug line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setCurrentTab('notifications');
                    setNotifDropdownOpen(false);
                  }}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown (Super Admin RBAC Simulation) */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
            title="Switch User Role Persona"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-emerald-600"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-700 font-medium leading-tight">{currentUser.role.replace('_', ' ')}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-floating border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Shield size={13} className="text-emerald-700" />
                  <span>Switch Team Role (RBAC)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Test and inspect the platform from any team member perspective:
                </p>
              </div>

              <div className="py-1 max-h-64 overflow-y-auto">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-slate-50 transition-colors ${
                      u.id === currentUser.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate">{u.name}</span>
                        {u.id === currentUser.id && <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{u.title}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-2 px-3 pb-1">
                <button
                  onClick={() => {
                    if (confirm('Reset AffluentOS to clean initial operational dataset?')) {
                      resetToInitialData();
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset Demo Operational Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
