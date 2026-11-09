import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  GitBranch,
  Building,
  User,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Plus,
  Send,
  Briefcase
} from 'lucide-react';
import { INITIAL_PIPELINE_STAGES } from '../../data/initialData';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { PipelineStageId } from '../../types';

interface DealDetailModalProps {
  dealId: string | null;
  onClose: () => void;
  onPromptCreateProject: (deal: any) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  dealId,
  onClose,
  onPromptCreateProject
}) => {
  const { deals, users, updateDealStage, updateDeal, logActivity, activities, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');

  if (!dealId) return null;

  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  const owner = users.find(u => u.id === deal.ownerId);
  const dealActivities = activities.filter(
    a => a.relatedType === 'deal' && a.relatedId === deal.id
  );

  const currentStageIndex = INITIAL_PIPELINE_STAGES.findIndex(s => s.id === deal.stageId);

  const handleStageClick = (stageId: PipelineStageId) => {
    if (stageId === 'closed_won') {
      updateDealStage(deal.id, 'closed_won');
      onPromptCreateProject(deal);
      return;
    }
    updateDealStage(deal.id, stageId);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const formatted = `${deal.internalNotes ? deal.internalNotes + '\n\n' : ''}[${new Date().toLocaleDateString('en-GB')} by ${currentUser.name}]: ${newNote}`;
    updateDeal(deal.id, { internalNotes: formatted });
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <DollarSign size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                  {deal.serviceCategory}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Owner: {owner?.name || 'Unassigned'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{deal.title}</h2>
              <p className="text-xs text-slate-500 font-medium">
                Associated Business: <span className="text-slate-800 font-bold">{deal.businessName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deal.stageId !== 'closed_won' && (
              <button
                onClick={() => {
                  updateDealStage(deal.id, 'closed_won');
                  onPromptCreateProject(deal);
                }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
              >
                <CheckCircle2 size={15} />
                <span>Mark Closed Won</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Pipeline Stage Stepper Bar */}
        <div className="px-5 py-3 bg-slate-100/70 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center space-x-1.5 min-w-[650px]">
            {INITIAL_PIPELINE_STAGES.filter(s => s.id !== 'closed_lost').map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = s.id === deal.stageId;

              return (
                <button
                  key={s.id}
                  onClick={() => handleStageClick(s.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-500/40'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Value Strip */}
        <div className="px-5 py-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Deal Value</span>
              <span className="text-lg font-extrabold text-emerald-900 font-mono">
                {formatCurrency(deal.value, deal.currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Probability</span>
              <span className="text-sm font-bold text-purple-800 font-mono">{deal.probability}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Weighted Value</span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {formatCurrency(Math.round(deal.value * (deal.probability / 100)), deal.currency)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Expected Closing</span>
            <span className="font-bold text-slate-800">{formatDate(deal.expectedClosingDate)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50 space-y-6 text-xs text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overview */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Deal Particulars
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Next Critical Action</span>
                  <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {deal.nextAction || 'None specified.'}
                  </p>
                </div>

                {deal.proposalDocUrl && (
                  <div>
                    <span className="text-slate-400 text-[10px] block">Proposal Document</span>
                    <a
                      href={deal.proposalDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-blue-600 hover:underline font-semibold mt-1"
                    >
                      <FileText size={14} />
                      <span>View Pitch Proposal on Google Drive</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {deal.lostReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="font-bold text-rose-800 block text-xs">Lost Reason: {deal.lostReason}</span>
                    <p className="text-slate-600 text-xs mt-0.5">{deal.lostNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Team Collaboration */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Commercial Team Assigned
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5 p-2 bg-slate-50 rounded-lg">
                  <img
                    src={owner?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">{owner?.name}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Primary Deal Owner</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 text-[10px] block mb-1">Supporting Representatives</span>
                  <div className="flex flex-wrap gap-2">
                    {deal.supportingTeamIds.map(tid => {
                      const sup = users.find(u => u.id === tid);
                      if (!sup) return null;
                      return (
                        <span
                          key={tid}
                          className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded text-[11px] font-medium"
                        >
                          <img src={sup.avatar} alt="" className="w-4 h-4 rounded-full" />
                          <span>{sup.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Deal Activity Notes & Internal Strategy
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {deal.internalNotes || 'No strategy notes recorded.'}
              </div>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Record negotiation progress, pricing counter-offers, or milestone agreements..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    Post Deal Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
