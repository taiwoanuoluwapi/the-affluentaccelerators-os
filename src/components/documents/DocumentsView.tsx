import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderLock,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { SupportingDocument } from '../../types';

export const DocumentsView: React.FC = () => {
  const { inquiries, projects, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Collect all documents across inquiries and projects
  const allDocs: (SupportingDocument & { sourceTitle: string; sourceType: 'Inquiry' | 'Project' })[] = [];

  inquiries.forEach(inq => {
    inq.supportingDocuments.forEach(doc => {
      allDocs.push({
        ...doc,
        sourceTitle: inq.businessName,
        sourceType: 'Inquiry'
      });
    });
  });

  projects.forEach(prj => {
    prj.documents.forEach(doc => {
      allDocs.push({
        ...doc,
        sourceTitle: prj.name,
        sourceType: 'Project'
      });
    });
  });

  const filteredDocs = allDocs.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">Secure Document Vault</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
              Google Drive Integrated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted repository for pitch decks, financial audits, diagnostic reports, and client contracts
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <ShieldCheck size={16} className="text-emerald-700" />
          <span>Restricted RBAC Access Enforced</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents by name, client, or category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 shrink-0"
          >
            <option value="all">All Document Types</option>
            <option value="Pitch Deck">Pitch Decks</option>
            <option value="Diagnostic Report">Diagnostic Reports</option>
            <option value="Financial Document">Financial Documents</option>
            <option value="Business Plan">Business Plans</option>
            <option value="Deliverable">Client Deliverables</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredDocs.length} files
        </span>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {doc.category}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{doc.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Linked to {doc.sourceType}: <strong className="text-slate-700">{doc.sourceTitle}</strong>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{doc.size}</span>
              <button
                onClick={() => alert(`Opening secure preview for: ${doc.name}\nGoogle Drive ID: ${doc.driveFileId}`)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center space-x-1"
              >
                <span>Preview</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
