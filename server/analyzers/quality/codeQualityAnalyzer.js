/**
 * Deterministic Code Quality Analyzer
 * Evaluates file distribution, file sizes, structural complexity, and naming standards.
 */
export const analyzeCodeQuality = (repo) => {
  const findings = [];
  const files = repo.structure?.fileTree || [];

  let largeFilesCount = 0;
  let deeplyNestedCount = 0;

  files.forEach((f) => {
    // 1. Check for excessively large files (> 300KB in source tree)
    if (f.size > 300 * 1024) {
      largeFilesCount++;
      findings.push({
        type: 'quality',
        severity: 'medium',
        file: f.path,
        line: 1,
        rule: 'quality/excessive-file-size',
        message: `File size is ${(f.size / 1024).toFixed(1)} KB. Consider modularizing or storing large assets externally.`,
        source: 'static-analyzer',
      });
    }

    // 2. Check for deep directory nesting (> 5 levels)
    const depth = f.path.split('/').length - 1;
    if (depth > 5) {
      deeplyNestedCount++;
      if (deeplyNestedCount <= 5) {
        findings.push({
          type: 'quality',
          severity: 'low',
          file: f.path,
          line: 1,
          rule: 'quality/deep-nesting',
          message: `Deep nesting detected (${depth} levels). Can hinder code discoverability and readability.`,
          source: 'static-analyzer',
        });
      }
    }
  });

  // Check if repository has clear file structure
  const hasSrcOrLib = files.some(
    (f) => f.path.startsWith('src/') || f.path.startsWith('lib/') || f.path.startsWith('server/')
  );

  if (!hasSrcOrLib && files.length > 10) {
    findings.push({
      type: 'quality',
      severity: 'medium',
      file: 'Root',
      line: 1,
      rule: 'quality/unstructured-root',
      message: 'Source files appear flatly located in root rather than organized under src/ or lib/.',
      source: 'static-analyzer',
    });
  }

  // Calculate score (0-100)
  let score = 90;
  score -= Math.min(largeFilesCount * 5, 25);
  score -= Math.min(deeplyNestedCount * 2, 20);
  if (!hasSrcOrLib && files.length > 10) score -= 15;

  return {
    score: Math.max(20, Math.min(100, score)),
    findings,
  };
};
