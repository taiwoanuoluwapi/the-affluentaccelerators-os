import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PhoneCall, MessageSquare, Mail, Users2, Calendar, Clock } from 'lucide-react';
import { ActivityType } from '../../types';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRelatedId?: string;
  defaultRelatedType?: 'inquiry' | 'contact' | 'deal' | 'project';
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  defaultRelatedId,
  defaultRelatedType = 'contact'
}) => {
  const { logActivity, contacts, deals, inquiries, users, currentUser } = useApp();

  const [type, setType] = useState<ActivityType>('call');
  const [relatedType, setRelatedType] = useState<'inquiry' | 'contact' | 'deal'>(
    defaultRelatedType === 'project' ? 'contact' : defaultRelatedType
  );
  const [relatedId, setRelatedId] = useState(defaultRelatedId || (contacts[0]?.id || ''));
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !outcome) {
      alert('Please provide Activity Summary and Outcome');
      return;
    }

    let relatedTitle = 'General Client';
    if (relatedType === 'contact') {
      const c = contacts.find(item => item.id === relatedId);
      if (c) relatedTitle = `${c.fullName} (${c.businessName})`;
    } else if (relatedType === 'inquiry') {
      const inq = inquiries.find(item => item.id === relatedId);
      if (inq) relatedTitle = `${inq.businessName} [${inq.referenceNo}]`;
    } else if (relatedType === 'deal') {
      const d = deals.find(item => item.id === relatedId);
      if (d) relatedTitle = d.title;
    }

    logActivity({
      type,
      relatedType,
      relatedId,
      relatedTitle,
      date: new Date().toISOString(),
      summary,
      outcome,
      nextAction: nextAction || 'Continue relationship nurturing',
      nextFollowUpDate: nextFollowUpDate || undefined,
      userId: currentUser.id,
      userName: currentUser.name,
      completed: true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <PhoneCall size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Log Sales & BD Activity</h3>
              <p className="text-xs text-slate-400">Record calls, WhatsApp chats, discovery meetings, and notes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Activity Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ActivityType)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="call">Phone Call</option>
                <option value="whatsapp">WhatsApp Message / Call</option>
                <option value="discovery_meeting">Discovery Meeting</option>
                <option value="proposal_submission">Proposal Submission</option>
                <option value="email">Email</option>
                <option value="client_visit">On-site Client Visit</option>
                <option value="note">Internal Strategy Note</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Linked Record Category</label>
              <select
                value={relatedType}
                onChange={e => setRelatedType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="contact">CRM Contact</option>
                <option value="inquiry">Inquiry Submission</option>
                <option value="deal">Pipeline Deal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Specific Record *</label>
            <select
              value={relatedId}
              onChange={e => setRelatedId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              {relatedType === 'contact' &&
                contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} — {c.businessName} ({c.phone})
                  </option>
                ))}
              {relatedType === 'inquiry' &&
                inquiries.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.referenceNo} — {i.businessName} ({i.category})
                  </option>
                ))}
              {relatedType === 'deal' &&
                deals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.title} — {d.businessName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Activity Summary / Topic *</label>
            <input
              type="text"
              required
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="e.g. Discovery session on warehouse logistics diagnostic"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Outcome & Client Response *</label>
            <textarea
              required
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder="What did the client say? What was agreed upon?"
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Next Action Required</label>
              <input
                type="text"
                value={nextAction}
                onChange={e => setNextAction(e.target.value)}
                placeholder="e.g. Deliver customized fee proposal"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Next Follow-up Due Date</label>
              <input
                type="datetime-local"
                value={nextFollowUpDate}
                onChange={e => setNextFollowUpDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
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
              Log Activity Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
