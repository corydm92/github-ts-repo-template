import { format } from '@commitlint/format';

const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

export default function formatter(report) {
  const output = format(report);
  const isValid = report.results?.every((r) => r.valid) === true;
  if (isValid) return output;

  const help = `
──────────────────────────────────────────────
Valid commit types:

  ${validTypes.map((t) => `- ${t}`).join('\n  ')}

Examples:

  feat: add user login
  fix: correct validation bug
  docs: update README with setup steps
  chore: add husky + commitlint hooks

Format:

  <type>: <subject>
──────────────────────────────────────────────
`;
  return output + help;
}
