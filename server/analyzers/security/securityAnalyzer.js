/**
 * Deterministic Security Analyzer
 * Audits repository for exposed secret patterns, sensitive credential extensions,
 * missing lockfiles, and dependency integrity risks.
 */
export const analyzeSecurity = (repo) => {
  const findings = [];
  const files = repo.structure?.fileTree || [];

  let score = 95;

  // 1. Check for exposed secrets and credential files in Git tree
  const sensitivePatterns = [
    { pattern: /(?:^|\/)\.env(?:\..*)?$/, rule: 'security/committed-env-file', severity: 'high', message: 'Environment file committed to version control. High risk of secret exposure.' },
    { pattern: /\.(?:pem|key|pkcs12|pfx|p12)$/i, rule: 'security/private-key-file', severity: 'high', message: 'Private cryptographic key file tracked in repository.' },
    { pattern: /(?:id_rsa|id_dsa|id_ecdsa|id_ed25519)(?:\.pub)?$/i, rule: 'security/ssh-key-file', severity: 'high', message: 'SSH key file found in repository files.' },
    { pattern: /(?:credentials|serviceAccountKey|client_secret)\.json$/i, rule: 'security/api-credential-file', severity: 'high', message: 'API credential JSON file checked into repository.' },
    { pattern: /(?:^|\/)npm-debug\.log$/i, rule: 'security/debug-log-exposed', severity: 'low', message: 'Debug log committed. May inadvertently reveal internal server paths.' },
  ];

  files.forEach((f) => {
    sensitivePatterns.forEach(({ pattern, rule, severity, message }) => {
      if (pattern.test(f.path)) {
        findings.push({
          type: 'security',
          severity,
          file: f.path,
          line: 1,
          rule,
          message,
          source: 'static-analyzer',
        });
        score -= severity === 'high' ? 25 : 5;
      }
    });
  });

  // 2. Check for lockfile presence if package.json exists
  if (repo.dependencies?.hasPackageJson) {
    const hasLockfile = files.some((f) =>
      ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'].includes(f.path)
    );

    if (!hasLockfile) {
      findings.push({
        type: 'security',
        severity: 'medium',
        file: 'package.json',
        line: 1,
        rule: 'security/missing-lockfile',
        message: 'No lockfile (package-lock.json / yarn.lock) detected. Builds are susceptible to dependency drift and supply-chain tampering.',
        source: 'static-analyzer',
      });
      score -= 15;
    }
  }

  // 3. Check for wildcard or unbounded dependencies
  const runtimeDeps = repo.dependencies?.runtime || [];
  const wildcardDeps = runtimeDeps.filter((d) => d.version === '*' || d.version === 'latest');
  if (wildcardDeps.length > 0) {
    findings.push({
      type: 'security',
      severity: 'medium',
      file: 'package.json',
      line: 1,
      rule: 'security/wildcard-dependency-version',
      message: `${wildcardDeps.length} dependencies use '*' or 'latest' versioning. Unpinned versions expose the project to breaking upstream changes or supply chain injection.`,
      source: 'static-analyzer',
    });
    score -= 10;
  }

  return {
    score: Math.max(15, Math.min(100, score)),
    findings,
  };
};
