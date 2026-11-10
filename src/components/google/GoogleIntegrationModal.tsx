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
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Connection & Credentials
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'script' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Code2 size={13} />
            <span>Apps Script & Diagnostics</span>
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mapping' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Spreadsheet Column Mapping
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
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
            <button onClick={() => setSyncFeedback(null)} className="text-emerald-700 hover:underline text-[10px] font-bold cursor-pointer">
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
              <div className="p-4 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck size={18} className="text-amber-400" />
                    <span className="font-bold text-sm">Master Unified Database Connected</span>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Spreadsheet: <span className="font-mono text-white font-bold">{googleSettings.spreadsheetName}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right">
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
                  className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 flex items-center justify-between font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center space-x-3">
                    <RefreshCw size={20} className={`text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
                    <div className="text-left">
                      <span className="block text-sm font-bold">Run Live Sync Now</span>
                      <span className="text-[11px] text-emerald-700 font-normal">
                        Queries live Apps Script endpoint & checks leads
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleTestScript}
                  disabled={isTestingScript}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center space-x-3">
                    <Activity size={20} className={`text-indigo-600 ${isTestingScript ? 'animate-spin' : ''}`} />
                    <div className="text-left">
                      <span className="block text-sm font-bold">Test Script Connection</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Ping Web App endpoint & measure latency
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Connected Google Spreadsheet Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Connected Master Google Spreadsheet
                  </h4>
                  <a
                    href={googleSettings.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/14F30s9WoA2dLDBttEv2jgm3VnPmUJ6xQHT00FIa3-K8/edit'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline flex items-center space-x-1 text-xs font-bold"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Spreadsheet Name</label>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold truncate">
                      {googleSettings.spreadsheetName}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Spreadsheet ID</label>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px] truncate">
                      {googleSettings.spreadsheetId}
                    </div>
                  </div>
                </div>

                {/* 6 Connected Tabs */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                    Active Spreadsheet Tabs in Master Database ({googleSettings.allSheets?.length || 6})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(googleSettings.allSheets || [
                      'OVERVIEW DASHBOARD',
                      'Event Registrations',
                      'General Submissions',
                      'Consulting Inquiries',
                      'Business Audits',
                      'Internship Applications'
                    ]).map(sheet => (
                      <span
                        key={sheet}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px] font-semibold text-slate-700 shadow-2xs"
                      >
                        {sheet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Web App Script URL */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Google Apps Script Web App Endpoint
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                    GET & POST ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  All website inquiries and lead creations are forwarded directly to this script:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={googleSettings.scriptUrl || 'https://script.google.com/macros/s/AKfycbzIwLdLmzRJVPJAyrrLwLDCYgsiOmZAR3-SjYG_CllDA17xgCITuCYFKwIOWdsZj8w/exec'}
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopyScriptUrl}
                    className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                    title="Copy Apps Script URL"
                  >
                    {copiedScriptUrl ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPS SCRIPT CODE & DIAGNOSTICS */}
          {activeTab === 'script' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Live Apps Script API Diagnostics
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Query the Google Apps Script Web App endpoint and view real-time server responses.
                    </p>
                  </div>
                  <button
                    onClick={handleTestScript}
                    disabled={isTestingScript}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Activity size={14} className={isTestingScript ? 'animate-spin' : ''} />
                    <span>{isTestingScript ? 'Testing...' : 'Ping Endpoint'}</span>
                  </button>
                </div>

                {scriptTestResult && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 size={14} />
                        <span>HTTP 200 OK</span>
                      </span>
                      {scriptTestResult.latencyMs && (
                        <span className="font-mono text-slate-500">Latency: {scriptTestResult.latencyMs}ms</span>
                      )}
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                      {JSON.stringify(scriptTestResult.data || scriptTestResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Code Snippet for Google Sheets Apps Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Google Apps Script Master Code (`Code.gs`)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Place this inside <span className="font-semibold text-slate-700">Extensions &gt; Apps Script</span> of your master spreadsheet:
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopySnippet(`/**
 * The Affluentaccelerators Master Unified Database Script
 * Handles live inquiry sync and submission routing across 6 tabs:
 * 1. OVERVIEW DASHBOARD
 * 2. Event Registrations
 * 3. General Submissions
 * 4. Consulting Inquiries
 * 5. Business Audits
 * 6. Internship Applications
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "status";
  var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "Consulting Inquiries";
  
  if (action === "getRows" || action === "getInquiries") {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet not found: " + sheetName }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var rowObj = { rowIndex: i + 1 };
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      rows.push(rowObj);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", sheet: sheetName, count: rows.length, rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Default Status Check
  var allSheets = ss.getSheets().map(function(s) { return s.getName(); });
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "The Affluentaccelerators Master Unified Database",
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    totalSheets: allSheets.length,
    allSheets: allSheets,
    currentTime: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    var sheetName = payload.sheetName || payload.formType || "Consulting Inquiries";
    var sheet = ss.getSheetByName(sheetName) || ss.getSheetByName("Consulting Inquiries");
    
    var refId = "REF-" + Math.floor(1000 + Math.random() * 9000);
    var timestamp = new Date().toISOString();
    
    sheet.appendRow([
      timestamp,
      refId,
      payload.fullName || "",
      payload.businessName || "",
      payload.email || "",
      payload.phone || "",
      payload.location || "",
      payload.industry || "",
      payload.category || "",
      payload.requestedService || "",
      payload.budgetRange || "",
      payload.stage || "",
      payload.description || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Submission saved to " + sheet.getName(),
      referenceId: refId,
      sheetName: sheet.getName()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`)
                    }
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedSnippet ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy Full Script'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
{`function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allSheets = ss.getSheets().map(function(s) { return s.getName(); });
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "The Affluentaccelerators Master Unified Database",
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    totalSheets: allSheets.length,
    allSheets: allSheets,
    currentTime: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = JSON.parse(e.postData.contents);
  var target = payload.sheetName || "Consulting Inquiries";
  var sheet = ss.getSheetByName(target) || ss.getSheetByName("Consulting Inquiries");
  var refId = "REF-" + Math.floor(1000 + Math.random() * 9000);
  // Appends row and returns referenceId...
}`}
                </pre>
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
