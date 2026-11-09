import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Building, Mail, Phone } from 'lucide-react';
import { ContactType } from '../../types';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewContactModal: React.FC<NewContactModalProps> = ({ isOpen, onClose }) => {
  const { addContact, users, currentUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [industry, setIndustry] = useState('Technology & Telecommunications');
  const [contactType, setContactType] = useState<ContactType>('prospect');
  const [relationshipOwnerId, setRelationshipOwnerId] = useState(currentUser.id);
  const [source, setSource] = useState('Direct BD Outreach');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !businessName || !email) {
      alert('Please fill in Name, Company, and Email');
      return;
    }

    addContact({
      fullName,
      businessName,
      email,
      phone,
      whatsapp: whatsapp || phone,
      linkedin,
      location,
      industry,
      contactType,
      relationshipOwnerId,
      source,
      relationshipStatus: 'active',
      notes: notes || 'Created in CRM.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Add New Contact to CRM</h3>
              <p className="text-xs text-slate-400">Establish a corporate or professional relationship record</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Kolawole Johnson"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company / Organisation *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Industrial Mills"
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
                placeholder="kola@apexmills.ng"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+234 803 111 2222"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+234 803 111 2222"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="Logistics, FMCG, Banking..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Relationship Type</label>
              <select
                value={contactType}
                onChange={e => setContactType(e.target.value as ContactType)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="prospect">Prospect</option>
                <option value="qualified_lead">Qualified Lead</option>
                <option value="active_client">Active Client</option>
                <option value="business_partner">Business Partner</option>
                <option value="strategic_partner">Strategic Partner</option>
                <option value="referral_partner">Referral Partner</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Relationship Owner</label>
              <select
                value={relationshipOwnerId}
                onChange={e => setRelationshipOwnerId(e.target.value)}
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
            <label className="font-semibold text-slate-700 block mb-1">Strategic Notes / Bio</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record executive role, priorities, or initial background..."
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
            >
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
