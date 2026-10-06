import axios from 'axios';

/**
 * Configure GitHub API client with optional personal access token
 */
const getGitHubClient = () => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitInsight-Platform/1.0',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return axios.create({
    baseURL: 'https://api.github.com',
    headers,
    timeout: 15000,
  });
};

/**
 * Parse and validate GitHub URL or "owner/repo" shorthand.
 * @param {string} input - URL or shorthand
 * @returns {{ owner: string, repo: string }}
 */
export const parseGitHubUrl = (input) => {
  if (!input || typeof input !== 'string') {
    throw new Error('Please provide a valid GitHub repository URL.');
  }

  const cleanInput = input.trim();

  // Pattern: owner/repo
  const shorthandMatch = cleanInput.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shorthandMatch) {
    return {
      owner: shorthandMatch[1],
      repo: shorthandMatch[2].replace(/\.git$/, ''),
    };
  }

  // Pattern: https://github.com/owner/repo(.git)?(/)?
  const urlMatch = cleanInput.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$/
  );

  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/, ''),
    };
  }

  throw new Error(
    'Invalid GitHub repository format. Use "https://github.com/owner/repo" or "owner/repo".'
  );
};

/**
 * Handle and normalize GitHub API errors
 */
const handleGitHubError = (error, context) => {
  if (error.response) {
    const status = error.response.status;
    const msg = error.response.data?.message || '';

    if (status === 404) {
      throw new Error(`Repository not found on GitHub. Verify the URL and ensure the repository is public.`);
    }
    if (status === 403 || status === 429) {
      if (msg.toLowerCase().includes('rate limit')) {
        throw new Error(
          'GitHub API rate limit exceeded. Set a GITHUB_TOKEN in your environment or wait for reset.'
        );
      }
      throw new Error(`GitHub access forbidden: ${msg || 'Forbidden'}`);
    }
    throw new Error(`GitHub API error (${status}): ${msg || error.message}`);
  }
  throw new Error(`Failed to connect to GitHub API: ${error.message}`);
};

/**
 * Fetch complete repository metadata from GitHub REST API
 */
export const fetchRepositoryDetails = async (owner, repo) => {
  const client = getGitHubClient();

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}`);
    return {
      name: data.name,
      owner: data.owner.login,
      fullName: data.full_name,
      githubUrl: data.html_url,
      description: data.description || 'No description provided.',
      defaultBranch: data.default_branch || 'main',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      watchers: data.watchers_count || 0,
      license: data.license?.spdx_id || data.license?.name || 'None',
      primaryLanguage: data.language || 'Unknown',
      isFork: data.fork,
      isArchived: data.archived,
      sizeKB: data.size,
    };
  } catch (error) {
    handleGitHubError(error, 'fetching repository details');
  }
};

/**
 * Fetch and calculate language breakdown percentages
 */
export const fetchRepositoryLanguages = async (owner, repo) => {
  const client = getGitHubClient();

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/languages`);
    const totalBytes = Object.values(data).reduce((acc, bytes) => acc + bytes, 0);

    if (totalBytes === 0) {
      return [];
    }

    const languageList = Object.entries(data).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10, // 1 decimal place e.g. 74.5%
    }));

    // Sort descending by bytes
    languageList.sort((a, b) => b.bytes - a.bytes);
    return languageList;
  } catch (error) {
    console.warn(`Failed to fetch languages for ${owner}/${repo}:`, error.message);
    return [];
  }
};

/**
 * Fetch recursive file tree and analyze directory structure
 */
