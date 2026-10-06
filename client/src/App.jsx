import React, { useState, useEffect } from 'react';
import api from './services/api';
import {
  Activity,
  Database,
  Server,
  GitBranch,
  ShieldCheck,
  Cpu,
  Terminal,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Code2,
  Search,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setHealth(res.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.customMessage || 'Failed to connect to backend server');
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                GitInsight
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                AI Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{loading ? 'Checking...' : 'Refresh Status'}</span>
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${health?.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-400">
                Backend: <strong className={health?.status === 'ok' ? 'text-emerald-400' : 'text-rose-400'}>{health?.status === 'ok' ? 'Online' : 'Offline'}</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>MERN Stack + Static Code Analysis + RAG Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            GitHub Repository Intelligence, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Powered by AI & Semantic RAG
            </span>
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Automated repository audits, static code quality and security scanning,
            deterministic health scoring, and grounded retrieval-augmented chat.
          </p>
        </div>

        {/* System Health Diagnostics Card */}
        <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-100">
                Phase 1 System Health & Communication Status
              </h2>
            </div>
            {lastChecked && (
              <span className="text-xs text-slate-500">
                Last checked: {lastChecked}
              </span>
            )}
          </div>

          {loading && !health ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-500" />
              <p className="text-sm">Connecting to Express API and verifying MongoDB...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Backend Connection Failed</p>
                <p className="text-xs text-rose-300/80 mt-1">{error}</p>
                <p className="text-xs text-slate-400 mt-2">Ensure the backend server is running on port 5000.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Service Status */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">API Service</span>
                  <Server className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">{health?.service}</span>
                  <span className="text-xs text-emerald-400 font-medium">v{health?.version}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>HTTP 200 OK</span>
                </div>
              </div>

              {/* Database Status */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Database</span>
                  <Database className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold capitalize text-white">{health?.database?.status}</span>
                </div>
                <p className="text-xs text-slate-400 truncate" title={health?.database?.name}>
                  DB: <span className="text-slate-300 font-mono">{health?.database?.name}</span>
                </p>
              </div>

              {/* Runtime Environment */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Runtime</span>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">{health?.system?.nodeVersion}</span>
                  <span className="text-xs text-slate-400 uppercase">{health?.system?.platform}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Heap: <span className="text-slate-300 font-mono">{health?.system?.memoryUsageMB} MB</span>
                </p>
              </div>

              {/* Uptime */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Uptime</span>
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">{health?.uptime}s</span>
                </div>
                <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Healthy & Responsive</span>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Feature Roadmap & Architecture Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              GitInsight Architectural Modules
            </h2>
            <span className="text-xs text-slate-500">Autonomous Roadmap</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Phase 1 */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-emerald-500/30 relative overflow-hidden group">
              <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                COMPLETE (Phase 1)
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Full-Stack Core & MongoDB</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Vite React frontend communicating with Express backend. Resilient MongoDB connector with zero-config memory fallback.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                NEXT (Phase 2)
              </div>
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Authentication & JWT Security</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                User registration, bcrypt password hashing, JWT token issuance, protected routes, and user profile management.
              </p>
            </div>

            {/* Phase 3 & 4 */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">GitHub API Repository Import</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                URL extraction, repository metadata, recursive file tree retrieval, README parsing, and language distribution.
              </p>
            </div>

            {/* Phase 6 & 7 */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Static Analysis & Health Scoring</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Deterministic health scoring (0-100), automated ESLint rules, Semgrep security scans, and weighted quality metrics.
              </p>
            </div>

            {/* Phase 8 */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">AI Explanations & Summaries</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Interpretation of static findings, developer onboarding roadmaps, and actionable code quality recommendations.
              </p>
            </div>

            {/* Phase 9 & 10 */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Semantic RAG & Repo Chat</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                File chunking, vector embeddings, semantic retrieval, and natural language Q&A with exact source code references.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        GitInsight &bull; MCA Capstone Project &bull; Full-Stack AI & MERN
      </footer>
    </div>
  );
}
