import { GoogleGenAI } from '@google/genai';

/**
 * Initialize Google GenAI client if GEMINI_API_KEY is configured
 */
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate an AI summary grounded in actual repository facts
 */
export const generateRepositorySummary = async (repo, analysis) => {
  const client = getGeminiClient();

  // If Gemini API Key is available, invoke Gemini
  if (client) {
    try {
      const prompt = `You are a Principal Software Architect analyzing a GitHub repository.
Provide a concise, 2-3 paragraph architectural summary grounded strictly in these factual details:
Repository Name: ${repo.fullName}
Description: ${repo.description}
Primary Language: ${repo.primaryLanguage}
Languages: ${repo.languages?.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}
Key Directories Detected: ${repo.structure?.keyDirectories?.join(', ') || 'Standard structure'}
Total Files: ${repo.structure?.totalFiles}
Health Score: ${analysis?.healthScore}/100
Dependencies: ${repo.dependencies?.runtime?.map((d) => d.name).slice(0, 15).join(', ')}

Do NOT invent files or features not mentioned. Focus on architecture, stack design, and purpose.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn('Gemini API call failed, falling back to grounded heuristic summary:', error.message);
    }
  }

  // Grounded heuristic summary (₹0 fallback guaranteeing 100% uptime)
  const langSummary = repo.languages?.length
    ? repo.languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')
    : repo.primaryLanguage;

  const keyDirs = repo.structure?.keyDirectories?.length
    ? `Organized around key modules including ${repo.structure.keyDirectories.map((d) => `${d}/`).join(', ')}.`
    : 'Uses a flat structure with standard root manifests.';

  const depCount = repo.dependencies?.runtime?.length || 0;

  return `${repo.fullName} is an open-source project primarily written in ${repo.primaryLanguage}. Its language composition consists of ${langSummary}. ${keyDirs}

The repository currently indexes ${repo.structure?.totalFiles || 0} files across ${repo.structure?.totalDirs || 0} directories and manages ${depCount} runtime dependencies via ${repo.dependencies?.packageManager || 'npm'}. Automated static inspection calculated an overall repository health score of ${analysis?.healthScore ?? 80}/100, reflecting code quality, documentation, testing, and security posture.`;
};

/**
 * Generate actionable improvements based on static findings
 */
export const generateRecommendations = async (repo, analysis) => {
  const client = getGeminiClient();
  const findings = analysis.findings || [];

  if (client && findings.length > 0) {
    try {
      const prompt = `Based on these static analysis findings for repository ${repo.fullName}, generate 4 concrete, prioritized recommendations for developers:
Findings:
${findings.slice(0, 8).map((f) => `- [${f.severity.toUpperCase()}] ${f.file}: ${f.message}`).join('\n')}

Format as a JSON array of strings: ["rec 1", "rec 2", "rec 3", "rec 4"]`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const cleaned = response.text?.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      console.warn('Gemini recommendations fallback:', err.message);
    }
  }

  // Grounded heuristic recommendations derived directly from findings
  const recs = [];
  if (findings.some((f) => f.type === 'testing')) {
    recs.push('Establish automated unit and integration tests (e.g. Jest or Vitest) to improve regression coverage.');
  }
  if (findings.some((f) => f.rule === 'security/missing-lockfile')) {
    recs.push('Commit a lockfile (package-lock.json / yarn.lock) to secure deterministic dependency builds.');
  }
  if (findings.some((f) => f.rule === 'quality/excessive-file-size')) {
    recs.push('Modularize large files into targeted sub-modules to improve maintainability and bundle size.');
  }
  if (!repo.readme?.exists) {
    recs.push('Add a comprehensive README.md with setup instructions, prerequisites, and API usage.');
  }
  if (recs.length < 3) {
    recs.push('Implement automated CI/CD static linting checks (e.g. ESLint and Prettier) in GitHub Actions.');
    recs.push('Audit runtime dependencies regularly with npm audit to patch known CVE vulnerabilities.');
  }

  return recs.slice(0, 5);
};

/**
 * Generate developer onboarding guide
 */
export const generateOnboardingGuide = async (repo) => {
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `Generate a structured developer onboarding guide for repository ${repo.fullName}.
Primary language: ${repo.primaryLanguage}
Directories: ${repo.structure?.keyDirectories?.join(', ') || 'Standard'}
Dependencies: ${repo.dependencies?.runtime?.map((d) => d.name).slice(0, 10).join(', ')}

Return a JSON object with keys: overview, techStack, architecture, gettingStarted`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const cleaned = response.text?.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.overview) return parsed;
    } catch (err) {
      console.warn('Gemini onboarding fallback:', err.message);
    }
  }

  return {
    overview: `Welcome to ${repo.fullName}. This project is built primarily in ${repo.primaryLanguage} and provides software services defined across its ${repo.structure?.totalFiles || 0} source files.`,
    techStack: `Core Language: ${repo.primaryLanguage}. Package Manager: ${repo.dependencies?.packageManager || 'npm'}. Dependencies include ${repo.dependencies?.runtime?.slice(0, 5).map((d) => d.name).join(', ') || 'standard utilities'}.`,
    architecture: `Modular architecture organized under ${repo.structure?.keyDirectories?.join(', ') || 'root structure'}.`,
    gettingStarted: `1. Clone repository: git clone ${repo.githubUrl}\n2. Install dependencies: npm install\n3. Run development mode: npm start / npm run dev`,
  };
};
