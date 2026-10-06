# GitInsight — AI-Powered GitHub Repository Intelligence Platform

GitInsight is a full-stack MERN application that provides automated repository auditing, static code quality and security scanning, deterministic health scoring, and grounded retrieval-augmented chat (RAG) for GitHub repositories.

---

## 🚀 Key Features (Planned & In-Progress)

1. **Repository Import & Ingestion**: Ingest public GitHub repositories, extract directory trees, README, language statistics, and dependency manifests via GitHub REST API.
2. **Static Code Analysis**: Automated rule-based static quality analysis using ESLint and Semgrep.
3. **Deterministic Health Score**: Transparent 0–100 repository health metric calculated strictly from deterministic heuristics (code quality, testing indicators, documentation, security, maintainability).
4. **AI-Powered Explanations**: Grounded repository summaries, architectural overviews, and onboarding roadmaps using Google Gemini.
5. **Semantic RAG & Code Chat**: Vector embeddings and semantic retrieval to answer natural-language developer questions with file and line-level source citations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Axios, React Router, Recharts, Lucide React
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs, Morgan
- **Database**: MongoDB (Supports standard MongoDB instance or auto-configured embedded fallback)
- **AI & RAG**: Google Gemini API, Semantic Embeddings, Vector Storage

---

## 📁 Project Structure

```text
gitinsight/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Global context (Auth, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route view pages
│   │   ├── services/           # Axios API client
│   │   ├── utils/              # Client utility helpers
│   │   ├── App.jsx             # Main App component
│   │   └── main.jsx            # React root entry
│   └── vite.config.js          # Vite config & API proxy
├── server/                     # Express.js REST API Backend
│   ├── analyzers/              # Deterministic code & repo analyzers
│   ├── config/                 # DB & environment configuration
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Auth, validation, & error handling
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/               # GitHub, AI, and RAG services
│   ├── utils/                  # Backend helpers & loggers
│   └── server.js               # Express application entry
├── docs/                       # Architecture & development logs
├── .env.example                # Example environment variables
└── README.md
```

---

## ⚡ Getting Started Locally

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+
- *(Optional)* **MongoDB** (If not running, the backend automatically uses an embedded local in-memory MongoDB instance for zero-configuration testing)

### 2. Installation

Clone or open the repository directory:
```bash
cd gitinsight
```

Install backend dependencies:
```bash
cd server
npm install
cd ..
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Running the Application

In terminal 1 (start the Backend Server on `http://localhost:5000`):
```bash
npm run server
```

In terminal 2 (start the Frontend Client on `http://localhost:5173`):
```bash
npm run client
```

Open `http://localhost:5173` in your browser.
