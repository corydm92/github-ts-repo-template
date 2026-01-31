import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appsDir = path.join(root, 'apps');
const packagesDir = path.join(root, 'packages');

const appScripts = ['ci', 'lint', 'test', 'type-check', 'build', 'dev'];
const packageScripts = ['ci', 'lint', 'test', 'type-check', 'build'];

const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const listWorkspaces = (dir, type) => {
  if (!isDir(dir)) return [];
  return fs
    .readdirSync(dir)
    .map((name) => ({
      name,
      type,
      dir: path.join(dir, name),
      pkgPath: path.join(dir, name, 'package.json'),
    }))
    .filter((ws) => isDir(ws.dir) && fs.existsSync(ws.pkgPath));
};

const workspaces = [
  ...listWorkspaces(appsDir, 'app'),
  ...listWorkspaces(packagesDir, 'package'),
];

const errors = [];

const workspaceByName = new Map();
for (const ws of workspaces) {
  const pkg = readJson(ws.pkgPath);
  ws.pkg = pkg;
  ws.pkgName = pkg.name;
  workspaceByName.set(ws.pkgName, ws);
}

const isInactive = (pkg) => pkg.workspaceStatus === 'inactive';

for (const ws of workspaces) {
  if (isInactive(ws.pkg)) continue;
  const required = ws.type === 'app' ? appScripts : packageScripts;
  const scripts = ws.pkg.scripts || {};
  for (const key of required) {
    if (!scripts[key]) {
      errors.push(
        `${ws.type} ${ws.name} is missing script: ${key} (set workspaceStatus: "inactive" to skip)`,
      );
    }
  }
}

// Dependency graph (workspace -> workspace) for cycle detection.
const depsFor = (pkg) => ({
  ...pkg.dependencies,
  ...pkg.optionalDependencies,
  ...pkg.peerDependencies,
});

const graph = new Map(); // name -> [depNames]
for (const ws of workspaces) {
  if (isInactive(ws.pkg)) continue;
  const deps = Object.keys(depsFor(ws.pkg) || {});
  const edges = deps.filter((name) => workspaceByName.has(name));
  graph.set(ws.pkgName, edges);
}

const visited = new Set();
const inStack = new Set();
const cycles = [];

const dfs = (node, pathStack) => {
  if (inStack.has(node)) {
    const cycleStart = pathStack.indexOf(node);
    if (cycleStart >= 0) {
      cycles.push(pathStack.slice(cycleStart).concat(node));
    }
    return;
  }
  if (visited.has(node)) return;
  visited.add(node);
  inStack.add(node);
  const edges = graph.get(node) || [];
  for (const dep of edges) {
    dfs(dep, [...pathStack, dep]);
  }
  inStack.delete(node);
};

for (const node of graph.keys()) {
  dfs(node, [node]);
}

if (cycles.length) {
  for (const cycle of cycles) {
    errors.push(`workspace dependency cycle detected: ${cycle.join(' -> ')}`);
  }
}

if (errors.length) {
  console.error('Workspace contract check failed:\n');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log('Workspace contract check passed.');
