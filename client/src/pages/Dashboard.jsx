import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
  ArrowRight,
  RefreshCw,
  Star,
  GitFork,
  Trash2,
  Folder,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRepositories = async () => {
    setLoadingRepos(true);
    try {
      const res = await api.get('/repositories');
      setRepos(res.data.repositories || []);
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setImporting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.post('/repositories/import', { url: repoUrl.trim() });
      if (res.data.success) {
        setSuccessMessage(`Successfully imported ${res.data.repository.fullName}!`);
        setRepoUrl('');
        await fetchRepositories();
        navigate(`/repository/${res.data.repository.id}`);
      }
    } catch (err) {
      setErrorMessage(
        err.customMessage || 'Failed to import repository. Please check URL or GitHub limits.'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteRepo = async (id, name, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm(`Are you sure you want to remove ${name} from your audit dashboard?`)) {
      return;
    }

    try {
      await api.delete(`/repositories/${id}`);
      setRepos((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.customMessage || 'Failed to delete repository');
    }
  };

  const handleSelectExample = (url) => {
    setRepoUrl(url);
    setErrorMessage('');
    setSuccessMessage('');
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
            Enter a public repository URL or shorthand (<code className="text-indigo-300">owner/repo</code>) to ingest its tree, parse dependencies, extract language distribution, and prepare for static analysis.
          </p>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled={importing}
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                placeholder="https://github.com/expressjs/express or owner/repo"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={importing || !repoUrl.trim()}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 shrink-0"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Ingesting GitHub Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Import & Analyze</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
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
              disabled={importing}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition font-mono text-[11px] disabled:opacity-50"
            >
              {ex.replace('https://github.com/', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Audited Repositories</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {repos.length} {repos.length === 1 ? 'Repository' : 'Repositories'} Indexed
          </span>
        </div>

        {loadingRepos ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs">Loading imported repositories...</p>
          </div>
        ) : repos.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 border-dashed space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/60 text-slate-400 flex items-center justify-center">
              <GitBranch className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">No Repositories Imported Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Provide a public repository URL above to fetch metadata, analyze directory structure, and inspect dependencies.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {repos.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/repository/${r.id}`)}
                className="group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 truncate">
                      {r.fullName}
                    </span>
                    <button
                      onClick={(e) => handleDeleteRepo(r.id, r.fullName, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition"
                      title="Delete repository"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {r.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>{r.primaryLanguage || 'Code'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        {r.stars?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-indigo-400" />
                        {r.forks?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{r.structure?.totalFiles || 0} files</span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition flex items-center gap-1">
                      <span>View Intelligence</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
