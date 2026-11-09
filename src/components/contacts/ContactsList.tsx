import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  Building,
  Search,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  GitMerge,
  Filter,
  Download,
  Calendar,
  ExternalLink,
  Eye,
  AlertCircle
} from 'lucide-react';
import { formatDate, exportToCSV } from '../../utils/formatters';
import { Contact, ContactType } from '../../types';

interface ContactsListProps {
  onSelectContact: (id: string) => void;
  onOpenNewContact: () => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  onSelectContact,
  onOpenNewContact
}) => {
  const { contacts, organisations, users, checkDuplicates, mergeContacts, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'contacts' | 'organisations'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  // Duplicate Check & Merge state
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [potentialDuplicates, setPotentialDuplicates] = useState<Contact[]>([]);
  const [primaryMergeContact, setPrimaryMergeContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    const matchesType = typeFilter === 'all' || c.contactType === typeFilter;
    const matchesOwner = ownerFilter === 'all' || c.relationshipOwnerId === ownerFilter;

    return matchesSearch && matchesType && matchesOwner;
  });

  const filteredOrganisations = organisations.filter(o => {
    return (
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleExportContacts = () => {
    const rows = filteredContacts.map(c => ({
      'Full Name': c.fullName,
      'Business Name': c.businessName,
      'Email': c.email,
      'Phone': c.phone,
      'WhatsApp': c.whatsapp,
      'Location': c.location,
      'Industry': c.industry,
      'Type': c.contactType,
      'Source': c.source,
      'First Contact Date': c.firstContactDate,
      'Last Interaction': c.lastInteractionDate
    }));
    exportToCSV('AffluentOS_CRM_Contacts', rows);
  };

  const checkContactDuplicates = (contact: Contact) => {
    const dupes = checkDuplicates(contact.email, contact.phone, contact.businessName).filter(
      d => d.id !== contact.id
    );
    if (dupes.length > 0) {
      setPrimaryMergeContact(contact);
      setPotentialDuplicates(dupes);
      setMergeModalOpen(true);
    } else {
      alert(`No duplicate contacts found for "${contact.fullName}" / ${contact.businessName}. Record is unique.`);
    }
  };

  const getContactTypeBadge = (type: ContactType) => {
    switch (type) {
      case 'prospect':
        return { label: 'Prospect', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'qualified_lead':
        return { label: 'Qualified Lead', bg: 'bg-sky-50 text-sky-800 border-sky-300' };
      case 'active_client':
        return { label: 'Active Client', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'former_client':
        return { label: 'Former Client', bg: 'bg-gray-100 text-gray-700 border-gray-300' };
      case 'business_partner':
        return { label: 'Business Partner', bg: 'bg-purple-50 text-purple-800 border-purple-300' };
      case 'strategic_partner':
        return { label: 'Strategic Partner', bg: 'bg-indigo-50 text-indigo-800 border-indigo-300' };
      default:
        return { label: type, bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users2 size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800">CRM & Contacts Central</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  {contacts.length} contacts • {organisations.length} organisations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Single source of truth for clients, founders, prospects, and strategic relationships
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Contacts vs Organisations toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'contacts' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Individual Contacts
              </button>
              <button
                onClick={() => setActiveTab('organisations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'organisations' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Organisations
              </button>
            </div>

            <button
              onClick={handleExportContacts}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
              title="Export Contacts CSV"
            >
              <Download size={16} />
            </button>

            <button
              onClick={onOpenNewContact}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus size={15} />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, email, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Relationship Types</option>
            <option value="prospect">Prospect</option>
            <option value="qualified_lead">Qualified Lead</option>
            <option value="active_client">Active Client</option>
            <option value="former_client">Former Client</option>
            <option value="business_partner">Business Partner</option>
            <option value="strategic_partner">Strategic Partner</option>
          </select>

          <select
            value={ownerFilter}
            onChange={e => setOwnerFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Relationship Owners</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTACTS VIEW */}
      {activeTab === 'contacts' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-3">Company / Organisation</th>
                  <th className="py-3 px-3">Relationship Type</th>
                  <th className="py-3 px-3">Direct Contact</th>
                  <th className="py-3 px-3">Account Owner</th>
                  <th className="py-3 px-3">Last Interaction</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No contacts found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => {
                    const badge = getContactTypeBadge(contact.contactType);
                    const owner = users.find(u => u.id === contact.relationshipOwnerId);

                    return (
                      <tr
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                {contact.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400">{contact.location}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{contact.businessName}</span>
                          <span className="text-[11px] text-slate-400">{contact.industry}</span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="text-slate-700 font-medium">{contact.email}</div>
                          <div className="text-[11px] text-slate-400">{contact.phone}</div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {owner ? (
                            <span className="font-medium text-slate-800">{owner.name.split(' ')[0]}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {formatDate(contact.lastInteractionDate)}
                        </td>

                        <td
                          className="py-3 px-4 text-right whitespace-nowrap"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => checkContactDuplicates(contact)}
                              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Check for duplicate contact"
                            >
                              <GitMerge size={15} />
                            </button>
                            <button
                              onClick={() => onSelectContact(contact.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="View full profile"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ORGANISATIONS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrganisations.map(org => {
            const orgContacts = contacts.filter(
              c => c.businessName.toLowerCase() === org.name.toLowerCase()
            );

            return (
              <div
                key={org.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <Building size={20} />
                  </div>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {org.stage}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{org.name}</h3>
                  <p className="text-xs text-slate-400">{org.industry} • {org.location}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {org.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Annual Revenue</span>
                    <span className="font-bold text-emerald-800 font-mono">{org.annualRevenue || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Associated Contacts</span>
                    <span className="font-bold text-slate-800">{orgContacts.length} people</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DUPLICATE DETECTION & MERGE MODAL */}
      {mergeModalOpen && primaryMergeContact && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-floating space-y-4">
            <div className="flex items-center space-x-2 text-amber-700">
              <AlertCircle size={20} />
              <h3 className="font-bold text-base">Potential Duplicate Records Detected</h3>
            </div>
            <p className="text-xs text-slate-600">
              The system identified potential duplicate entries matching email, phone, or company name. You can safely merge them without losing any deals or activities.
            </p>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Primary Master Record:</span>
              <span className="font-bold text-slate-900">{primaryMergeContact.fullName}</span> ({primaryMergeContact.businessName})
              <div className="text-slate-500 text-[11px] mt-0.5">{primaryMergeContact.email} • {primaryMergeContact.phone}</div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Duplicate Candidates to Merge:</span>
              {potentialDuplicates.map(dupe => (
                <div
                  key={dupe.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">{dupe.fullName}</span>
                    <span className="text-slate-500 block text-[11px]">{dupe.email} • {dupe.phone}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Merge ${dupe.fullName} into ${primaryMergeContact.fullName}?`)) {
                        mergeContacts(primaryMergeContact.id, dupe.id);
                        setMergeModalOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs flex items-center space-x-1"
                  >
                    <GitMerge size={13} />
                    <span>Merge into Master</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setMergeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
