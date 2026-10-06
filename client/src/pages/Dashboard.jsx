import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GitBranch,
  Search,
  ExternalLink,
  ShieldCheck,
  Code2,
  FileText,
  AlertTriangle,
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    // Ready for Phase 3 ingestion!
    setErrorMessage('Phase 3 Repository Ingestion is coming up next! Ready to connect GitHub REST API.');
  };

  const handleSelectExample = (url) => {
    setRepoUrl(url);
    setErrorMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Session Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Authenticated Session Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-indigo-400">{user?.name}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Account: <span className="font-mono text-slate-300">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-0.5">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Security Token</div>
            <div className="text-emerald-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JWT Verified (7d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Repository Import Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <GitBranch className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">Import Public GitHub Repository</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter a public repository URL to fetch metadata, analyze directory structure, run static analysis, and index code for AI RAG questions.
          </p>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="https://github.com/facebook/react or owner/repo"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={importing || !repoUrl.trim()}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Import & Analyze</span>
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-2.5">
              {errorMessage}
            </p>
          )}
        </form>

        {/* Quick Example Repositories */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Try public examples:</span>
          {['https://github.com/expressjs/express', 'https://github.com/axios/axios', 'https://github.com/facebook/react'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleSelectExample(ex)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition font-mono text-[11px]"
            >
              {ex.replace('https://github.com/', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories List / Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Audited Repositories</span>
          </h3>
          <span className="text-xs text-slate-500">0 Repositories Indexed</span>
        </div>

        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 border-dashed space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/60 text-slate-400 flex items-center justify-center">
            <GitBranch className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">No Repositories Imported Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Provide a GitHub URL above to trigger the ingestion pipeline in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}
