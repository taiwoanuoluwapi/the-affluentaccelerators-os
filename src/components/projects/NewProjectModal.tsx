import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Briefcase, Plus } from 'lucide-react';
import { ProjectStatus } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDeal?: any;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  defaultDeal
}) => {
  const { addProject, contacts, users, currentUser } = useApp();

  const [name, setName] = useState(defaultDeal ? `${defaultDeal.businessName} - Strategy & Operational Diagnostic` : '');
  const [clientId, setClientId] = useState(defaultDeal?.contactId || (contacts[0]?.id || ''));
  const [engagementType, setEngagementType] = useState(defaultDeal?.serviceCategory || 'Corporate Diagnostic & Process Overhaul');
  const [agreedFee, setAgreedFee] = useState(defaultDeal?.value || 15000000);
  const [currency, setCurrency] = useState<'NGN' | 'USD'>(defaultDeal?.currency || 'NGN');
  const [leadConsultantId, setLeadConsultantId] = useState('usr_consultant_lead');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10)
  );
  const [scopeOfWork, setScopeOfWork] = useState(
    '1. End-to-end diagnostic audit of company operations & finance.\n2. Delivery of executive recommendations and SOP manual.\n3. Implementation advisory sprint.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) {
      alert('Please enter Project Name and select a Client');
      return;
    }

    const selectedContact = contacts.find(c => c.id === clientId);

    addProject({
      name,
      clientId,
      clientName: selectedContact?.fullName || 'Client',
      businessName: selectedContact?.businessName || 'Business Partner',
      dealId: defaultDeal?.id,
      engagementType,
      description: `Consulting engagement for ${selectedContact?.businessName}.`,
      scopeOfWork,
      startDate,
      expectedCompletionDate,
      projectOwnerId: currentUser.id,
      leadConsultantId,
      supportingAnalystIds: ['usr_analyst', 'usr_intern'],
      status: 'planning',
      agreedFee: Number(agreedFee),
      currency,
      progressPercentage: 10,
      tasks: [
        {
          id: `tsk_${Date.now()}`,
          projectId: '',
          title: 'Project Kickoff & Document Discovery',
          description: 'Collect operational manuals and financial sheets.',
          assignedUserId: leadConsultantId,
          assignedUserName: users.find(u => u.id === leadConsultantId)?.name || 'Consultant',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          priority: 'high',
          status: 'todo'
        }
      ],
      deliverables: [
        {
          id: `del_${Date.now()}`,
          projectId: '',
          title: 'Baseline Diagnostic Audit Report',
          description: 'Initial assessment findings presentation.',
          dueDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
          status: 'pending'
        }
      ],
      documents: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Create Consulting Engagement</h3>
              <p className="text-xs text-slate-400">Deploy consulting team, scope, milestones, and deliverables</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Engagement Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. OmniChain Operational Process Overhaul"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Client Contact *</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} — {c.businessName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Engagement Type</label>
              <input
                type="text"
                value={engagementType}
                onChange={e => setEngagementType(e.target.value)}
                placeholder="e.g. Financial Advisory, Audit"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Agreed Fee</label>
              <div className="flex items-center space-x-1">
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as any)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input
                  type="number"
                  value={agreedFee}
                  onChange={e => setAgreedFee(Number(e.target.value))}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Strategy Consultant</label>
              <select
                value={leadConsultantId}
                onChange={e => setLeadConsultantId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {users
                  .filter(u => u.role === 'consultant' || u.role === 'super_admin')
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Expected Completion</label>
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={e => setExpectedCompletionDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Scope of Work (SOW) Outline</label>
            <textarea
              value={scopeOfWork}
              onChange={e => setScopeOfWork(e.target.value)}
              rows={3}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
            >
              Initialize Engagement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
