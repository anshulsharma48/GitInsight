import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RepositoryDetail from "./pages/RepositoryDetail";
import RepositoryAnalysis from "./pages/RepositoryAnalysis";
import RepositoryChat from "./pages/RepositoryChat";
import api from "./services/api";
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
  ArrowRight,
  Sparkles,
} from "lucide-react";

function HomeLanding() {
  const [repoInput, setRepoInput] = useState("");
  const navigate = useNavigate();

  const handleQuickAnalyze = (e) => {
    e.preventDefault();
    if (!repoInput.trim()) return;
    navigate("/dashboard", { state: { initialRepo: repoInput.trim() } });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/90 border border-slate-800 text-slate-300 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {/* <span>AI-Powered Repository Intelligence & Code Review</span> */}
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          GitHub Repository Analysis, <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Code Review & Security Scanning
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Instantly understand architecture, inspect code quality, find security
          vulnerabilities, and chat with any GitHub repository.
        </p>

        {/* Search / Input Box - RepoMind Style */}
        <div className="max-w-2xl mx-auto pt-4">
          <form
            onSubmit={handleQuickAnalyze}
            className="relative flex items-center"
          >
            <Search className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="Enter public repository (e.g. expressjs/express or full GitHub URL)"
              className="w-full pl-12 pr-32 py-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xl transition"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3 hover:border-indigo-500/40 transition group">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Architecture & Code Insights
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatic directory breakdown, dependency mapping, and module
            relationship detection for rapid developer onboarding.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3 hover:border-emerald-500/40 transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Security & Code Quality
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deterministic 0-100 repository health score, security audits, secret
            leakage checks, and quality flags.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3 hover:border-violet-500/40 transition group">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 text-violet-400 flex items-center justify-center transition">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Codebase AI Chat & RAG
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ask technical questions about the codebase with exact file and line
            citations grounded directly in repository source code.
          </p>
        </div>
      </div>

      {/* How It Works Section (RepoMind-style workflow breakdown) */}
      <div className="space-y-8 pt-8 border-t border-slate-800/80">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Streamlined Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How GitInsight Audits Codebases
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            From raw GitHub URL to structured architecture diagrams, security
            findings, and grounded chat in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              01
            </span>
            <h4 className="text-sm font-semibold text-white">
              Import Repository
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fetches repository metadata, dependency graphs, commits, and full
              file trees via GitHub REST API.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              02
            </span>
            <h4 className="text-sm font-semibold text-white">
              Static Analysis
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executes rule-based checks across 6 dimensions: Quality, Security,
              Docs, Architecture, Tests, and Maintenance.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              03
            </span>
            <h4 className="text-sm font-semibold text-white">
              Deterministic Scoring
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes a transparent 0-100 repository health score with
              actionable severity-ranked findings.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              04
            </span>
             <h4 className="text-sm font-semibold text-white">RAG Code Chat</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Indexes code into chunked embeddings. Answers questions grounded
              in retrieved code with exact line references.
            </p> 
          </div>
        </div>
      </div>

      {/* Trust & Academic Project Callout */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">
            Ready to inspect your project's repository?
          </h3>
          <p className="text-xs text-slate-400">
            Audit dependencies, verify security hygiene, and chat with your
            codebase immediately.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
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
            GitInsight &bull; GitHub Repository Intelligence Platform
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
