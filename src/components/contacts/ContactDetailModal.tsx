import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  Building,
  Calendar,
  GitBranch,
  Briefcase,
  Clock,
  Plus,
  Send,
  ExternalLink,
  DollarSign,
  CheckSquare
} from 'lucide-react';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';
import { ContactTasksSection } from './ContactTasksSection';

interface ContactDetailModalProps {
  contactId: string | null;
  onClose: () => void;
  onOpenNewDeal: () => void;
  onLogActivity: () => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contactId,
  onClose,
  onOpenNewDeal,
  onLogActivity
}) => {
  const { contacts, deals, projects, activities, users, updateContact, contactRoleTasks } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks' | 'deals' | 'projects' | 'notes'>('timeline');
  const [noteText, setNoteText] = useState('');

  if (!contactId) return null;

  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return null;

  const owner = users.find(u => u.id === contact.relationshipOwnerId);
  const contactDeals = deals.filter(d => d.contactId === contact.id);
  const contactProjects = projects.filter(p => p.clientId === contact.id);
  const contactActivities = activities.filter(
    a => a.relatedType === 'contact' && a.relatedId === contact.id
  );
  const contactTasks = contactRoleTasks.filter(t => t.contactId === contact.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const updated = `${contact.notes ? contact.notes + '\n\n' : ''}[${new Date().toLocaleDateString('en-GB')}]: ${noteText}`;
    updateContact(contact.id, { notes: updated });
    setNoteText('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <img
              src={contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={contact.fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  {contact.contactType.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Owner: {owner?.name || 'Unassigned'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{contact.fullName}</h2>
              <p className="text-xs text-slate-500 font-medium">
                {contact.businessName} • {contact.industry} • {contact.location}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewDeal}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Create Deal</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="px-5 py-2.5 bg-emerald-50/40 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-4">
            <a href={`mailto:${contact.email}`} className="flex items-center space-x-1 text-slate-700 hover:text-emerald-800 font-medium">
              <Mail size={13} className="text-slate-400" />
              <span>{contact.email}</span>
            </a>
            <span className="flex items-center space-x-1 text-slate-700 font-medium">
              <Phone size={13} className="text-slate-400" />
              <span>{contact.phone}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs"
            >
              <MessageSquare size={12} />
              <span>WhatsApp Chat</span>
            </a>
            <button
              onClick={onLogActivity}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-medium text-xs"
            >
              <Clock size={12} className="text-emerald-700" />
              <span>Log Activity</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-slate-200 flex space-x-6 text-xs font-semibold text-slate-500 bg-white">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'timeline' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Chronological Timeline
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'tasks' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Role Tasks</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {contactTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'deals' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Deals & Opportunities</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {contactDeals.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'projects' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Consulting Engagements</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {contactProjects.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'notes' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Notes & Dossier
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50 space-y-6 text-xs text-slate-700">
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Relationship History & Key Milestones
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">First Touchpoint</span>
                  <p className="font-semibold text-slate-800 mt-0.5">Initial contact established via {contact.source}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDate(contact.firstContactDate)}</span>
                </div>

                {contactActivities.map(act => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{act.summary}</span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(act.date)}</span>
                    </div>
                    <p className="text-slate-600 text-xs">{act.outcome}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">By {act.userName}</span>
                  </div>
                ))}
              </div>

              {/* Also show role tasks summary at bottom of timeline */}
              <ContactTasksSection contact={contact} />
            </div>
          )}

          {/* TAB: ROLE TASKS */}
          {activeTab === 'tasks' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <ContactTasksSection contact={contact} />
            </div>
          )}

          {/* TAB 2: DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-3">
              {contactDeals.length === 0 ? (
                <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                  No deals linked to this contact yet. Click "Create Deal" above.
                </div>
              ) : (
                contactDeals.map(deal => (
                  <div
                    key={deal.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{deal.title}</h4>
                      <p className="text-xs text-slate-400">
                        {deal.serviceCategory} • Expected: {formatDate(deal.expectedClosingDate)}
                      </p>
                      <span className="text-xs font-semibold text-emerald-700 font-mono mt-1 block">
                        {formatCurrency(deal.value, deal.currency)} ({deal.probability}% probability)
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {deal.stageId.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              {contactProjects.length === 0 ? (
                <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                  No active consulting engagements for this contact.
                </div>
              ) : (
                contactProjects.map(prj => (
                  <div
                    key={prj.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-800">{prj.reference}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {prj.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{prj.name}</h4>
                    <p className="text-xs text-slate-500">{prj.engagementType}</p>
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span>Progress: {prj.progressPercentage}%</span>
                      <span className="font-bold font-mono text-emerald-800">{formatCurrency(prj.agreedFee, prj.currency)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Contact Dossier & Strategic Notes
              </h4>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {contact.notes || 'No notes added.'}
              </div>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Record founder preferences, board dynamics, decision criteria..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!noteText.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
