import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitBranch,
  Plus,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Download
} from 'lucide-react';
import { INITIAL_PIPELINE_STAGES } from '../../data/initialData';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { Deal, PipelineStageId, LostReason } from '../../types';

interface PipelineBoardProps {
  onSelectDeal: (id: string) => void;
  onOpenNewDeal: () => void;
  onPromptCreateProject: (deal: Deal) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  onSelectDeal,
  onOpenNewDeal,
  onPromptCreateProject
}) => {
  const { deals, users, updateDealStage, kpis, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');

  // Closed Lost Modal state
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [selectedDealForLost, setSelectedDealForLost] = useState<Deal | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState<LostReason>('Budget constraints');
  const [lostNotes, setLostNotes] = useState('');

  const filteredDeals = deals.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOwner = ownerFilter === 'all' || d.ownerId === ownerFilter;

    return matchesSearch && matchesOwner;
  });

  const handleStageMove = (dealId: string, targetStage: PipelineStageId) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    if (targetStage === 'closed_lost') {
      setSelectedDealForLost(deal);
      setLostModalOpen(true);
      return;
    }

    if (targetStage === 'closed_won') {
      updateDealStage(dealId, 'closed_won');
      onPromptCreateProject(deal);
      return;
    }

    updateDealStage(dealId, targetStage);
  };

  const handleConfirmLost = () => {
    if (!selectedDealForLost) return;
    updateDealStage(selectedDealForLost.id, 'closed_lost', selectedLostReason, lostNotes);
    setLostModalOpen(false);
    setSelectedDealForLost(null);
    setLostNotes('');
  };

  const handleExportDeals = () => {
    const rows = filteredDeals.map(d => ({
      'Title': d.title,
      'Company': d.businessName,
      'Stage': d.stageId,
      'Value': d.value,
      'Currency': d.currency,
      'Probability': `${d.probability}%`,
      'Expected Close': d.expectedClosingDate,
      'Lost Reason': d.lostReason || '',
      'Created At': d.createdAt
    }));
    exportToCSV('AffluentOS_Pipeline_Deals', rows);
  };

  return (
    <div className="space-y-4">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Total Pipeline Value</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
            {formatCurrency(kpis.pipelineTotalValue)}
          </span>
          <span className="text-[11px] text-slate-400">Excludes closed deals</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 block">Weighted Pipeline</span>
          <span className="text-xl font-extrabold text-purple-700 font-mono mt-0.5 block">
            {formatCurrency(Math.round(kpis.weightedPipelineValue))}
          </span>
          <span className="text-[11px] text-slate-400">Factoring conversion probabilities</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 block">Closed Won Revenue</span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5 block">
            {formatCurrency(kpis.totalWonRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">{kpis.closedDealsWonCount} deals won</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 block">Conversion Win Rate</span>
          <span className="text-xl font-extrabold text-amber-600 font-mono mt-0.5 block">
            {kpis.winRate}%
          </span>
          <span className="text-[11px] text-slate-400">Target: 70%+</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search deals by title, company, or service..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <select
            value={ownerFilter}
            onChange={e => setOwnerFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 shrink-0"
          >
            <option value="all">All Deal Owners</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportDeals}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
            title="Export Deals to CSV"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onOpenNewDeal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex space-x-3.5 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300">
        {INITIAL_PIPELINE_STAGES.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stageId === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 bg-slate-50/70 p-3 rounded-2xl border border-slate-200 flex flex-col min-h-[550px]"
            >
              {/* Column Header */}
              <div
                className="pb-2.5 mb-2.5 border-b-2"
                style={{ borderColor: stage.color }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 truncate">{stage.name}</span>
                  <span className="text-[11px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-800 font-mono mt-1">
                  {formatCurrency(stageTotal)}
                </div>
              </div>

              {/* Deal Cards */}
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                {stageDeals.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-xl">
                    No deals in stage
                  </div>
                ) : (
                  stageDeals.map(deal => {
                    const owner = users.find(u => u.id === deal.ownerId);

                    return (
                      <div
                        key={deal.id}
                        onClick={() => onSelectDeal(deal.id)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all hover:shadow-card group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[130px]">
                            {deal.serviceCategory}
                          </span>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono">
                            {deal.probability}%
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                          {deal.title}
                        </h4>

                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                          {deal.businessName}
                        </span>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-extrabold text-xs text-emerald-800 font-mono">
                            {formatCurrency(deal.value, deal.currency)}
                          </span>
                          {owner && (
                            <img
                              src={owner.avatar}
                              alt={owner.name}
                              title={`Owner: ${owner.name}`}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                          )}
                        </div>

                        {deal.nextAction && (
                          <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-1">
                            <span className="font-semibold text-emerald-800">Next:</span> {deal.nextAction}
                          </div>
                        )}

                        {/* Quick Stage Mover */}
                        <div
                          className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]"
                          onClick={e => e.stopPropagation()}
                        >
                          <select
                            value={deal.stageId}
                            onChange={e => handleStageMove(deal.id, e.target.value as PipelineStageId)}
                            className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-medium focus:outline-none"
                          >
                            {INITIAL_PIPELINE_STAGES.map(s => (
                              <option key={s.id} value={s.id}>
                                Move: {s.name}
                              </option>
                            ))}
                          </select>
                          <span className="text-slate-400 font-mono text-[9px]">
                            {formatDate(deal.expectedClosingDate)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CLOSED LOST REASON MODAL */}
      {lostModalOpen && selectedDealForLost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-floating space-y-4">
            <div className="flex items-center space-x-2 text-rose-700">
              <XCircle size={22} />
              <h3 className="font-bold text-base">Record Reason for Closed Lost Deal</h3>
            </div>
            <p className="text-xs text-slate-500">
              Capturing why "{selectedDealForLost.title}" did not close allows executive sales analysis and future re-engagement.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Lost Reason</label>
              <select
                value={selectedLostReason}
                onChange={e => setSelectedLostReason(e.target.value as LostReason)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Budget constraints">Budget constraints</option>
                <option value="No response">No response</option>
                <option value="Chose competitor">Chose competitor</option>
                <option value="Not ready">Not ready</option>
                <option value="Service mismatch">Service mismatch</option>
                <option value="Timing">Timing</option>
                <option value="Price objections">Price objections</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Explanation & Notes</label>
              <textarea
                value={lostNotes}
                onChange={e => setLostNotes(e.target.value)}
                placeholder="Describe client feedback or rationale..."
                rows={3}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setLostModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                Confirm Closed Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
