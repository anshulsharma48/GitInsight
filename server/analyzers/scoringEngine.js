import { analyzeCodeQuality } from './quality/codeQualityAnalyzer.js';
import { analyzeSecurity } from './security/securityAnalyzer.js';

/**
 * Deterministic Health Scoring Engine
 * Computes an explainable 0–100 health score derived from explicit rule weights.
 * NO LLM hallucinations are used for scoring.
 */
export const runDeterministicAnalysis = (repo) => {
  const allFindings = [];
  const files = repo.structure?.fileTree || [];

  // 1. Code Quality Analysis (Weight: 20%)
  const qualityResult = analyzeCodeQuality(repo);
  allFindings.push(...qualityResult.findings);
  const codeQualityScore = qualityResult.score;

  // 2. Security Analysis (Weight: 20%)
  const securityResult = analyzeSecurity(repo);
  allFindings.push(...securityResult.findings);
  const securityScore = securityResult.score;

  // 3. Documentation Analysis (Weight: 15%)
  let documentationScore = 20;
  if (repo.readme?.exists) {
    documentationScore += 40;
    if (repo.readme.content?.length > 1000) {
      documentationScore += 20;
    }
  } else {
    allFindings.push({
      type: 'documentation',
      severity: 'medium',
      file: 'README.md',
      line: 1,
      rule: 'docs/missing-readme',
      message: 'No README documentation found in the repository.',
      source: 'static-analyzer',
    });
  }

  if (repo.license && repo.license !== 'None') {
    documentationScore += 20;
  } else {
    allFindings.push({
      type: 'documentation',
      severity: 'low',
      file: 'LICENSE',
      line: 1,
      rule: 'docs/missing-license',
      message: 'No open-source software license detected.',
      source: 'static-analyzer',
    });
  }
  documentationScore = Math.min(100, documentationScore);

  // 4. Maintainability Analysis (Weight: 15%)
  let maintainabilityScore = 40;
  if (repo.primaryLanguage && repo.primaryLanguage !== 'Unknown') maintainabilityScore += 25;
  if (repo.recentCommits && repo.recentCommits.length > 0) maintainabilityScore += 20;
  if (files.length > 0 && files.length < 5000) maintainabilityScore += 15;
  maintainabilityScore = Math.min(100, maintainabilityScore);

  // 5. Architecture Analysis (Weight: 15%)
  let architectureScore = 30;
  const keyDirs = repo.structure?.keyDirectories || [];
  if (keyDirs.length >= 3) {
    architectureScore += 40;
  } else if (keyDirs.length >= 1) {
    architectureScore += 25;
  }

  if (repo.dependencies?.hasPackageJson) architectureScore += 30;
  architectureScore = Math.min(100, architectureScore);

  // 6. Testing Indicators Analysis (Weight: 15%)
  let testingScore = 20;
  const testFiles = files.filter((f) =>
    /(?:^|\/)(?:test|tests|__tests__|spec)\/|\.(?:test|spec)\.[a-zA-Z0-9]+$/i.test(f.path)
  );

  const testFrameworks = ['jest', 'mocha', 'vitest', 'ava', 'tape', 'supertest', 'cypress', 'playwright'];
  const allDeps = [
    ...(repo.dependencies?.runtime || []).map((d) => d.name),
    ...(repo.dependencies?.dev || []).map((d) => d.name),
  ];
  const hasTestFramework = allDeps.some((dep) => testFrameworks.includes(dep.toLowerCase()));

  if (testFiles.length > 0) {
    testingScore += 40;
    if (testFiles.length >= 5) testingScore += 15;
  } else {
    allFindings.push({
      type: 'testing',
      severity: 'medium',
      file: 'Tests',
      line: 1,
      rule: 'testing/missing-test-files',
      message: 'No automated unit or integration test files detected in repository tree.',
      source: 'static-analyzer',
    });
  }

  if (hasTestFramework) {
    testingScore += 25;
  }

  testingScore = Math.min(100, testingScore);

  // Calculate overall weighted score (0-100)
  const healthScore = Math.round(
    codeQualityScore * 0.20 +
    securityScore * 0.20 +
    documentationScore * 0.15 +
    maintainabilityScore * 0.15 +
    architectureScore * 0.15 +
    testingScore * 0.15
  );

  return {
    healthScore,
    categories: {
      codeQuality: codeQualityScore,
      security: securityScore,
      documentation: documentationScore,
      maintainability: maintainabilityScore,
      architecture: architectureScore,
      testing: testingScore,
    },
    findings: allFindings,
    metrics: {
      totalFiles: files.length,
      testFiles: testFiles.length,
      hasReadme: !!repo.readme?.exists,
      hasLicense: repo.license !== 'None',
      dependenciesCount: (repo.dependencies?.runtime?.length || 0) + (repo.dependencies?.dev?.length || 0),
      detectedPatternsCount: allFindings.length,
    },
  };
};
