export type UserRole =
  | 'super_admin' // Founder & Super Admin (Dr. Chukwuma Eze)
  | 'admin'       // Operations Manager & Admin (Amina Bello)
  | 'bd_manager'  // Business Development Manager (Tunde Adeyemi)
  | 'sales_rep'   // Sales Representative (Chioma Okafor)
  | 'consultant'  // Lead Consultant & Analyst (David Adeleke, Ngozi Nwosu)
  | 'intern';     // Fellow & Intern (Femi Alabi)

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
  phone: string;
  active: boolean;
  lastLogin: string;
  createdAt: string;
}

export type InquiryCategory =
  | 'Business Audit Requests'
  | 'Custom Business Consulting'
  | 'Business Advisory'
  | 'Business Strategy Requests'
  | 'Business Growth Support'
  | 'Business Development Requests'
  | 'Partnership Inquiries'
  | 'General Business Inquiries';

export type InquiryStatus =
  | 'new'
  | 'unreviewed'
  | 'under_review'
  | 'contacted'
  | 'awaiting_client'
  | 'qualified'
  | 'proposal_requested'
  | 'converted'
  | 'not_qualified'
  | 'closed_lost'
  | 'archived';

export type InquiryPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportingDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  driveFileId: string;
  driveUrl: string;
  uploadDate: string;
  category: 'Pitch Deck' | 'Diagnostic Report' | 'Financial Document' | 'Business Plan' | 'Deliverable' | 'Other';
  downloadUrl?: string;
}

export interface Inquiry {
  id: string;
  referenceNo: string; // e.g., AA-INQ-2026-0042
  
  // Client Info
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  industry: string;
  websiteUrl: string;

  // Business Info
  description: string;
  stage: 'Idea / Pre-Revenue' | 'Early Stage' | 'Growth' | 'Scaling' | 'Mature Enterprise';
  teamSize: string;
  businessModel: 'B2B' | 'B2C' | 'Hybrid' | 'Marketplace' | 'D2C' | 'Services';
  annualRevenueRange: string;
  currentChallenges: string;
  businessObjectives: string;

  // Inquiry Details
  category: InquiryCategory;
  requestedService: string;
  descriptionOfSupport: string;
  specificQuestions: string;
  expectedOutcomes: string;
  budgetRange: string;
  preferredConsultationMethod: 'Virtual (Zoom/Google Meet)' | 'In-Person (Affluent HQ / Client Office)' | 'Hybrid';
  submittedAt: string;
  source: 'Website' | 'Referral' | 'LinkedIn' | 'WhatsApp' | 'Facebook' | 'Direct Outreach' | 'Events' | 'Other';

  // Supporting Docs
  supportingDocuments: SupportingDocument[];

  // Internal Management
  assignedBdId?: string;
  assignedSalesRepId?: string;
  assignedConsultantId?: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  internalNotes: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  conversionOutcome?: string;

  // Google Sheets metadata
  googleSheetRowIndex?: number;
  syncedAt?: string;
}

export type ContactType =
  | 'prospect'
  | 'qualified_lead'
  | 'active_client'
  | 'former_client'
  | 'business_partner'
  | 'strategic_partner'
  | 'referral_partner'
  | 'other';

export interface Contact {
  id: string;
  orgId?: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  location: string;
  industry: string;
  contactType: ContactType;
  relationshipOwnerId: string;
  source: string;
  firstContactDate: string;
  lastInteractionDate: string;
  nextFollowUpDate?: string;
  relationshipStatus: 'active' | 'nurturing' | 'dormant' | 'unresponsive';
  notes: string;
  avatar?: string;
}

export interface Organisation {
  id: string;
  name: string;
  industry: string;
  website: string;
  size: string;
  stage: string;
  description: string;
  location: string;
  annualRevenue?: string;
  primaryContactId?: string;
}

export type PipelineStageId =
  | 'new_lead'
  | 'initial_contact'
  | 'discovery'
  | 'qualified_opportunity'
  | 'consultation_scheduled'
  | 'proposal_recommendation'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  order: number;
  color: string;
  defaultProbability: number;
}

