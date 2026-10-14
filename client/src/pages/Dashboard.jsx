import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [repoUrl, setRepoUrl] = useState(location.state?.initialRepo || '');
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
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a GitHub repository URL or owner/repo format.');
      return;
    }

    // Validation: check for valid GitHub URL or owner/repo format
    const isValidFormat = 
      /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i.test(trimmed) ||
      /^[\w.-]+\/[\w.-]+$/.test(trimmed);

    if (!isValidFormat) {
      setErrorMessage('Invalid repository format. Please enter either "owner/repo" (e.g. expressjs/express) or a valid GitHub URL.');
      return;
    }

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Streamlined Import Section - RepoMind Style */}
      <div className="text-center space-y-4 pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Analyze Any <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">GitHub Repository</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Enter a public repository to inspect architecture, code quality, security risks, and run AI chat.
        </p>

        <form onSubmit={handleImportSubmit} className="max-w-2xl mx-auto pt-2">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              disabled={importing}
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              placeholder="e.g. expressjs/express or https://github.com/facebook/react"
              className="w-full pl-12 pr-36 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xl transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={importing || !repoUrl.trim()}
              className="absolute right-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Examples */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500">Try:</span>
            {['expressjs/express', 'axios/axios', 'facebook/react'].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleSelectExample(`https://github.com/${ex}`)}
                disabled={importing}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition font-mono text-[11px] disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </form>
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
