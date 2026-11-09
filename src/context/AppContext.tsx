import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Inquiry,
  Contact,
  Organisation,
  Deal,
  Activity,
  FollowUpItem,
  ConsultantProfile,
  Project,
  Notification,
  AuditLogEntry,
  SyncLog,
  GoogleIntegrationSettings,
  PipelineStageId
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PIPELINE_STAGES,
  INITIAL_INQUIRIES,
  INITIAL_CONTACTS,
  INITIAL_ORGANISATIONS,
  INITIAL_DEALS,
  INITIAL_ACTIVITIES,
  INITIAL_FOLLOW_UPS,
  INITIAL_CONSULTANTS,
  INITIAL_PROJECTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYNC_LOGS,
  INITIAL_GOOGLE_SETTINGS
} from '../data/initialData';
import { isOverdue, isDueToday } from '../utils/formatters';

interface AppContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  users: User[];
  
  // Inquiries
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'referenceNo' | 'submittedAt'>) => Inquiry;
  updateInquiry: (id: string, updates: Partial<Inquiry>) => void;
  assignInquiry: (id: string, assignment: { bdId?: string; repId?: string; consultantId?: string }) => void;
  convertInquiryToDeal: (inquiryId: string, dealData: Partial<Deal>) => Deal;

  // Contacts & Orgs
  contacts: Contact[];
  organisations: Organisation[];
  addContact: (contact: Omit<Contact, 'id' | 'firstContactDate' | 'lastInteractionDate'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  checkDuplicates: (email: string, phone: string, businessName: string) => Contact[];
  mergeContacts: (primaryId: string, duplicateId: string) => void;

  // Deals & Pipeline
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  updateDealStage: (id: string, newStage: PipelineStageId, lostReason?: string, lostNotes?: string) => void;

  // Activities & Follow-ups
  activities: Activity[];
  logActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  followUps: FollowUpItem[];
  addFollowUp: (followUp: Omit<FollowUpItem, 'id' | 'completed'>) => FollowUpItem;
  completeFollowUp: (id: string, outcomeSummary: string, nextFollowUpDate?: string) => void;

  // Projects & Tasks
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'reference' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addTaskToProject: (projectId: string, task: Omit<Project['tasks'][0], 'id'>) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: Project['tasks'][0]['status']) => void;

  // Consultants
  consultants: ConsultantProfile[];
  updateConsultantAvailability: (consultantId: string, status: 'available' | 'busy' | 'unavailable') => void;

  // Google Integration
  googleSettings: GoogleIntegrationSettings;
  updateGoogleSettings: (settings: Partial<GoogleIntegrationSettings>) => void;
  syncLogs: SyncLog[];
  triggerGoogleSync: () => Promise<{ success: boolean; count: number }>;
  importHistoricalInquiries: () => Promise<number>;

  // Notifications & Audit
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, entityType: AuditLogEntry['entityType'], entityId: string, details: string) => void;

  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Reset
  resetToInitialData: () => void;

  // Derived KPI metrics
  kpis: {
    totalInquiries: number;
    newInquiriesThisMonth: number;
    activeProspects: number;
    qualifiedLeads: number;
    activeOpportunities: number;
    totalClients: number;
    activeProjects: number;
    closedDealsWonCount: number;
    totalWonRevenue: number;
    outstandingFollowUpsCount: number;
    overdueFollowUpsCount: number;
    pipelineTotalValue: number;
    weightedPipelineValue: number;
    winRate: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'affluentos_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_current_user`) || 'usr_founder';
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inquiries`);
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [organisations, setOrganisations] = useState<Organisation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_organisations`);
    return saved ? JSON.parse(saved) : INITIAL_ORGANISATIONS;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deals`);
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_followups`);
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
  });

  const [consultants, setConsultants] = useState<ConsultantProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_consultants`);
    return saved ? JSON.parse(saved) : INITIAL_CONSULTANTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_synclogs`);
    return saved ? JSON.parse(saved) : INITIAL_SYNC_LOGS;
  });

  const [googleSettings, setGoogleSettings] = useState<GoogleIntegrationSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_googlesettings`);
    return saved ? JSON.parse(saved) : INITIAL_GOOGLE_SETTINGS;
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, currentUserId);
      localStorage.setItem(`${STORAGE_KEY}_inquiries`, JSON.stringify(inquiries));
      localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts));
      localStorage.setItem(`${STORAGE_KEY}_organisations`, JSON.stringify(organisations));
      localStorage.setItem(`${STORAGE_KEY}_deals`, JSON.stringify(deals));
      localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
      localStorage.setItem(`${STORAGE_KEY}_followups`, JSON.stringify(followUps));
      localStorage.setItem(`${STORAGE_KEY}_consultants`, JSON.stringify(consultants));
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_synclogs`, JSON.stringify(syncLogs));
      localStorage.setItem(`${STORAGE_KEY}_googlesettings`, JSON.stringify(googleSettings));
    } catch (e) {
      console.warn('Storage quota exceeded or error saving state', e);
    }
  }, [
    users,
    currentUserId,
    inquiries,
    contacts,
    organisations,
    deals,
    activities,
    followUps,
    consultants,
    projects,
    notifications,
    auditLogs,
    syncLogs,
    googleSettings
  ]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      addAuditLog('User Switched Session', 'User', userId, `Active role switched to ${found.name} (${found.role})`);
    }
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add inquiry
  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'referenceNo' | 'submittedAt'>): Inquiry => {
    const nextNum = inquiries.length + 38;
    const ref = `AA-INQ-2026-${String(nextNum).padStart(4, '0')}`;
    const newInq: Inquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}`,
      referenceNo: ref,
      submittedAt: new Date().toISOString(),
      supportingDocuments: inquiryData.supportingDocuments || []
    };
    setInquiries(prev => [newInq, ...prev]);

    addAuditLog('Inquiry Created', 'Inquiry', newInq.id, `Created inquiry ${ref} for ${newInq.businessName}`);

    // Create notification
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId: newInq.assignedBdId || 'usr_founder',
      title: 'New Inquiry Submitted',
      message: `${newInq.fullName} from ${newInq.businessName} submitted an inquiry for ${newInq.category}.`,
      type: 'inquiry',
      linkTarget: newInq.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newInq;
  };

  const updateInquiry = (id: string, updates: Partial<Inquiry>) => {
    setInquiries(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          return updated;
        }
        return item;
      })
    );
    addAuditLog('Inquiry Updated', 'Inquiry', id, `Updated inquiry fields: ${Object.keys(updates).join(', ')}`);
  };

  const assignInquiry = (
    id: string,
    assignment: { bdId?: string; repId?: string; consultantId?: string }
  ) => {
    const inq = inquiries.find(i => i.id === id);
    if (!inq) return;

    updateInquiry(id, {
      assignedBdId: assignment.bdId !== undefined ? assignment.bdId : inq.assignedBdId,
      assignedSalesRepId: assignment.repId !== undefined ? assignment.repId : inq.assignedSalesRepId,
      assignedConsultantId: assignment.consultantId !== undefined ? assignment.consultantId : inq.assignedConsultantId
    });

    const assignee = users.find(u => u.id === (assignment.bdId || assignment.repId || assignment.consultantId));
    if (assignee) {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          userId: assignee.id,
          title: 'Lead Assigned to You',
          message: `You were assigned to inquiry ${inq.referenceNo} (${inq.businessName}).`,
          type: 'inquiry',
          linkTarget: inq.id,
          read: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }
  };

  const convertInquiryToDeal = (inquiryId: string, dealData: Partial<Deal>): Deal => {
    const inq = inquiries.find(i => i.id === inquiryId);
    if (!inq) throw new Error('Inquiry not found');

    // Create or find contact
    let contact = contacts.find(c => c.email.toLowerCase() === inq.email.toLowerCase());
    if (!contact) {
      contact = addContact({
        fullName: inq.fullName,
        businessName: inq.businessName,
        email: inq.email,
        phone: inq.phone,
        whatsapp: inq.whatsapp,
        linkedin: inq.websiteUrl || '',
        location: inq.location,
        industry: inq.industry,
        contactType: 'qualified_lead',
        relationshipOwnerId: inq.assignedBdId || currentUser.id,
        source: inq.source,
        relationshipStatus: 'active',
        notes: `Converted from Inquiry ${inq.referenceNo}. ${inq.description}`
      });
    }

    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      title: dealData.title || `${inq.businessName} - ${inq.requestedService || inq.category}`,
      contactId: contact.id,
      businessName: inq.businessName,
      linkedInquiryId: inq.id,
      ownerId: dealData.ownerId || inq.assignedBdId || currentUser.id,
      supportingTeamIds: dealData.supportingTeamIds || (inq.assignedSalesRepId ? [inq.assignedSalesRepId] : []),
      serviceCategory: dealData.serviceCategory || inq.category,
      value: dealData.value || 10000000,
      currency: dealData.currency || 'NGN',
      stageId: dealData.stageId || 'qualified_opportunity',
      probability: dealData.probability || 55,
      expectedClosingDate: dealData.expectedClosingDate || new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
      nextAction: dealData.nextAction || 'Prepare comprehensive consulting proposal presentation.',
      internalNotes: inq.internalNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeals(prev => [newDeal, ...prev]);

    // Update inquiry status
    updateInquiry(inquiryId, {
      status: 'converted',
      conversionOutcome: `Converted to Deal: ${newDeal.title} (${newDeal.id})`
    });

    addAuditLog('Inquiry Converted', 'Deal', newDeal.id, `Converted inquiry ${inq.referenceNo} into deal ${newDeal.title}`);

    return newDeal;
  };

  // Contacts
  const addContact = (contactData: Omit<Contact, 'id' | 'firstContactDate' | 'lastInteractionDate'>): Contact => {
    const newCtc: Contact = {
      ...contactData,
      id: `ctc_${Date.now()}`,
      firstContactDate: new Date().toISOString(),
      lastInteractionDate: new Date().toISOString()
    };
    setContacts(prev => [newCtc, ...prev]);
    addAuditLog('Contact Created', 'Contact', newCtc.id, `Added contact ${newCtc.fullName} (${newCtc.businessName})`);
    return newCtc;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, lastInteractionDate: new Date().toISOString() } : c))
    );
    addAuditLog('Contact Updated', 'Contact', id, `Updated contact fields: ${Object.keys(updates).join(', ')}`);
  };

  const checkDuplicates = (email: string, phone: string, businessName: string): Contact[] => {
    return contacts.filter(c => {
      const emailMatch = email && c.email.toLowerCase() === email.toLowerCase().trim();
      const phoneMatch = phone && c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '');
      const nameMatch =
        businessName &&
        c.businessName.toLowerCase().trim() === businessName.toLowerCase().trim();
      return emailMatch || phoneMatch || nameMatch;
    });
  };

  const mergeContacts = (primaryId: string, duplicateId: string) => {
    const primary = contacts.find(c => c.id === primaryId);
    const duplicate = contacts.find(c => c.id === duplicateId);
    if (!primary || !duplicate) return;

    // Merge notes & reassign deals/activities
    const mergedNotes = `${primary.notes}\n\n[Merged from duplicate contact ${duplicate.fullName}]:\n${duplicate.notes}`;
    updateContact(primaryId, { notes: mergedNotes });

    // Reassign deals
    setDeals(prev => prev.map(d => (d.contactId === duplicateId ? { ...d, contactId: primaryId } : d)));

    // Reassign activities
    setActivities(prev =>
      prev.map(a => (a.relatedType === 'contact' && a.relatedId === duplicateId ? { ...a, relatedId: primaryId } : a))
    );

    // Remove duplicate contact
    setContacts(prev => prev.filter(c => c.id !== duplicateId));

    addAuditLog('Contacts Merged', 'Contact', primaryId, `Merged duplicate ${duplicate.fullName} into ${primary.fullName}`);
  };

  // Deals
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDeals(prev => [newDeal, ...prev]);
    addAuditLog('Deal Created', 'Deal', newDeal.id, `Created deal ${newDeal.title} worth ₦${newDeal.value.toLocaleString()}`);
    return newDeal;
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
    addAuditLog('Deal Updated', 'Deal', id, `Updated deal fields: ${Object.keys(updates).join(', ')}`);
  };

  const updateDealStage = (
    id: string,
    newStage: PipelineStageId,
    lostReason?: string,
    lostNotes?: string
  ) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;

    const updates: Partial<Deal> = {
      stageId: newStage,
      updatedAt: new Date().toISOString()
    };

    if (newStage === 'closed_won') {
      updates.probability = 100;
      updates.closedAt = new Date().toISOString();
      // Notify founder and team
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          userId: 'usr_founder',
          title: '🎉 DEAL WON: ' + deal.title,
          message: `${currentUser.name} closed ${deal.title} for ₦${deal.value.toLocaleString()}! Create the consulting project.`,
          type: 'deal',
          linkTarget: deal.id,
          read: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    } else if (newStage === 'closed_lost') {
      updates.probability = 0;
      updates.closedAt = new Date().toISOString();
      if (lostReason) updates.lostReason = lostReason as any;
      if (lostNotes) updates.lostNotes = lostNotes;
    } else {
      const stageObj = INITIAL_PIPELINE_STAGES.find(s => s.id === newStage);
      if (stageObj) updates.probability = stageObj.defaultProbability;
    }

    updateDeal(id, updates);
    addAuditLog('Deal Stage Changed', 'Deal', id, `Moved "${deal.title}" to ${newStage}`);
  };

  // Activities & Follow-ups
  const logActivity = (actData: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const newAct: Activity = {
      ...actData,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);

    // If next follow-up date given, create a follow up item automatically
    if (actData.nextFollowUpDate && actData.relatedType) {
      addFollowUp({
        title: actData.nextAction || `Follow-up on ${actData.relatedTitle}`,
        relatedType: actData.relatedType as any,
        relatedId: actData.relatedId,
        targetName: actData.relatedTitle,
        businessName: actData.relatedTitle,
        dueDate: actData.nextFollowUpDate,
        priority: 'high',
        assignedUserId: actData.userId,
        notes: actData.outcome
      });
    }

    addAuditLog('Activity Logged', 'Contact', actData.relatedId, `${actData.type.toUpperCase()}: ${actData.summary}`);
    return newAct;
  };

  const addFollowUp = (item: Omit<FollowUpItem, 'id' | 'completed'>): FollowUpItem => {
    const newItem: FollowUpItem = {
      ...item,
      id: `flw_${Date.now()}`,
      completed: false
    };
    setFollowUps(prev => [newItem, ...prev]);
    return newItem;
  };

  const completeFollowUp = (id: string, outcomeSummary: string, nextFollowUpDate?: string) => {
    const flw = followUps.find(f => f.id === id);
    if (!flw) return;

    setFollowUps(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: true, lastOutcome: outcomeSummary } : item))
    );

    // Record as activity
    logActivity({
      type: 'follow_up',
      relatedType: flw.relatedType,
      relatedId: flw.relatedId,
      relatedTitle: flw.targetName,
      date: new Date().toISOString(),
      summary: `Completed follow-up: ${flw.title}`,
      outcome: outcomeSummary,
      nextAction: nextFollowUpDate ? 'Scheduled follow-on interaction' : 'Follow-up cycle completed',
      nextFollowUpDate: nextFollowUpDate,
      userId: currentUser.id,
      userName: currentUser.name,
      completed: true
    });
  };

  // Projects & Tasks
  const addProject = (projectData: Omit<Project, 'id' | 'reference' | 'createdAt' | 'updatedAt'>): Project => {
    const nextRef = `AA-PRJ-2026-${String(projects.length + 13).padStart(4, '0')}`;
    const newPrj: Project = {
      ...projectData,
      id: `prj_${Date.now()}`,
      reference: nextRef,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [newPrj, ...prev]);

    // Notify lead consultant
    if (newPrj.leadConsultantId) {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          userId: newPrj.leadConsultantId,
          title: 'Assigned to New Engagement',
          message: `You were assigned as Lead Consultant for ${newPrj.name} (${newPrj.reference}).`,
          type: 'project',
          linkTarget: newPrj.id,
          read: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    addAuditLog('Project Created', 'Project', newPrj.id, `Created consulting project ${newPrj.name} (${newPrj.reference})`);
    return newPrj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    addAuditLog('Project Updated', 'Project', id, `Updated project fields: ${Object.keys(updates).join(', ')}`);
  };

  const addTaskToProject = (projectId: string, task: Omit<Project['tasks'][0], 'id'>) => {
    const newTask = { ...task, id: `tsk_${Date.now()}` };
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: [...p.tasks, newTask]
          };
        }
        return p;
      })
    );
    addAuditLog('Task Added', 'Task', newTask.id, `Added task "${newTask.title}" to project`);
  };

  const updateTaskStatus = (projectId: string, taskId: string, status: Project['tasks'][0]['status']) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const updatedTasks = p.tasks.map(t =>
            t.id === taskId
              ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : undefined }
              : t
          );
          // Recalculate project progress
          const doneCount = updatedTasks.filter(t => t.status === 'done').length;
          const progress = updatedTasks.length ? Math.round((doneCount / updatedTasks.length) * 100) : p.progressPercentage;

          return {
            ...p,
            tasks: updatedTasks,
            progressPercentage: progress
          };
        }
        return p;
      })
    );
  };

  // Consultants
  const updateConsultantAvailability = (consultantId: string, status: 'available' | 'busy' | 'unavailable') => {
    setConsultants(prev =>
      prev.map(c => (c.id === consultantId ? { ...c, availabilityStatus: status } : c))
    );
  };

  // Google Integration
  const updateGoogleSettings = (settings: Partial<GoogleIntegrationSettings>) => {
    setGoogleSettings(prev => ({ ...prev, ...settings }));
    addAuditLog('Settings Updated', 'Settings', 'google_integration', 'Updated Google Sheets / Drive sync configuration');
  };

  const triggerGoogleSync = async (): Promise<{ success: boolean; count: number }> => {
    // Simulate real server-side sync with Google Sheets & Drive
    await new Promise(resolve => setTimeout(resolve, 1400));

    const mockRow = {
      fullName: 'Dr. Tariq Al-Hassan',
      businessName: 'Sahara PetroChemicals & Lubricants Ltd',
      email: 'tariq@saharapetro.ng',
      phone: '+234 802 334 9911',
      whatsapp: '+234 802 334 9911',
      location: 'Warri & Lekki Free Zone',
      industry: 'Oil & Gas Downstream / Chemicals',
      websiteUrl: 'https://saharapetro.ng',
      description: 'Lubricant blending and petrochemical additive distribution plant.',
      stage: 'Mature Enterprise' as const,
      teamSize: '80+',
      businessModel: 'B2B' as const,
      annualRevenueRange: '₦1.5B+',
      currentChallenges: 'Foreign exchange supply chain bottlenecks, lubricant formulation QA certifications, and inventory loss.',
      businessObjectives: 'Execute operational plant audit and establish automated procurement ERP controls.',
      category: 'Business Audit Requests' as const,
      requestedService: 'Plant Operational Diagnostic & Quality Assurance Audit',
      descriptionOfSupport: 'Comprehensive assessment of blending plant operations and supply chain controls.',
      specificQuestions: 'Do you offer ISO certification consulting?',
      expectedOutcomes: 'Reduced chemical raw material waste by 12% and standardized blending protocols.',
      budgetRange: '₦18,000,000 - ₦24,000,000',
      preferredConsultationMethod: 'Hybrid' as const,
      source: 'Website' as const,
      status: 'new' as const,
      priority: 'urgent' as const,
      internalNotes: 'Freshly synced from Google Sheet (Row 46). Attached QA manual in Google Drive.',
      supportingDocuments: [
        {
          id: `doc_sync_${Date.now()}`,
          name: 'Sahara_Plant_Process_Flow_2026.pdf',
          type: 'application/pdf',
          size: '5.6 MB',
          driveFileId: 'drive_sahara_flow_pdf',
          driveUrl: 'https://drive.google.com/file/d/drive_sahara_flow_pdf/view',
          uploadDate: new Date().toISOString(),
          category: 'Diagnostic Report' as const
        }
      ]
    };

    // Check if already synced
    const exists = inquiries.some(i => i.email === mockRow.email);
    let count = 0;
    if (!exists) {
      addInquiry(mockRow);
      count = 1;
    }

    const newLog: SyncLog = {
      id: `slog_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Google Sheets',
      status: 'success',
      recordsImported: count,
      recordsSkipped: inquiries.length,
      message: count > 0 
        ? `Sync successful. Imported 1 new inquiry from "The Affluentaccelerators - Website Leads 2026" (Sahara PetroChemicals) & linked 1 Drive file.`
        : `Sync complete. All ${inquiries.length} spreadsheet records are up to date with AffluentOS. 0 new rows found.`,
      details: count > 0 ? `Row 46 mapped: Dr. Tariq Al-Hassan` : 'Spreadsheet checksum matches.'
    };
    setSyncLogs(prev => [newLog, ...prev]);

    updateGoogleSettings({ lastSyncedAt: new Date().toISOString() });

    return { success: true, count };
  };

  const importHistoricalInquiries = async (): Promise<number> => {
    // Simulate historical bulk import
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Add 2 realistic historical records
    const historical1 = {
      fullName: 'Aisha Danjuma',
      businessName: 'Savannah Agribusiness Cooperatives',
      email: 'aisha@savannahagro.ng',
      phone: '+234 809 444 3322',
      whatsapp: '+234 809 444 3322',
      location: 'Sokoto & Niger State',
      industry: 'Agriculture & Grain Farming',
      websiteUrl: 'https://savannahagro.ng',
      description: 'Grain outgrower cooperative federation representing 2,400 smallholder farmers.',
      stage: 'Growth' as const,
      teamSize: '30 full-time',
      businessModel: 'B2B' as const,
      annualRevenueRange: '₦300M - ₦600M',
      currentChallenges: 'Post-harvest grain loss and lack of structured aggregation warehouses.',
      businessObjectives: 'Build solar-powered storage silos and secure commercial off-take agreements.',
      category: 'Business Strategy Requests' as const,
      requestedService: 'Grain Aggregation Strategy & Commercial Offtake Architecture',
      descriptionOfSupport: 'Design of cooperative governance and off-taker contract structuring.',
      specificQuestions: 'Do you help identify large institutional buyers like Nestlé or Flour Mills?',
      expectedOutcomes: 'Contracted off-take for 5,000 metric tons of sorghum.',
      budgetRange: '₦12,000,000 - ₦16,000,000',
      preferredConsultationMethod: 'Hybrid' as const,
      source: 'Website' as const,
      status: 'under_review' as const,
      priority: 'high' as const,
      internalNotes: 'Historical website submission imported from Archive 2025-2026.',
      supportingDocuments: []
    };

    const exists = inquiries.some(i => i.email === historical1.email);
    let imported = 0;
    if (!exists) {
      addInquiry(historical1);
      imported = 1;
    }

    const log: SyncLog = {
      id: `slog_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Google Sheets',
      status: 'success',
      recordsImported: imported,
      recordsSkipped: inquiries.length,
      message: `Historical website inquiry batch synchronization completed. Processed archived rows from Google Sheets.`,
      details: `Imported ${imported} historical records.`
    };
    setSyncLogs(prev => [log, ...prev]);

    return imported;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Reset to initial
  const resetToInitialData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr_founder');
    setInquiries(INITIAL_INQUIRIES);
    setContacts(INITIAL_CONTACTS);
    setOrganisations(INITIAL_ORGANISATIONS);
    setDeals(INITIAL_DEALS);
    setActivities(INITIAL_ACTIVITIES);
    setFollowUps(INITIAL_FOLLOW_UPS);
    setConsultants(INITIAL_CONSULTANTS);
    setProjects(INITIAL_PROJECTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSyncLogs(INITIAL_SYNC_LOGS);
    setGoogleSettings(INITIAL_GOOGLE_SETTINGS);
  };

  // Derived KPI metrics
  const totalInquiries = inquiries.length;
  const newInquiriesThisMonth = inquiries.filter(i => {
    const d = new Date(i.submittedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const activeProspects = contacts.filter(c => c.contactType === 'prospect').length;
  const qualifiedLeads = inquiries.filter(i => i.status === 'qualified').length + contacts.filter(c => c.contactType === 'qualified_lead').length;
  const activeOpportunities = deals.filter(d => d.stageId !== 'closed_won' && d.stageId !== 'closed_lost').length;
  const totalClients = contacts.filter(c => c.contactType === 'active_client').length;
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning' || p.status === 'under_review').length;
  
  const wonDeals = deals.filter(d => d.stageId === 'closed_won');
  const closedDealsWonCount = wonDeals.length;
  const totalWonRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const outstandingFollowUpsCount = followUps.filter(f => !f.completed).length;
  const overdueFollowUpsCount = followUps.filter(f => !f.completed && isOverdue(f.dueDate)).length;

  const pipelineTotalValue = deals
    .filter(d => d.stageId !== 'closed_won' && d.stageId !== 'closed_lost')
    .reduce((sum, d) => sum + d.value, 0);

  const weightedPipelineValue = deals
    .filter(d => d.stageId !== 'closed_won' && d.stageId !== 'closed_lost')
    .reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);

  const totalFinishedDeals = deals.filter(d => d.stageId === 'closed_won' || d.stageId === 'closed_lost').length;
  const winRate = totalFinishedDeals > 0 ? Math.round((closedDealsWonCount / totalFinishedDeals) * 100) : 75;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        users,
        inquiries,
        addInquiry,
        updateInquiry,
        assignInquiry,
        convertInquiryToDeal,
        contacts,
        organisations,
        addContact,
        updateContact,
        checkDuplicates,
        mergeContacts,
        deals,
        addDeal,
        updateDeal,
        updateDealStage,
        activities,
        logActivity,
        followUps,
        addFollowUp,
        completeFollowUp,
        projects,
        addProject,
        updateProject,
        addTaskToProject,
        updateTaskStatus,
        consultants,
        updateConsultantAvailability,
        googleSettings,
        updateGoogleSettings,
        syncLogs,
        triggerGoogleSync,
        importHistoricalInquiries,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        addAuditLog,
        globalSearchQuery,
        setGlobalSearchQuery,
        resetToInitialData,
        kpis: {
          totalInquiries,
          newInquiriesThisMonth,
          activeProspects,
          qualifiedLeads,
          activeOpportunities,
          totalClients,
          activeProjects,
          closedDealsWonCount,
          totalWonRevenue,
          outstandingFollowUpsCount,
          overdueFollowUpsCount,
          pipelineTotalValue,
          weightedPipelineValue,
          winRate
        }
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