export type LostReason =
  | 'Budget constraints'
  | 'No response'
  | 'Chose competitor'
  | 'Not ready'
  | 'Service mismatch'
  | 'Timing'
  | 'Price objections'
  | 'Other';

export interface Deal {
  id: string;
  title: string;
  contactId: string;
  businessName: string;
  linkedInquiryId?: string;
  ownerId: string;
  supportingTeamIds: string[];
  serviceCategory: string;
  value: number;
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
  stageId: PipelineStageId;
  probability: number;
  expectedClosingDate: string;
  nextAction: string;
  nextFollowUpDate?: string;
  proposalDocUrl?: string;
  internalNotes: string;
  lostReason?: LostReason;
  lostNotes?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export type ActivityType =
  | 'call'
  | 'whatsapp'
  | 'email'
  | 'discovery_meeting'
  | 'meeting'
  | 'follow_up'
  | 'client_visit'
  | 'networking_event'
  | 'proposal_submission'
  | 'note';

export interface Activity {
  id: string;
  type: ActivityType;
  relatedType: 'inquiry' | 'contact' | 'deal' | 'project';
  relatedId: string;
  relatedTitle: string;
  date: string;
  summary: string;
  outcome: string;
  nextAction: string;
  nextFollowUpDate?: string;
  userId: string;
  userName: string;
  completed: boolean;
  createdAt: string;
}

export interface FollowUpItem {
  id: string;
  title: string;
  relatedType: 'inquiry' | 'contact' | 'deal';
  relatedId: string;
  targetName: string;
  businessName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedUserId: string;
  completed: boolean;
  notes: string;
  lastOutcome?: string;
}

export type ConsultantSpecialisation =
  | 'Business Strategy'
  | 'Business Analysis'
  | 'Financial Analysis'
  | 'Market Research'
  | 'Business Development'
  | 'Marketing Strategy'
  | 'Operations'
  | 'Process Improvement'
  | 'Sales Strategy'
  | 'Business Model Development';

export interface ConsultantProfile {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  specialisations: ConsultantSpecialisation[];
  skills: string[];
  experienceLevel: 'Associate' | 'Senior Consultant' | 'Principal' | 'Partner';
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  currentWorkloadScore: number; // 0 - 100%
  activeProjectsCount: number;
  completedProjectsCount: number;
  bio: string;
  avatar: string;
  phone: string;
  email: string;
}

export type ProjectStatus =
  | 'not_started'
  | 'planning'
  | 'in_progress'
  | 'awaiting_client'
  | 'under_review'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedUserId: string;
  assignedUserName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  completedAt?: string;
}

export interface ProjectDeliverable {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  submittedDate?: string;
  status: 'pending' | 'submitted' | 'approved' | 'revision_requested';
  fileUrl?: string;
  fileName?: string;
}

export interface Project {
  id: string;
  name: string;
  reference: string; // e.g. AA-PRJ-2026-0014
  clientId: string;
  clientName: string;
  businessName: string;
  dealId?: string;
  linkedInquiryId?: string;
  engagementType: string;
  description: string;
  scopeOfWork: string;
  startDate: string;
  expectedCompletionDate: string;
  projectOwnerId: string;
  leadConsultantId: string;
  supportingAnalystIds: string[];
  status: ProjectStatus;
  agreedFee: number;
  currency: 'NGN' | 'USD';
  progressPercentage: number;
  tasks: ProjectTask[];
  deliverables: ProjectDeliverable[];
  documents: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'inquiry' | 'deal' | 'task' | 'followup' | 'project' | 'system';
  linkTarget?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'Inquiry' | 'Contact' | 'Deal' | 'Project' | 'Task' | 'User' | 'Settings' | 'GoogleSync';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'Google Sheets' | 'Google Drive';
  status: 'success' | 'warning' | 'failed';
  recordsImported: number;
  recordsSkipped: number;
  message: string;
  details?: string;
}

export interface GoogleIntegrationSettings {
  connected: boolean;
  googleAccount: string;
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
  driveFolderId: string;
  driveFolderName: string;
  lastSyncedAt: string;
  autoSync: boolean;
  syncFrequencyMinutes: number;
  columnMapping: Record<string, string>;
}
