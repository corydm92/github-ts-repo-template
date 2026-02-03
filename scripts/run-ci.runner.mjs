import { execSync, spawn } from 'node:child_process';
import {
  formatFailure,
  formatPending,
  formatSuccess,
  hideCursor,
  renderLine,
  renderLineLn,
  showCursor,
} from './run-ci.output.mjs';

const cleanupHandler = () => {
  const cleanup = () => {
    showCursor();
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(1);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(1);
  });
  process.on('SIGHUP', () => {
    cleanup();
    process.exit(1);
  });
  process.on('SIGQUIT', () => {
    cleanup();
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    cleanup();
    throw err;
  });
  process.on('unhandledRejection', (err) => {
    cleanup();
    throw err;
  });
};

export const initRunner = () => {
  console.clear(); // Gives runner output space
  hideCursor();
  cleanupHandler();
};

const runCommandInline = (command, onLine) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true });

    let dots = 0;
    let lastLabel = '';
    const tick = () => {
      if (!lastLabel) return;
      dots = (dots + 1) % 4;
      const suffix = '.'.repeat(dots);
      onLine(`${lastLabel}${suffix}`);
    };
    const spinner = setInterval(tick, 1000);

    const updateLine = (line) => {
      lastLabel = line;
      dots = 0;
      onLine(line);
    };

    const pushLine = (chunk) => {
      const text = chunk.toString();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length) updateLine(lines[lines.length - 1]);
    };

    child.stdout.on('data', pushLine);
    child.stderr.on('data', pushLine);

    child.on('close', (code) => {
      clearInterval(spinner);
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command}`));
    });
  });

export const runStep = async ({ label, command, isCI }) => {
  if (isCI) {
    console.log(`::group::${label}`);
  }

  const streamOutput = isCI;
  renderLine(formatPending(label, command));

  try {
    if (streamOutput) {
      execSync(command, { stdio: 'inherit' });
    } else {
      await runCommandInline(command, (line) => {
        renderLine(formatPending(label, line));
      });
    }

    renderLineLn(formatSuccess(label));
    if (isCI) console.log('::endgroup::');
  } catch (err) {
    renderLineLn(formatFailure(label));
    if (!isCI) {
      // On local failure, rerun to show full output.
      execSync(command, { stdio: 'inherit' });
    }
    if (isCI) console.log('::endgroup::');
    throw err;
  }
};
