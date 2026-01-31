import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  return args[idx + 1];
};

const hasFlag = (flag) => args.includes(flag);

const name = getArg('--name');
if (!name) {
  console.error('Missing required --name');
  console.error('Usage: node scripts/rename.mjs --name "my-project" [--description "..."] [--author "..."] [--repo "owner/repo"] [--homepage "https://..."] [--dry-run]');
  process.exit(1);
}

const description = getArg('--description');
const author = getArg('--author');
const repo = getArg('--repo');
const homepage = getArg('--homepage');
const dryRun = hasFlag('--dry-run');

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const readmePath = path.join(root, 'README.md');

if (!fs.existsSync(pkgPath)) {
  console.error('Missing package.json at repo root.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const next = { ...pkg };

next.name = name;
if (description) next.description = description;
if (author) next.author = author;

if (repo) {
  const repoUrl = `git+https://github.com/${repo}.git`;
  next.repository = { type: 'git', url: repoUrl };
  next.bugs = { url: `https://github.com/${repo}/issues` };
  if (!homepage) {
    next.homepage = `https://github.com/${repo}#readme`;
  }
}

if (homepage) next.homepage = homepage;

const changes = [];
const trackChange = (field, before, after) => {
  if (before !== after) changes.push({ field, before, after });
};

trackChange('name', pkg.name, next.name);
trackChange('description', pkg.description, next.description);
trackChange('author', pkg.author, next.author);
trackChange('repository.url', pkg.repository?.url, next.repository?.url);
trackChange('bugs.url', pkg.bugs?.url, next.bugs?.url);
trackChange('homepage', pkg.homepage, next.homepage);

let readmeBefore = '';
let readmeAfter = '';
if (fs.existsSync(readmePath)) {
  readmeBefore = fs.readFileSync(readmePath, 'utf8');
  const lines = readmeBefore.split(/\r?\n/);
  if (lines[0]?.startsWith('# ')) {
    const title = `# ${name}`;
    readmeAfter = [title, ...lines.slice(1)].join('\n');
  } else {
    readmeAfter = readmeBefore;
  }
}

const summary = () => {
  console.log('Rename summary:');
  if (!changes.length) console.log('- No package.json changes');
  for (const change of changes) {
    console.log(`- ${change.field}: "${change.before ?? ''}" -> "${change.after ?? ''}"`);
  }
  if (readmeBefore && readmeBefore !== readmeAfter) {
    console.log('- README title updated');
  }
};

summary();

if (dryRun) {
  console.log('\nDry run: no files written.');
  process.exit(0);
}

fs.writeFileSync(pkgPath, JSON.stringify(next, null, 2) + '\n');

if (readmeBefore && readmeBefore !== readmeAfter) {
  fs.writeFileSync(readmePath, readmeAfter);
}
