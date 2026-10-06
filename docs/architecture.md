# GitInsight Architecture Specification

## 1. Overview
GitInsight is an AI-powered GitHub repository intelligence platform that automates repository auditing, static code quality and security scanning, deterministic health scoring, and grounded retrieval-augmented chat (RAG).

## 2. High-Level Architecture

```text
                    USER
                      │
                      ▼
              React Frontend (Vite + Tailwind)
                      │
                  REST API (JSON / JWT)
                      │
                      ▼
              Node.js / Express Server
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
   MongoDB        GitHub API     AI / RAG Services
  (Mongoose)     (REST v3)     (Gemini / Vector Store)
```

## 3. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Axios, React Router, Recharts, Lucide Icons.
- **Backend**: Node.js v24, Express.js, Mongoose, JWT, bcryptjs, Morgan.
- **Database**: MongoDB (Supports standard URI and zero-config in-memory embedded fallback for seamless local onboarding).
- **Static Analysis**: ESLint, Semgrep rules (deterministic pattern extraction).
- **AI / LLM**: Google Gemini API (cost-efficient, free tier, zero ₹ target).
- **RAG / Vector DB**: Semantic embeddings, local vector index with source-code line-level attribution.

## 4. Separation of Concerns: Deterministic vs. Generative AI
- **Deterministic**: File counts, commits, language distribution, dependency vulnerabilities, ESLint/Semgrep findings, health score calculation (0–100).
- **AI**: Synthesis, architectural summaries, natural language explanation of findings, onboarding roadmaps, and RAG Q&A grounded strictly in indexed files.
