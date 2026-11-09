import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, GitBranch, DollarSign, Building } from 'lucide-react';
import { PipelineStageId } from '../../types';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({ isOpen, onClose }) => {
  const { addDeal, contacts, users, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [contactId, setContactId] = useState(contacts[0]?.id || '');
  const [serviceCategory, setServiceCategory] = useState('Business Audit & Diagnostics');
  const [value, setValue] = useState(12000000);
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [stageId, setStageId] = useState<PipelineStageId>('new_lead');
  const [probability, setProbability] = useState(25);
  const [expectedClosingDate, setExpectedClosingDate] = useState(
    new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10)
  );
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [nextAction, setNextAction] = useState('Schedule preliminary discovery call.');
  const [internalNotes, setInternalNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contactId) {
      alert('Please enter Deal Title and select a Contact');
      return;
    }

    const selectedContact = contacts.find(c => c.id === contactId);

    addDeal({
      title,
      contactId,
      businessName: selectedContact?.businessName || 'Business Partner',
      ownerId,
      supportingTeamIds: [],
      serviceCategory,
      value: Number(value),
      currency,
      stageId,
      probability: Number(probability),
      expectedClosingDate,
      nextAction,
      internalNotes: internalNotes || 'Created from Sales Workspace.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <GitBranch size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Create New Sales Opportunity</h3>
              <p className="text-xs text-slate-400">Track an active deal in the commercial pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sterling Solar Capital Restructuring Advisory"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Associated Contact / Client *</label>
              <select
                value={contactId}
                onChange={e => setContactId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.businessName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Service Category</label>
              <select
                value={serviceCategory}
                onChange={e => setServiceCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Business Audit & Diagnostics">Business Audit & Diagnostics</option>
                <option value="Custom Business Consulting">Custom Business Consulting</option>
                <option value="Capital Advisory & Restructuring">Capital Advisory & Restructuring</option>
                <option value="Sales & BD Architecture">Sales & BD Architecture</option>
                <option value="Turnaround Management">Turnaround Management</option>
                <option value="Executive Advisory Retainer">Executive Advisory Retainer</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Deal Value (Amount) *</label>
              <div className="flex items-center space-x-1.5">
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
                  required
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pipeline Stage</label>
              <select
                value={stageId}
                onChange={e => setStageId(e.target.value as PipelineStageId)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="new_lead">New Lead</option>
                <option value="initial_contact">Initial Contact</option>
                <option value="discovery">Discovery / Needs Assessment</option>
                <option value="qualified_opportunity">Qualified Opportunity</option>
                <option value="consultation_scheduled">Consultation Scheduled</option>
                <option value="proposal_recommendation">Proposal / Recommendation</option>
                <option value="negotiation">Negotiation</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={e => setProbability(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Expected Closing Date</label>
              <input
                type="date"
                value={expectedClosingDate}
                onChange={e => setExpectedClosingDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Next Action Required</label>
            <input
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              placeholder="e.g. Send engagement proposal slide deck"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
              Create Deal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
