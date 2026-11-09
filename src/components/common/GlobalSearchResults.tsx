import React from 'react';
import { useApp } from '../../context/AppContext';
import { Inbox, Users2, GitBranch, Briefcase, UserCheck, ArrowRight, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface GlobalSearchResultsProps {
  onSelectInquiry: (id: string) => void;
  onSelectContact: (id: string) => void;
  onSelectDeal: (id: string) => void;
  onSelectProject: (id: string) => void;
  setCurrentTab: (tab: string) => void;
}

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
  onSelectInquiry,
  onSelectContact,
  onSelectDeal,
  onSelectProject,
  setCurrentTab
}) => {
  const { globalSearchQuery, setGlobalSearchQuery, inquiries, contacts, deals, projects, users } = useApp();

  if (!globalSearchQuery.trim()) return null;

  const q = globalSearchQuery.toLowerCase();

  const matchingInquiries = inquiries.filter(
    i =>
      i.businessName.toLowerCase().includes(q) ||
      i.fullName.toLowerCase().includes(q) ||
      i.referenceNo.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
  );

  const matchingContacts = contacts.filter(
    c =>
      c.fullName.toLowerCase().includes(q) ||
      c.businessName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
  );

  const matchingDeals = deals.filter(
    d =>
      d.title.toLowerCase().includes(q) ||
      d.businessName.toLowerCase().includes(q) ||
      d.serviceCategory.toLowerCase().includes(q)
  );

  const matchingProjects = projects.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.businessName.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q)
  );

  const totalMatches =
    matchingInquiries.length + matchingContacts.length + matchingDeals.length + matchingProjects.length;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 text-sm">Global Search Results</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold">
              {totalMatches} matches
            </span>
          </div>
          <button
            onClick={() => setGlobalSearchQuery('')}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-5">
          {totalMatches === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">No records found matching "{globalSearchQuery}"</p>
            </div>
          ) : (
            <>
              {/* Inquiries */}
              {matchingInquiries.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Inbox size={14} className="text-emerald-700" />
                    <span>Inquiries ({matchingInquiries.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {matchingInquiries.slice(0, 4).map(inq => (
                      <div
                        key={inq.id}
                        onClick={() => {
                          onSelectInquiry(inq.id);
                          setGlobalSearchQuery('');
                          setCurrentTab('inquiries');
                        }}
                        className="p-3 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-emerald-800 font-bold">{inq.referenceNo}</span>
                            <span className="font-bold text-slate-800">{inq.businessName}</span>
                            <span className="text-slate-400">• {inq.fullName}</span>
                          </div>
                          <span className="text-slate-500 text-[11px] mt-0.5 block">{inq.category} • Budget: {inq.budgetRange}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deals */}
              {matchingDeals.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <GitBranch size={14} className="text-amber-600" />
                    <span>Deals & Pipeline ({matchingDeals.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {matchingDeals.slice(0, 4).map(deal => (
                      <div
                        key={deal.id}
                        onClick={() => {
                          onSelectDeal(deal.id);
                          setGlobalSearchQuery('');
                          setCurrentTab('pipeline');
                        }}
                        className="p-3 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800">{deal.title}</span>
                            <span className="text-emerald-700 font-semibold font-mono">{formatCurrency(deal.value, deal.currency)}</span>
                          </div>
                          <span className="text-slate-500 text-[11px] mt-0.5 block">{deal.businessName} • Stage: {deal.stageId.replace('_', ' ')}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {matchingProjects.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Briefcase size={14} className="text-blue-600" />
                    <span>Consulting Projects ({matchingProjects.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {matchingProjects.slice(0, 4).map(prj => (
                      <div
                        key={prj.id}
                        onClick={() => {
                          onSelectProject(prj.id);
                          setGlobalSearchQuery('');
                          setCurrentTab('projects');
                        }}
                        className="p-3 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-blue-800 font-bold">{prj.reference}</span>
                            <span className="font-bold text-slate-800">{prj.name}</span>
                          </div>
                          <span className="text-slate-500 text-[11px] mt-0.5 block">{prj.businessName} • Progress: {prj.progressPercentage}%</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {matchingContacts.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Users2 size={14} className="text-purple-600" />
                    <span>Contacts ({matchingContacts.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {matchingContacts.slice(0, 4).map(ctc => (
                      <div
                        key={ctc.id}
                        onClick={() => {
                          onSelectContact(ctc.id);
                          setGlobalSearchQuery('');
                          setCurrentTab('contacts');
                        }}
                        className="p-3 hover:bg-purple-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={ctc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-800">{ctc.fullName}</span>
                            <span className="text-slate-500 text-[11px] ml-2">{ctc.businessName} ({ctc.phone})</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
