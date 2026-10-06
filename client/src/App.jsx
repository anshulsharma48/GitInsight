import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RepositoryDetail from './pages/RepositoryDetail';
import RepositoryAnalysis from './pages/RepositoryAnalysis';
import RepositoryChat from './pages/RepositoryChat';
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
  MessageSquare,
  ArrowRight
} from 'lucide-react';

function HomeLanding() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
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
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>

      {/* System Health Diagnostics Card */}
      <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">
              System Health & Diagnostics Status
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {lastChecked && (
              <span className="text-xs text-slate-500">
                Last checked: {lastChecked}
              </span>
            )}
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
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

      {/* Feature Modules Overview */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          Core Platform Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">JWT Secure Authentication</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bcrypt password hashing with salted rounds and signed JSON Web Tokens for stateless session security.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Static Analysis & Health Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated rule checks, ESLint/Semgrep findings, and transparent 0-100 health metrics.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-1">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">RAG Repository Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Code chunking, embeddings, vector indexing, and AI Q&A with exact line-level references.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomeLanding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repository/:id"
                element={
                  <ProtectedRoute>
                    <RepositoryDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repository/:id/analysis"
                element={
                  <ProtectedRoute>
                    <RepositoryAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repository/:id/chat"
                element={
                  <ProtectedRoute>
                    <RepositoryChat />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
            GitInsight &bull; MCA Capstone Project &bull; Full-Stack AI & MERN
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
