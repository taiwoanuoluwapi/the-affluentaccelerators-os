import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { InquiriesList } from './components/inquiries/InquiriesList';
import { InquiryDetailModal } from './components/inquiries/InquiryDetailModal';
import { NewInquiryModal } from './components/inquiries/NewInquiryModal';
import { ContactsList } from './components/contacts/ContactsList';
import { ContactDetailModal } from './components/contacts/ContactDetailModal';
import { NewContactModal } from './components/contacts/NewContactModal';
import { PipelineBoard } from './components/pipeline/PipelineBoard';
import { DealDetailModal } from './components/pipeline/DealDetailModal';
import { NewDealModal } from './components/pipeline/NewDealModal';
import { ActivitiesWorkspace } from './components/activities/ActivitiesWorkspace';
import { LogActivityModal } from './components/activities/LogActivityModal';
import { ProjectsList } from './components/projects/ProjectsList';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { NewProjectModal } from './components/projects/NewProjectModal';
import { TeamDirectory } from './components/team/TeamDirectory';
import { ReportsView } from './components/reports/ReportsView';
import { DocumentsView } from './components/documents/DocumentsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { GoogleIntegrationModal } from './components/google/GoogleIntegrationModal';
import { GlobalSearchResults } from './components/common/GlobalSearchResults';
import { AuthView } from './components/auth/AuthView';
import { UserProfileModal } from './components/auth/UserProfileModal';

export const App: React.FC = () => {
  const { inquiries, deals, isAuthenticated } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal IDs
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // New Creation Modals
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [dealForProject, setDealForProject] = useState<any>(null);

  // Follow-up modal helper
  const handleScheduleFollowUpFromInquiry = (targetName: string, relatedId: string) => {
    setSelectedInquiryId(null);
    setIsLogActivityOpen(true);
  };

  const handleConvertInquiryToDeal = (inquiryId: string) => {
    setSelectedInquiryId(null);
    setIsNewDealOpen(true);
  };

  const handlePromptCreateProject = (deal: any) => {
    setDealForProject(deal);
    setIsNewProjectOpen(true);
  };

  // If not authenticated, show full screen Staff Sign In / Sign Up view
  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] font-sans">
      {/* Responsive Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar with Mobile Hamburger & Profile Access */}
        <TopNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
          onOpenNewDeal={() => setIsNewDealOpen(true)}
          onOpenNewContact={() => setIsNewContactOpen(true)}
          onOpenLogActivity={() => setIsLogActivityOpen(true)}
          onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="max-w-7xl mx-auto pb-20 md:pb-12">
            {currentTab === 'overview' && (
              <ExecutiveDashboard
                onSelectInquiry={id => setSelectedInquiryId(id)}
                onSelectDeal={id => setSelectedDealId(id)}
                onSelectProject={id => setSelectedProjectId(id)}
                setCurrentTab={setCurrentTab}
              />
            )}

            {currentTab === 'inquiries' && (
              <InquiriesList
                onSelectInquiry={id => setSelectedInquiryId(id)}
                onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
                onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
              />
            )}

            {currentTab === 'contacts' && (
              <ContactsList
                onSelectContact={id => setSelectedContactId(id)}
                onOpenNewContact={() => setIsNewContactOpen(true)}
              />
            )}

            {currentTab === 'pipeline' && (
              <PipelineBoard
                onSelectDeal={id => setSelectedDealId(id)}
                onOpenNewDeal={() => setIsNewDealOpen(true)}
                onPromptCreateProject={handlePromptCreateProject}
              />
            )}

            {currentTab === 'activities' && (
              <ActivitiesWorkspace
                onOpenLogActivity={() => setIsLogActivityOpen(true)}
                onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
              />
            )}

            {currentTab === 'projects' && (
              <ProjectsList
                onSelectProject={id => setSelectedProjectId(id)}
                onOpenNewProject={() => {
                  setDealForProject(null);
                  setIsNewProjectOpen(true);
                }}
              />
            )}

            {currentTab === 'team' && <TeamDirectory />}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'documents' && <DocumentsView />}

            {currentTab === 'notifications' && (
              <NotificationsView
                onSelectInquiry={id => setSelectedInquiryId(id)}
                onSelectDeal={id => setSelectedDealId(id)}
                onSelectProject={id => setSelectedProjectId(id)}
                setCurrentTab={setCurrentTab}
              />
            )}

            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone Users) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Global Search Results Overlay */}
      <GlobalSearchResults
        onSelectInquiry={id => setSelectedInquiryId(id)}
        onSelectContact={id => setSelectedContactId(id)}
        onSelectDeal={id => setSelectedDealId(id)}
        onSelectProject={id => setSelectedProjectId(id)}
        setCurrentTab={setCurrentTab}
      />

      {/* Detail Slide-outs & Modals */}
      <InquiryDetailModal
        inquiryId={selectedInquiryId}
        onClose={() => setSelectedInquiryId(null)}
        onConvertToDeal={handleConvertInquiryToDeal}
        onScheduleFollowUp={handleScheduleFollowUpFromInquiry}
      />

      <ContactDetailModal
        contactId={selectedContactId}
        onClose={() => setSelectedContactId(null)}
        onOpenNewDeal={() => setIsNewDealOpen(true)}
        onLogActivity={() => setIsLogActivityOpen(true)}
      />

      <DealDetailModal
        dealId={selectedDealId}
        onClose={() => setSelectedDealId(null)}
        onPromptCreateProject={handlePromptCreateProject}
      />

      <ProjectDetailModal
        projectId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />

      {/* Create Modals */}
      <NewInquiryModal
        isOpen={isNewInquiryOpen}
        onClose={() => setIsNewInquiryOpen(false)}
      />

      <NewDealModal
        isOpen={isNewDealOpen}
        onClose={() => setIsNewDealOpen(false)}
      />

      <NewContactModal
        isOpen={isNewContactOpen}
        onClose={() => setIsNewContactOpen(false)}
      />

      <LogActivityModal
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => {
          setIsNewProjectOpen(false);
          setDealForProject(null);
        }}
        defaultDeal={dealForProject}
      />

      <GoogleIntegrationModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

      {/* User Profile & Security Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