export const fetchRepositoryFileTree = async (owner, repo, defaultBranch = 'main') => {
  const client = getGitHubClient();

  try {
    const { data } = await client.get(
      `/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
    );

    if (!data.tree || !Array.isArray(data.tree)) {
      return { totalFiles: 0, totalDirs: 0, fileTree: [], keyDirectories: [] };
    }

    // Filter out internal and noise files
    const validNodes = data.tree.filter((node) => {
      const p = node.path;
      return (
        !p.startsWith('.git/') &&
        !p.includes('/.git/') &&
        !p.startsWith('node_modules/') &&
        !p.includes('/node_modules/') &&
        !p.startsWith('dist/') &&
        !p.startsWith('build/') &&
        !p.endsWith('.DS_Store')
      );
    });

    const fileNodes = validNodes.filter((n) => n.type === 'blob');
    const dirNodes = validNodes.filter((n) => n.type === 'tree');

    // Detect key architectural directories
    const candidateDirs = [
      'src',
      'client',
      'server',
      'components',
      'controllers',
      'models',
      'routes',
      'services',
      'middleware',
      'utils',
      'api',
      'lib',
      'pages',
      'tests',
      'docs',
    ];

    const detectedKeyDirs = candidateDirs.filter((candidate) =>
      dirNodes.some(
        (d) =>
          d.path === candidate ||
          d.path.startsWith(`${candidate}/`) ||
          d.path.endsWith(`/${candidate}`)
      )
    );

    // Limit stored fileTree to 1,000 files to prevent unbounded MongoDB document growth
    const sanitizedTree = fileNodes.slice(0, 1000).map((f) => ({
      path: f.path,
      type: f.type,
      size: f.size || 0,
    }));

    return {
      totalFiles: fileNodes.length,
      totalDirs: dirNodes.length,
      fileTree: sanitizedTree,
      keyDirectories: [...new Set(detectedKeyDirs)],
    };
  } catch (error) {
    console.warn(`Could not fetch git tree for ${owner}/${repo}:`, error.message);
    return { totalFiles: 0, totalDirs: 0, fileTree: [], keyDirectories: [] };
  }
};

/**
 * Fetch and decode README content
 */
export const fetchRepositoryReadme = async (owner, repo) => {
  const client = getGitHubClient();

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/readme`);
    if (data.content && data.encoding === 'base64') {
      const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');
      return {
        exists: true,
        content: decodedContent.slice(0, 50000), // Cap at 50KB to keep documents lean
      };
    }
    return { exists: false, content: '' };
  } catch (error) {
    // 404 means no README exists in repo
    return { exists: false, content: '' };
  }
};

/**
 * Fetch and parse package.json dependencies (root or server/client)
 */
export const fetchRepositoryDependencies = async (owner, repo) => {
  const client = getGitHubClient();

  const searchPaths = ['package.json', 'server/package.json', 'client/package.json'];

  for (const p of searchPaths) {
    try {
      const { data } = await client.get(`/repos/${owner}/${repo}/contents/${p}`);
      if (data.content && data.encoding === 'base64') {
        const rawJson = Buffer.from(data.content, 'base64').toString('utf8');
        const pkg = JSON.parse(rawJson);

        const runtime = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
          name,
          version: String(version),
        }));

        const dev = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
          name,
          version: String(version),
        }));

        return {
          hasPackageJson: true,
          packageManager: pkg.packageManager ? pkg.packageManager.split('@')[0] : 'npm',
          runtime,
          dev,
        };
      }
    } catch {
      // Continue checking next path
    }
  }

  return {
    hasPackageJson: false,
    packageManager: 'unknown',
    runtime: [],
    dev: [],
  };
};

/**
 * Fetch recent commits for freshness evaluation
 */
export const fetchRecentCommits = async (owner, repo) => {
  const client = getGitHubClient();

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/commits`, {
      params: { per_page: 5 },
    });

    return data.map((item) => ({
      sha: item.sha.substring(0, 7),
      message: item.commit.message?.split('\n')[0] || 'No commit message',
      author: item.commit.author?.name || item.author?.login || 'Unknown',
      date: item.commit.author?.date ? new Date(item.commit.author.date) : new Date(),
    }));
  } catch (error) {
    console.warn(`Failed to fetch commits for ${owner}/${repo}:`, error.message);
    return [];
  }
};
