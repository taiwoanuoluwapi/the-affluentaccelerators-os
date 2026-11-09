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
  RotateCcw,
  Menu,
  User,
  LogOut
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
  onOpenProfileModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewInquiry,
  onOpenNewDeal,
  onOpenNewContact,
  onOpenLogActivity,
  onOpenGoogleModal,
  onOpenProfileModal
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
    resetToInitialData,
    setMobileSidebarOpen,
    logout
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing...');
    try {
      const res = await triggerGoogleSync();
      setSyncMessage(res.count > 0 ? `+${res.count} Lead` : `Up to date`);
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setSyncMessage('Error');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Overview';
      case 'inquiries':
        return 'Inquiries';
      case 'contacts':
        return 'CRM & Contacts';
      case 'pipeline':
        return 'Sales Pipeline';
      case 'activities':
        return 'BD Workspace';
      case 'projects':
        return 'Consulting Projects';
      case 'team':
        return 'Team Directory';
      case 'reports':
        return 'Analytics & BI';
      case 'documents':
        return 'Documents Vault';
      case 'notifications':
        return 'Notifications';
      case 'settings':
        return 'Settings & Governance';
      default:
        return 'AffluentOS';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between z-20 shadow-xs shrink-0">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">
            {getPageTitle(currentTab)}
          </h1>
        </div>

        <div className="hidden xl:flex items-center text-xs text-slate-400 space-x-1.5 font-medium shrink-0">
          <span>•</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium text-[11px]">
            The Affluentaccelerators
          </span>
        </div>
      </div>

      {/* Middle: Global Search (Desktop & Tablet) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-3 lg:mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={e => setGlobalSearchQuery(e.target.value)}
            placeholder="Search inquiries, contacts, deals..."
            className="w-full pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => {
            const query = prompt('Search AffluentOS (Inquiries, Contacts, Deals, Projects):');
            if (query) setGlobalSearchQuery(query);
          }}
          className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Google Sheets Live Sync Pill */}
        <button
          onClick={handleSyncClick}
          disabled={isSyncing}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isSyncing
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
          }`}
          title="Synchronise latest entries from Google Sheets & Drive"
        >
          <RefreshCw
            size={13}
            className={`text-emerald-600 ${isSyncing ? 'animate-spin text-amber-600' : ''}`}
          />
          <span className="hidden sm:inline font-semibold">Sheets</span>
          <span className="hidden lg:inline text-slate-500 font-normal text-[11px]">
            {syncMessage || formatRelativeTime(googleSettings.lastSyncedAt)}
          </span>
        </button>

        {/* Quick New Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNewDropdownOpen(!newDropdownOpen)}
            className="flex items-center space-x-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New</span>
            <ChevronDown size={12} className="opacity-80" />
          </button>

          {newDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-floating border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setNewDropdownOpen(false)}
            >
              <button
                onClick={onOpenNewInquiry}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>New Inquiry / Lead</span>
              </button>
              <button
                onClick={onOpenNewDeal}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>New Sales Deal</span>
              </button>
              <button
                onClick={onOpenLogActivity}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Log BD Activity / Call</span>
              </button>
              <button
                onClick={onOpenNewContact}
                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Add Contact / Client</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={onOpenGoogleModal}
                className="w-full text-left px-3.5 py-2 text-slate-600 hover:bg-slate-50 flex items-center space-x-2 text-[11px]"
              >
                <FileSpreadsheet size={13} className="text-emerald-600" />
                <span>Google Integration Setup</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-floating border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-emerald-700 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
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
                      <span className="font-semibold truncate text-[11px]">{n.title}</span>
                      <span className="text-[9px] text-slate-400 font-normal shrink-0">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug line-clamp-2">{n.message}</p>
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

        {/* User Role Switcher & Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
            title="User Profile & RBAC Role Switcher"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-emerald-600 shadow-2xs"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-700 font-medium leading-tight">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-floating border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900 block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">{currentUser.email}</span>
                <button
                  onClick={onOpenProfileModal}
                  className="mt-2 w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <User size={12} />
                  <span>Manage Profile & Security</span>
                </button>
              </div>

              <div className="px-4 py-1.5 border-b border-slate-100">
                <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Shield size={11} className="text-emerald-700" />
                  <span>Switch Team Persona (RBAC)</span>
                </div>
              </div>

              <div className="py-1 max-h-56 overflow-y-auto">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className={`w-full px-4 py-1.5 text-left flex items-center space-x-2.5 hover:bg-slate-50 transition-colors ${
                      u.id === currentUser.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate">{u.name}</span>
                        {u.id === currentUser.id && <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{u.title}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-2 px-3 pb-1 space-y-1">
                <button
                  onClick={() => {
                    if (confirm('Reset AffluentOS to clean initial operational dataset?')) {
                      resetToInitialData();
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset Demo Data</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
