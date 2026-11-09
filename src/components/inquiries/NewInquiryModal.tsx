import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Sparkles, Building, User, Mail, Phone, DollarSign, Calendar } from 'lucide-react';
import { InquiryCategory, InquiryPriority } from '../../types';

interface NewInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInquiryModal: React.FC<NewInquiryModalProps> = ({ isOpen, onClose }) => {
  const { addInquiry, users, currentUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [industry, setIndustry] = useState('Logistics & Supply Chain');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [stage, setStage] = useState<'Idea / Pre-Revenue' | 'Early Stage' | 'Growth' | 'Scaling' | 'Mature Enterprise'>('Growth');
  const [teamSize, setTeamSize] = useState('25-50');
  const [businessModel, setBusinessModel] = useState<'B2B' | 'B2C' | 'Hybrid' | 'Marketplace' | 'D2C' | 'Services'>('B2B');
  const [annualRevenueRange, setAnnualRevenueRange] = useState('₦250M - ₦500M');
  const [category, setCategory] = useState<InquiryCategory>('Business Audit Requests');
  const [requestedService, setRequestedService] = useState('End-to-End Corporate Diagnostic');
  const [budgetRange, setBudgetRange] = useState('₦10,000,000 - ₦15,000,000');
  const [priority, setPriority] = useState<InquiryPriority>('high');
  const [source, setSource] = useState<'Website' | 'Referral' | 'LinkedIn' | 'WhatsApp' | 'Direct Outreach' | 'Events' | 'Other'>('Direct Outreach');
  const [assignedBdId, setAssignedBdId] = useState(currentUser.id);
  const [internalNotes, setInternalNotes] = useState('');
  const [challenges, setChallenges] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !businessName || !email) {
      alert('Please fill in required fields (Name, Business Name, Email)');
      return;
    }

    addInquiry({
      fullName,
      businessName,
      email,
      phone,
      whatsapp: phone,
      location,
      industry,
      websiteUrl,
      description: `${businessName} operates in ${industry}.`,
      stage,
      teamSize,
      businessModel,
      annualRevenueRange,
      currentChallenges: challenges,
      businessObjectives: 'Accelerate operational performance and executive alignment.',
      category,
      requestedService,
      descriptionOfSupport: requestedService,
      specificQuestions: '',
      expectedOutcomes: 'Comprehensive audit report and execution roadmap.',
      budgetRange,
      preferredConsultationMethod: 'Hybrid',
      source,
      supportingDocuments: [],
      assignedBdId,
      status: 'new',
      priority,
      internalNotes: internalNotes || `Created manually by ${currentUser.name}.`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">New Business Inquiry / Lead</h3>
              <p className="text-xs text-slate-400">Record a new lead submitted directly or discovered via outreach</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Adeola Adeleke"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company / Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Vanguard Logistics Ltd"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="adeola@vanguardlogistics.ng"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone / WhatsApp *</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+234 803 000 0000"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. Manufacturing, Fintech, Agriculture"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Location / City</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Lagos, Nigeria"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as InquiryCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Business Audit Requests">Business Audit Requests</option>
                <option value="Custom Business Consulting">Custom Business Consulting</option>
                <option value="Business Advisory">Business Advisory</option>
                <option value="Business Strategy Requests">Business Strategy Requests</option>
                <option value="Business Growth Support">Business Growth Support</option>
                <option value="Business Development Requests">Business Development Requests</option>
                <option value="Partnership Inquiries">Partnership Inquiries</option>
                <option value="General Business Inquiries">General Business Inquiries</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estimated Budget</label>
              <input
                type="text"
                value={budgetRange}
                onChange={e => setBudgetRange(e.target.value)}
                placeholder="₦10M - ₦15M"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as InquiryPriority)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Acquisition Source</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Direct Outreach">Direct Outreach</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Events">Events</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assign BD Representative</label>
              <select
                value={assignedBdId}
                onChange={e => setAssignedBdId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Current Challenges / Discovery Notes</label>
            <textarea
              value={challenges}
              onChange={e => setChallenges(e.target.value)}
              placeholder="What specific problems or growth bottlenecks did the client describe?"
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
              Save Inquiry Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
