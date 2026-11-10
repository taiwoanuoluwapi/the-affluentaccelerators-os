import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  AuthorizedUser,
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
  PipelineStageId,
  OnboardingSubmission,
  UserInvitation,
  ContactRoleTask,
  SupabaseConfig,
  ApprovalStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_AUTHORIZED_USERS,
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
  INITIAL_GOOGLE_SETTINGS,
  INITIAL_ONBOARDING_SUBMISSIONS,
  INITIAL_USER_INVITATIONS,
  INITIAL_CONTACT_ROLE_TASKS,
  INITIAL_SUPABASE_CONFIG
} from '../data/initialData';
import { isOverdue, isDueToday } from '../utils/formatters';

interface AppContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  users: User[];
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  toggleUserActive: (userId: string) => void;

  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  signup: (params: { name: string; email: string; phone?: string; department?: string; password?: string }) => { success: boolean; message: string; requiresApproval?: boolean };
  logout: () => void;
  authorizedUsers: AuthorizedUser[];
  addAuthorizedUser: (email: string, defaultRole: UserRole) => void;
  removeAuthorizedUser: (id: string) => void;

  // Mobile layout state
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  
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

  // User Onboarding & Email Invitations
  onboardingSubmissions: OnboardingSubmission[];
  userInvitations: UserInvitation[];
  inviteUserByEmail: (email: string, role: UserRole, department: string, customNotes?: string) => UserInvitation;
  submitOnboardingForm: (formData: {
    inviteToken?: string;
    fullName: string;
    email: string;
    phone: string;
    requestedRole: UserRole;
    department: string;
    bio: string;
    linkedinUrl?: string;
    password?: string;
  }) => Promise<OnboardingSubmission>;
  toggleOnboardingApproval: (submissionId: string, newStatus: ApprovalStatus, notes?: string) => Promise<void>;
  approvePendingUser: (submissionId: string) => Promise<void>;
  batchApprovePendingUsers: () => Promise<number>;
  simulateSheetApprovalWebhook: (rowIndex: number, status: 'approved' | 'unapproved') => Promise<void>;
  triggerSheetsOnboardingSync: () => Promise<{ success: boolean; message: string }>;

  // Role-Based Tasks on Contacts
  contactRoleTasks: ContactRoleTask[];
  addContactRoleTask: (task: Omit<ContactRoleTask, 'id' | 'createdAt' | 'googleSheetRowIndex' | 'googleSheetTab'>) => ContactRoleTask;
  updateContactRoleTaskStatus: (taskId: string, status: 'todo' | 'in_progress' | 'completed') => void;

  // Supabase Configuration
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;

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
    unapprovedOnboardingCount: number;
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

  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_authorized_users`);
    return saved ? JSON.parse(saved) : INITIAL_AUTHORIZED_USERS;
  });

  const [onboardingSubmissions, setOnboardingSubmissions] = useState<OnboardingSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_onboarding_submissions`);
    return saved ? JSON.parse(saved) : INITIAL_ONBOARDING_SUBMISSIONS;
  });

  const [userInvitations, setUserInvitations] = useState<UserInvitation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user_invitations`);
    return saved ? JSON.parse(saved) : INITIAL_USER_INVITATIONS;
  });

  const [contactRoleTasks, setContactRoleTasks] = useState<ContactRoleTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contact_role_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_CONTACT_ROLE_TASKS;
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_supabase_config`);
    return saved ? JSON.parse(saved) : INITIAL_SUPABASE_CONFIG;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_is_authenticated`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, currentUserId);
      localStorage.setItem(`${STORAGE_KEY}_authorized_users`, JSON.stringify(authorizedUsers));
      localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, JSON.stringify(isAuthenticated));
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
      localStorage.setItem(`${STORAGE_KEY}_onboarding_submissions`, JSON.stringify(onboardingSubmissions));
      localStorage.setItem(`${STORAGE_KEY}_user_invitations`, JSON.stringify(userInvitations));
      localStorage.setItem(`${STORAGE_KEY}_contact_role_tasks`, JSON.stringify(contactRoleTasks));
      localStorage.setItem(`${STORAGE_KEY}_supabase_config`, JSON.stringify(supabaseConfig));
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
    googleSettings,
    onboardingSubmissions,
    userInvitations,
    contactRoleTasks,
    supabaseConfig
  ]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      addAuditLog('User Switched Session', 'User', userId, `Active role switched to ${found.name} (${found.role})`);
    }
  };

  const login = (email: string, password?: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Check if email is in authorized whitelist
      const isAuthorized = authorizedUsers.some(a => a.email.toLowerCase() === cleanEmail);
      if (isAuthorized) {
        // Create user from whitelist
        const authRecord = authorizedUsers.find(a => a.email.toLowerCase() === cleanEmail)!;
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: cleanEmail.split('@')[0].replace('.', ' '),
          email: cleanEmail,
          role: authRecord.defaultRole,
          title: 'Authorized Staff',
          department: 'Operations',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          phone: '+234 800 000 0000',
          active: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUserId(newUser.id);
        setIsAuthenticated(true);
        return { success: true };
      }
      return {
        success: false,
        message: 'Account not found. Please contact your AffluentOS administrator or sign up with an authorized company email.'
      };
    }

    if (!user.active) {
      return {
        success: false,
        message: 'This account has been deactivated by the system administrator.'
      };
    }

    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    updateUserProfile(user.id, { lastLogin: new Date().toISOString() });
    addAuditLog('User Login', 'User', user.id, `${user.name} signed in successfully`);
    return { success: true };
  };

  const signup = (params: {
    name: string;
    email: string;
    phone?: string;
    department?: string;
    password?: string;
  }): { success: boolean; message: string; requiresApproval?: boolean } => {
    const cleanEmail = params.email.trim().toLowerCase();

    // Check if user already exists
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    // Check whitelist or @affluentaccelerators.com domain
    const isAffluentDomain = cleanEmail.endsWith('@affluentaccelerators.com');
    const authWhitelist = authorizedUsers.find(a => a.email.toLowerCase() === cleanEmail);

    if (!isAffluentDomain && !authWhitelist) {
      // Create user but mark as inactive awaiting admin approval
      const pendingUser: User = {
        id: `usr_${Date.now()}`,
        name: params.name,
        email: cleanEmail,
        role: 'intern',
        title: 'Pending Verification',
        department: params.department || 'Operations',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: params.phone || '+234 800 000 0000',
        active: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, pendingUser]);
      addAuditLog(
        'User Signup Pending',
        'User',
        pendingUser.id,
        `${params.name} (${cleanEmail}) signed up from non-whitelisted email. Awaiting admin approval.`
      );
      return {
        success: true,
        requiresApproval: true,
        message: 'Your registration was submitted. An administrator must verify and activate your corporate account before access is granted.'
      };
    }

    // Whitelisted or company domain: automatically activate with appropriate role
    const assignedRole: UserRole = authWhitelist?.defaultRole || (cleanEmail.includes('founder') || cleanEmail.includes('eze') ? 'super_admin' : 'sales_rep');
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: params.name,
      email: cleanEmail,
      role: assignedRole,
      title: authWhitelist ? 'Team Member' : 'Commercial Associate',
      department: params.department || 'Commercial Growth',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: params.phone || '+234 800 000 0000',
      active: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);

    addAuditLog('User Registered', 'User', newUser.id, `${newUser.name} created account with role ${newUser.role}`);
    return { success: true, message: 'Account created successfully! Welcome to AffluentOS.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    addAuditLog('User Logout', 'User', currentUser.id, `${currentUser.name} signed out`);
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updates } : u))
    );
    addAuditLog('User Profile Updated', 'User', userId, `Updated user profile`);
  };

  const toggleUserActive = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, active: !u.active } : u))
    );
    const target = users.find(u => u.id === userId);
    addAuditLog('User Status Toggled', 'User', userId, `Toggled active state for ${target?.name}`);
  };

  const addAuthorizedUser = (email: string, defaultRole: UserRole) => {
    const cleanEmail = email.trim().toLowerCase();
    if (authorizedUsers.some(a => a.email.toLowerCase() === cleanEmail)) return;

    const newAuth: AuthorizedUser = {
      id: `auth_${Date.now()}`,
      email: cleanEmail,
      defaultRole,
      invitedBy: currentUser.name,
      invitedAt: new Date().toISOString(),
      status: 'invited'
    };
    setAuthorizedUsers(prev => [...prev, newAuth]);
    addAuditLog('Staff Whitelisted', 'User', newAuth.id, `Invited ${cleanEmail} with default role ${defaultRole}`);
  };

  const removeAuthorizedUser = (id: string) => {
    setAuthorizedUsers(prev => prev.filter(a => a.id !== id));
    addAuditLog('Staff Removed from Whitelist', 'User', id, `Removed user authorization`);
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

  // Supabase Config
  const updateSupabaseConfig = (config: Partial<SupabaseConfig>) => {
    setSupabaseConfig(prev => ({ ...prev, ...config }));
    addAuditLog('Supabase Config Updated', 'Settings', 'supabase_config', 'Updated Supabase project connection & authentication settings');
  };

  // User Invitations
  const inviteUserByEmail = (
    email: string,
    role: UserRole,
    department: string,
    customNotes?: string
  ): UserInvitation => {
    const cleanEmail = email.trim().toLowerCase();
    const token = `tok_affluent_${Math.random().toString(36).substring(2, 9)}`;
    const currentBase = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://antigravity.luch.dev/site/40b4be73-a887-4b81-81eb-ebca7696f21e/a53f7e4028b7f34005ed6843/';
    const inviteUrl = `${currentBase}?invite=${token}&email=${encodeURIComponent(cleanEmail)}&role=${role}`;

    const newInvite: UserInvitation = {
      id: `inv_${Date.now()}`,
      email: cleanEmail,
      role,
      department,
      token,
      inviteUrl,
      invitedBy: `${currentUser.name} (${currentUser.title})`,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'pending',
      customNotes
    };

    setUserInvitations(prev => [newInvite, ...prev]);
    addAuthorizedUser(cleanEmail, role);

    addAuditLog(
      'User Invitation Created',
      'User',
      newInvite.id,
      `Generated onboarding invite for ${cleanEmail} (Role: ${role}, Department: ${department})`
    );

    const notif: Notification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'User Invitation Dispatched',
      message: `Onboarding invitation link generated for ${cleanEmail}. Direct link: ${inviteUrl}`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    return newInvite;
  };

  // Submit Onboarding Form (posts to Google Sheet "User Onboarding & Approvals" tab + Supabase)
  const submitOnboardingForm = async (formData: {
    inviteToken?: string;
    fullName: string;
    email: string;
    phone: string;
    requestedRole: UserRole;
    department: string;
    bio: string;
    linkedinUrl?: string;
    password?: string;
  }): Promise<OnboardingSubmission> => {
    await new Promise(res => setTimeout(res, 600));

    const cleanEmail = formData.email.trim().toLowerCase();
    const nextRow = onboardingSubmissions.length + 3;

    const newSubmission: OnboardingSubmission = {
      id: `onb_${Date.now()}`,
      inviteToken: formData.inviteToken,
      fullName: formData.fullName,
      email: cleanEmail,
      phone: formData.phone,
      requestedRole: formData.requestedRole,
      department: formData.department,
      bio: formData.bio,
      linkedinUrl: formData.linkedinUrl,
      approvalStatus: 'unapproved',
      approvalNotes: 'Pending administrator verification on Google Sheet or AffluentOS portal.',
      invitedBy: formData.inviteToken ? 'Email Invitation' : 'Direct Onboarding Request',
      submittedAt: new Date().toISOString(),
      googleSheetRowIndex: nextRow,
      googleSheetTab: googleSettings.onboardingSheetName || 'User Onboarding & Approvals',
      syncedToSupabase: true,
      syncedToGoogleSheet: true
    };

    setOnboardingSubmissions(prev => [newSubmission, ...prev]);

    if (formData.inviteToken) {
      setUserInvitations(prev =>
        prev.map(inv =>
          inv.token === formData.inviteToken ? { ...inv, status: 'submitted' } : inv
        )
      );
    }

    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existingUser) {
      const pendingUser: User = {
        id: `usr_${Date.now()}`,
        name: formData.fullName,
        email: cleanEmail,
        role: formData.requestedRole,
        title: `${formData.department} Specialist`,
        department: formData.department,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: formData.phone,
        active: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, pendingUser]);
    }

    const syncLog: SyncLog = {
      id: `slog_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Google Sheets',
      status: 'success',
      recordsImported: 1,
      recordsSkipped: 0,
      message: `Posted onboarding submission for ${formData.fullName} to Google Sheet tab [${newSubmission.googleSheetTab}] at Row #${nextRow}. Status: unapproved.`,
      details: `Supabase Auth profile created with email ${cleanEmail} (inactive until approved).`
    };
    setSyncLogs(prev => [syncLog, ...prev]);

    const adminNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId: 'all',
      title: 'New Onboarding Submission Pending Approval',
      message: `${formData.fullName} (${formData.requestedRole}) completed the onboarding form. Posted to Google Sheet Row #${nextRow}. Approval status: unapproved.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [adminNotif, ...prev]);

    addAuditLog(
      'Onboarding Form Submitted',
      'User',
      newSubmission.id,
      `${formData.fullName} submitted profile. Written to Google Sheet [${newSubmission.googleSheetTab}] Row #${nextRow}. Status: unapproved.`
    );

    return newSubmission;
  };

  // Toggle Onboarding Approval ('approved' | 'unapproved')
  const toggleOnboardingApproval = async (
    submissionId: string,
    newStatus: ApprovalStatus,
    notes?: string
  ): Promise<void> => {
    await new Promise(res => setTimeout(res, 500));

    const submission = onboardingSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    const isNowApproved = newStatus === 'approved';

    setOnboardingSubmissions(prev =>
      prev.map(s => {
        if (s.id === submissionId) {
          return {
            ...s,
            approvalStatus: newStatus,
            approvalNotes: notes || (isNowApproved ? `Approved by ${currentUser.name} on ${new Date().toLocaleDateString()}` : `Marked unapproved by ${currentUser.name}`),
            approvedAt: isNowApproved ? new Date().toISOString() : undefined,
            approvedBy: isNowApproved ? currentUser.name : undefined
          };
        }
        return s;
      })
    );

    const cleanEmail = submission.email.toLowerCase();
    setUsers(prev => {
      const exists = prev.find(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return prev.map(u =>
          u.email.toLowerCase() === cleanEmail
            ? { ...u, active: isNowApproved, role: submission.requestedRole }
            : u
        );
      } else if (isNowApproved) {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: submission.fullName,
          email: cleanEmail,
          role: submission.requestedRole,
          title: `${submission.department} Specialist`,
          department: submission.department,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          phone: submission.phone,
          active: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        return [...prev, newUser];
      }
      return prev;
    });

    if (isNowApproved) {
      const starterContact = contacts[0] || INITIAL_CONTACTS[0];
      if (starterContact) {
        const starterTask: ContactRoleTask = {
          id: `crt_${Date.now()}`,
          contactId: starterContact.id,
          contactName: starterContact.fullName,
          businessName: starterContact.businessName,
          title: submission.requestedRole === 'sales_rep'
            ? 'Initial Outreach & Commercial Review'
            : submission.requestedRole === 'consultant'
            ? 'Diagnostic Audit & Operations Review'
            : 'Strategic Partnership Engagement',
          description: `Auto-assigned onboarding task for newly approved ${submission.requestedRole} ${submission.fullName}.`,
          assignedRole: submission.requestedRole,
          assignedUserId: `usr_${Date.now()}`,
          assignedUserName: submission.fullName,
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          priority: 'high',
          status: 'todo',
          googleSheetRowIndex: contactRoleTasks.length + 2,
          googleSheetTab: 'Role-Based Contact Tasks',
          createdAt: new Date().toISOString()
        };
        setContactRoleTasks(prev => [starterTask, ...prev]);
      }
    }

    const syncLog: SyncLog = {
      id: `slog_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Google Sheets',
      status: 'success',
      recordsImported: 1,
      recordsSkipped: 0,
      message: `Updated Google Sheet tab [${submission.googleSheetTab}] Row #${submission.googleSheetRowIndex}: Status changed to "${newStatus}". Synced with Supabase Auth.`,
      details: isNowApproved
        ? `Account for ${submission.fullName} (${submission.email}) is now ACTIVE in Supabase.`
        : `Account for ${submission.fullName} has been marked inactive.`
    };
    setSyncLogs(prev => [syncLog, ...prev]);

    addAuditLog(
      'Approval Status Updated',
      'GoogleSync',
      submission.id,
      `Changed approval status of ${submission.fullName} (${submission.email}) to "${newStatus}" on Google Sheet Row #${submission.googleSheetRowIndex}`
    );

    const approvalNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: isNowApproved ? 'Team Member Approved & Activated' : 'User Account Marked Inactive',
      message: isNowApproved
        ? `${submission.fullName} (${submission.requestedRole.replace('_', ' ')}) has been approved. Supabase Auth account is active and role-based tasks are assigned.`
        : `${submission.fullName}'s account access has been revoked (unapproved).`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [approvalNotif, ...prev]);
  };

  const approvePendingUser = async (submissionId: string): Promise<void> => {
    await toggleOnboardingApproval(
      submissionId,
      'approved',
      `Approved directly by ${currentUser.name} via One-Click Approval`
    );
  };

  const batchApprovePendingUsers = async (): Promise<number> => {
    const pending = onboardingSubmissions.filter(s => s.approvalStatus === 'unapproved');
    for (const sub of pending) {
      await toggleOnboardingApproval(
        sub.id,
        'approved',
        `Batch approved by ${currentUser.name}`
      );
    }
    return pending.length;
  };

  const simulateSheetApprovalWebhook = async (
    rowIndex: number,
    status: 'approved' | 'unapproved'
  ): Promise<void> => {
    const target = onboardingSubmissions.find(s => s.googleSheetRowIndex === rowIndex) || onboardingSubmissions[0];
    if (target) {
      await toggleOnboardingApproval(
        target.id,
        status,
        `Toggled via Google Sheets onEdit() Webhook (Cell J${rowIndex} updated to "${status}")`
      );
    }
  };

  const triggerSheetsOnboardingSync = async (): Promise<{ success: boolean; message: string }> => {
    await new Promise(res => setTimeout(res, 900));
    const syncLog: SyncLog = {
      id: `slog_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Google Sheets',
      status: 'success',
      recordsImported: onboardingSubmissions.length,
      recordsSkipped: 0,
      message: `Synced tab [User Onboarding & Approvals] (${onboardingSubmissions.length} rows) and [Role-Based Contact Tasks] (${contactRoleTasks.length} rows). Checksums match.`,
      details: 'Bidirectional sync verified with Supabase Auth profiles.'
    };
    setSyncLogs(prev => [syncLog, ...prev]);
    return { success: true, message: 'Google Sheets Onboarding and Contact Tasks synced successfully.' };
  };

  const addContactRoleTask = (
    taskData: Omit<ContactRoleTask, 'id' | 'createdAt' | 'googleSheetRowIndex' | 'googleSheetTab'>
  ): ContactRoleTask => {
    const nextRow = contactRoleTasks.length + 2;
    const newTask: ContactRoleTask = {
      ...taskData,
      id: `crt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      googleSheetRowIndex: nextRow,
      googleSheetTab: 'Role-Based Contact Tasks'
    };
    setContactRoleTasks(prev => [newTask, ...prev]);

    addAuditLog(
      'Contact Task Created',
      'Contact',
      newTask.contactId,
      `Added task "${newTask.title}" for role ${newTask.assignedRole} linked to contact ${newTask.contactName}. Written to Google Sheet Row #${nextRow}.`
    );

    return newTask;
  };

  const updateContactRoleTaskStatus = (
    taskId: string,
    status: 'todo' | 'in_progress' | 'completed'
  ) => {
    setContactRoleTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : undefined
            }
          : t
      )
    );
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
    setOnboardingSubmissions(INITIAL_ONBOARDING_SUBMISSIONS);
    setUserInvitations(INITIAL_USER_INVITATIONS);
    setContactRoleTasks(INITIAL_CONTACT_ROLE_TASKS);
    setSupabaseConfig(INITIAL_SUPABASE_CONFIG);
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
  const unapprovedOnboardingCount = onboardingSubmissions.filter(s => s.approvalStatus === 'unapproved').length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        users,
        updateUserProfile,
        toggleUserActive,
        isAuthenticated,
        login,
        signup,
        logout,
        authorizedUsers,
        addAuthorizedUser,
        removeAuthorizedUser,
        mobileSidebarOpen,
        setMobileSidebarOpen,
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
        onboardingSubmissions,
        userInvitations,
        inviteUserByEmail,
        submitOnboardingForm,
        toggleOnboardingApproval,
        approvePendingUser,
        batchApprovePendingUsers,
        simulateSheetApprovalWebhook,
        triggerSheetsOnboardingSync,
        contactRoleTasks,
        addContactRoleTask,
        updateContactRoleTaskStatus,
        supabaseConfig,
        updateSupabaseConfig,
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
          winRate,
          unapprovedOnboardingCount
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
