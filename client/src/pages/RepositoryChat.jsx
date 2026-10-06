import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  MessageSquare,
  Send,
  RefreshCw,
  ArrowLeft,
  FileCode,
  Sparkles,
  Bot,
  User,
  Database,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function RepositoryChat() {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am your GitInsight repository intelligence assistant. I can answer questions grounded strictly in this codebase with line-level source citations. What would you like to explore?',
      sources: [],
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexStatus, setIndexStatus] = useState('');
  const [expandedSourceIndex, setExpandedSourceIndex] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await api.get(`/repositories/${id}`);
        setRepo(res.data.repository);
      } catch (err) {
        console.error('Failed to load repository:', err);
      }
    };
    fetchRepo();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleIndexRepo = async () => {
    setIndexing(true);
    setIndexStatus('Indexing key repository files for semantic RAG...');
    try {
      const res = await api.post(`/repositories/${id}/index`);
      setIndexStatus(res.data.message || 'Indexing completed successfully.');
    } catch (err) {
      setIndexStatus('Indexing failed. Please check network.');
    } finally {
      setIndexing(false);
    }
  };

  const handleSend = async (questionText) => {
    const query = questionText || inputQuestion;
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await api.post(`/repositories/${id}/chat`, { question: query.trim() });
      const botMessage = {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources || [],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content:
          err.customMessage ||
          'Failed to retrieve answer. Please make sure the repository has been indexed.',
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/repository/${id}`}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Grounded Code Chat &bull; {repo?.fullName || 'Repository'}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Retrieval-Augmented Generation (RAG) with file and line-level citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleIndexRepo}
            disabled={indexing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition disabled:opacity-50"
            title="Index or re-index code chunks"
          >
            <Database className={`w-3.5 h-3.5 ${indexing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span>{indexing ? 'Indexing...' : 'Index Code'}</span>
          </button>
        </div>
      </div>

      {indexStatus && (
        <div className="my-2 p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center justify-between">
          <span>{indexStatus}</span>
          <button onClick={() => setIndexStatus('')} className="text-slate-500 hover:text-white">&times;</button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Cited Source References ({msg.sources.length}):</span>
                  </div>

                  <div className="space-y-1.5">
                    {msg.sources.map((s, idx) => {
                      const isExpanded = expandedSourceIndex === `${i}-${idx}`;
                      return (
                        <div
                          key={idx}
                          className="rounded-lg bg-slate-950/80 border border-slate-800/80 overflow-hidden text-[11px]"
                        >
                          <div
                            onClick={() =>
                              setExpandedSourceIndex(isExpanded ? null : `${i}-${idx}`)
                            }
                            className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition"
                          >
                            <span className="font-mono text-indigo-300 font-medium truncate">
                              {s.file} (L{s.startLine}&ndash;L{s.endLine})
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </div>

                          {isExpanded && s.snippet && (
                            <pre className="p-2.5 font-mono text-[10px] text-slate-400 bg-black/40 border-t border-slate-800/60 overflow-x-auto whitespace-pre-wrap">
                              {s.snippet}...
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Retrieving relevant code chunks & grounding response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="py-2 flex flex-wrap gap-1.5 shrink-0">
        {[
          'Where is routing implemented?',
          'How does error handling work?',
          'What are the core dependencies?',
        ].map((promptText) => (
          <button
            key={promptText}
            onClick={() => handleSend(promptText)}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-slate-200 border border-slate-800 transition disabled:opacity-50"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 shrink-0 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask a technical question about this repository's code..."
          disabled={loading}
          className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputQuestion.trim()}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
