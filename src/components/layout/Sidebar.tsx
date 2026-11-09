import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Users2,
  GitBranch,
  CalendarCheck,
  Briefcase,
  UserCheck,
  BarChart3,
  FolderLock,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed
}) => {
  const { currentUser, inquiries, followUps, notifications } = useApp();

  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;
  const overdueFollowUpsCount = followUps.filter(f => !f.completed && new Date(f.dueDate).getTime() < Date.now()).length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // RBAC for navigation items
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'bd_manager', 'sales_rep', 'consultant', 'intern']
    },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: Inbox,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
      badgeColor: 'bg-emerald-600 text-white',
      roles: ['super_admin', 'admin', 'bd_manager', 'sales_rep']
    },
    {
      id: 'contacts',
      label: 'CRM / Contacts',
      icon: Users2,
      roles: ['super_admin', 'admin', 'bd_manager', 'sales_rep', 'consultant']
    },
    {
      id: 'pipeline',
      label: 'Sales Pipeline',
      icon: GitBranch,
      roles: ['super_admin', 'admin', 'bd_manager', 'sales_rep']
    },
    {
      id: 'activities',
      label: 'Activities & Follow-ups',
      icon: CalendarCheck,
      badge: overdueFollowUpsCount > 0 ? overdueFollowUpsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      roles: ['super_admin', 'admin', 'bd_manager', 'sales_rep']
    },
    {
      id: 'projects',
      label: 'Consulting Projects',
      icon: Briefcase,
      roles: ['super_admin', 'admin', 'bd_manager', 'consultant', 'intern']
    },
    {
      id: 'team',
      label: 'Team & Assignments',
      icon: UserCheck,
      roles: ['super_admin', 'admin', 'consultant']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['super_admin', 'admin', 'bd_manager']
    },
    {
      id: 'documents',
      label: 'Documents Vault',
      icon: FolderLock,
      roles: ['super_admin', 'admin', 'bd_manager', 'sales_rep', 'consultant', 'intern']
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      roles: ['super_admin', 'admin', 'bd_manager', 'sales_rep', 'consultant', 'intern']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['super_admin', 'admin']
    }
  ];

  const allowedNav = navItems.filter(item => item.roles.includes(currentUser.role));

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Founder & Super Admin', color: 'bg-emerald-900 text-emerald-100 border border-emerald-700' };
      case 'admin':
        return { label: 'Operations Admin', color: 'bg-indigo-900 text-indigo-100 border border-indigo-700' };
      case 'bd_manager':
        return { label: 'BD Manager', color: 'bg-amber-900 text-amber-100 border border-amber-700' };
      case 'sales_rep':
        return { label: 'Sales Rep', color: 'bg-blue-900 text-blue-100 border border-blue-700' };
      case 'consultant':
        return { label: 'Consultant / Analyst', color: 'bg-purple-900 text-purple-100 border border-purple-700' };
      case 'intern':
        return { label: 'Fellow / Intern', color: 'bg-slate-800 text-slate-200 border border-slate-700' };
    }
  };

  const badgeInfo = getRoleBadge(currentUser.role);

  return (
    <aside
      className={`relative flex flex-col bg-[#064e3b] text-slate-100 border-r border-[#047857]/40 transition-all duration-300 z-30 select-none shadow-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-800/60 bg-[#043e2f]">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-300/40 shrink-0">
            <span className="text-white font-extrabold text-xl tracking-wider font-mono">AO</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">Affluent<span className="text-amber-400">OS</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-200 border border-emerald-700">v2.6</span>
              </div>
              <span className="text-[10px] text-emerald-200/70 truncate font-medium">The Affluentaccelerators</span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Sync Status Mini Pill */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center space-x-1 text-emerald-200 text-[11px]">
              <FileSpreadsheet size={13} className="text-emerald-400" />
              <span>Sheets Live Sync</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">Active</span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-emerald-800">
        <div className={`px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/60 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Main Menu'}
        </div>
        {allowedNav.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all group ${
                isActive
                  ? 'bg-emerald-700/80 text-white font-semibold shadow-sm border border-emerald-500/40'
                  : 'text-emerald-100/80 hover:bg-emerald-800/50 hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={19}
                className={`shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-amber-400' : 'text-emerald-300/80'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate text-[13.5px]">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor} shrink-0`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-emerald-800/60 bg-[#043e2f]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/80 shrink-0 shadow-md"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-sm text-white truncate">{currentUser.name}</span>
                {currentUser.role === 'super_admin' && (
                  <span title="Super Admin / Founder">
                    <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/80 truncate">{currentUser.title}</p>
              <div className="mt-1">
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeInfo.color}`}>
                  {badgeInfo.label}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
