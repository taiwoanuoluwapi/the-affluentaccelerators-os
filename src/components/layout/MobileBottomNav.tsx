import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  CalendarCheck,
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab
}) => {
  const { inquiries, followUps, setMobileSidebarOpen } = useApp();

  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;
  const overdueFollowUpsCount = followUps.filter(
    f => !f.completed && new Date(f.dueDate).getTime() < Date.now()
  ).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#064e3b] text-white border-t border-emerald-800/80 px-2 py-1.5 z-30 flex items-center justify-around shadow-2xl safe-area-pb">
      {/* Overview */}
      <button
        onClick={() => setCurrentTab('overview')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
          currentTab === 'overview'
            ? 'text-amber-400 font-bold'
            : 'text-emerald-200/70 hover:text-white'
        }`}
      >
        <LayoutDashboard size={18} />
        <span className="text-[10px] mt-0.5">Overview</span>
      </button>

      {/* Inquiries */}
      <button
        onClick={() => setCurrentTab('inquiries')}
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
          currentTab === 'inquiries'
            ? 'text-amber-400 font-bold'
            : 'text-emerald-200/70 hover:text-white'
        }`}
      >
        <Inbox size={18} />
        {newInquiriesCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
            {newInquiriesCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Inquiries</span>
      </button>

      {/* Sales Pipeline */}
      <button
        onClick={() => setCurrentTab('pipeline')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
          currentTab === 'pipeline'
            ? 'text-amber-400 font-bold'
            : 'text-emerald-200/70 hover:text-white'
        }`}
      >
        <GitBranch size={18} />
        <span className="text-[10px] mt-0.5">Deals</span>
      </button>

      {/* Follow-ups */}
      <button
        onClick={() => setCurrentTab('activities')}
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
          currentTab === 'activities'
            ? 'text-amber-400 font-bold'
            : 'text-emerald-200/70 hover:text-white'
        }`}
      >
        <CalendarCheck size={18} />
        {overdueFollowUpsCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {overdueFollowUpsCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Follow-ups</span>
      </button>

      {/* All Menus Drawer */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-emerald-200/70 hover:text-white transition-all"
      >
        <Menu size={18} />
        <span className="text-[10px] mt-0.5">Menu</span>
      </button>
    </nav>
  );
};
