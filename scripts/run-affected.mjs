import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const task = process.argv[2];
if (!task) {
  console.error("Usage: node scripts/run-affected.mjs <task>");
  process.exit(1);
}

const getAffectedApps = () => {
  const output = execSync("node scripts/affected-apps.mjs", {
    encoding: "utf8",
  });
  return JSON.parse(output);
};

const apps = getAffectedApps();
if (!apps.length) {
  console.log("No affected apps detected. Skipping.");
  process.exit(0);
}

const hasTypeScriptFiles = (app) => {
  const root = path.join(process.cwd(), "apps", app);
  const stack = [root];

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        return true;
      }
    }
  }

  return false;
};

for (const app of apps) {
  if (task === "type-check" && !hasTypeScriptFiles(app)) {
    console.log(`\n▶ ${task} for apps/${app} (skipped: no TS files)`);
    continue;
  }

  console.log(`\n▶ ${task} for apps/${app}`);
  execSync(`pnpm -C apps/${app} run ${task}`, { stdio: "inherit" });
}
