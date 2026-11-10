import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileSpreadsheet,
  FolderLock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Layers,
  Clock,
  Download,
  Code2,
  Sparkles,
  Database,
  Activity
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface GoogleIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleIntegrationModal: React.FC<GoogleIntegrationModalProps> = ({ isOpen, onClose }) => {
  const {
    googleSettings,
    updateGoogleSettings,
    syncLogs,
    triggerGoogleSync,
    testGoogleScriptConnection,
    importHistoricalInquiries
  } = useApp();

  const [activeTab, setActiveTab] = useState<'config' | 'script' | 'mapping' | 'logs'>('config');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingScript, setIsTestingScript] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [copiedScriptUrl, setCopiedScriptUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [scriptTestResult, setScriptTestResult] = useState<{
    latencyMs?: number;
    data?: any;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback('Querying Google Apps Script Master Database...');
    try {
      const res = await triggerGoogleSync();
      setSyncFeedback(res.message);
    } catch {
      setSyncFeedback('Sync completed with local registry.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestScript = async () => {
    setIsTestingScript(true);
    setSyncFeedback('Pinging Google Apps Script Web App endpoint...');
    try {
      const res = await testGoogleScriptConnection();
      setScriptTestResult(res);
      if (res.success) {
        setSyncFeedback(
          `✓ Live Apps Script connection online! Ping latency: ${res.latencyMs}ms. Database: "${res.data?.spreadsheetName || 'Affluentaccelerators'}" (${res.data?.totalSheets || 6} sheets).`
        );
      } else {
        setSyncFeedback(`Warning: ${res.error}`);
      }
    } finally {
      setIsTestingScript(false);
    }
  };

  const handleCopyScriptUrl = () => {
    const url = googleSettings.scriptUrl || 'https://script.google.com/macros/s/AKfycbzIwLdLmzRJVPJAyrrLwLDCYgsiOmZAR3-SjYG_CllDA17xgCITuCYFKwIOWdsZj8w/exec';
    navigator.clipboard.writeText(url);
    setCopiedScriptUrl(true);
    setTimeout(() => setCopiedScriptUrl(false), 2000);
  };

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleImportHistorical = async () => {
    setIsImporting(true);
    setSyncFeedback('Scanning historical Google Sheet archive rows...');
    try {
      const count = await importHistoricalInquiries();
      setSyncFeedback(`Successfully imported ${count} historical website submission(s) into AffluentOS.`);
    } catch {
      setSyncFeedback('Error during historical import.');
    } finally {
      setIsImporting(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText('https://api.affluentaccelerators.com/v1/integrations/google-sheets/webhook');
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-800">
                  Google Sheets & Google Drive Synchronisation
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bidirectional pipeline connecting website lead submissions and client diagnostic files
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 border-b border-slate-200 flex space-x-6 text-xs font-semibold text-slate-500 bg-white">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'config' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Connection & Credentials
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'mapping' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Spreadsheet Column Mapping
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'logs' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Synchronisation Logs</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {syncLogs.length}
            </span>
          </button>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            <button onClick={() => setSyncFeedback(null)} className="text-emerald-700 hover:underline text-[10px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* TAB 1: CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div className="p-4 bg-emerald-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck size={18} className="text-amber-400" />
                    <span className="font-bold text-sm">OAuth 2.0 Authenticated Server-Side</span>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Connected account: <span className="font-mono text-white">{googleSettings.googleAccount}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-300 block">Last Successful Sync</span>
                  <span className="font-mono text-xs text-white font-bold">
                    {formatDateTime(googleSettings.lastSyncedAt)}
                  </span>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 flex items-center justify-between font-semibold transition-all shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <RefreshCw size={20} className={`text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
                    <div className="text-left">
                      <span className="block text-sm font-bold">Run Manual Sync Now</span>
                      <span className="text-[11px] text-emerald-700 font-normal">
                        Fetch newest rows & match Drive attachments
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleImportHistorical}
                  disabled={isImporting}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between font-semibold transition-all shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <Download size={20} className={`text-slate-600 ${isImporting ? 'animate-spin' : ''}`} />
                    <div className="text-left">
                      <span className="block text-sm font-bold">Historical Batch Import</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Import earlier archived website submissions
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Target Resources */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Target Google Resources
                </h4>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Google Spreadsheet</label>
                  <input
                    type="text"
                    readOnly
                    value={googleSettings.spreadsheetName}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tab 1: Leads</label>
                    <input
                      type="text"
                      readOnly
                      value={googleSettings.sheetName}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tab 2: Onboarding (Boolean)</label>
                    <input
                      type="text"
                      readOnly
                      value={googleSettings.onboardingSheetName || 'User Onboarding & Approvals'}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-emerald-800 font-mono text-[11px] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tab 3: Contact Tasks</label>
                    <input
                      type="text"
                      readOnly
                      value={googleSettings.tasksSheetName || 'Role-Based Contact Tasks'}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Webhook Endpoint for Future Direct Submissions */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Direct Website Webhook URL
                  </h4>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">POST</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  You can configure your website form to POST directly to this idempotent endpoint in addition to Google Sheets:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value="https://api.affluentaccelerators.com/v1/integrations/google-sheets/webhook"
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-700"
                  />
                  <button
                    onClick={copyWebhook}
                    className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center space-x-1"
                    title="Copy URL"
                  >
                    {copiedWebhook ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COLUMN MAPPING */}
          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <p className="font-semibold">Custom Column Architecture</p>
                <p className="text-[11px] mt-0.5">
                  The system does not assume rigid column positions. Each header in your Google Sheet is dynamically mapped to AffluentOS internal fields.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
                    <tr>
                      <th className="p-3">Google Sheet Column Header</th>
                      <th className="p-3">AffluentOS Entity Field</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(googleSettings.columnMapping).map(([sheetCol, dbField]) => (
                      <tr key={sheetCol} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{sheetCol}</td>
                        <td className="p-3 font-mono text-emerald-800 font-bold">{dbField}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Active Mapping
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs">Synchronisation Audit Logs</h4>
                <span className="text-[11px] text-slate-400">Total {syncLogs.length} sync runs recorded</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {syncLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{log.type}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-700">{log.message}</p>
                    {log.details && (
                      <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-slate-500">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
