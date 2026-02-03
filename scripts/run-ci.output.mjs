export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

export const style = (value, ...tokens) => `${tokens.join('')}${value}${colors.reset}`;

export const header = (value) => style(value, colors.bold, colors.cyan);
export const subheader = (value) => style(value, colors.bold);
export const muted = (value) => style(value, colors.dim);

export const formatPending = (label, detail) => `- [ ] ${label}  ${muted(`run: ${detail}`)}`;
export const formatSuccess = (label) => `- ${style('[x]', colors.green)} ${label}`;
export const formatFailure = (label) => `- ${style('[!]', colors.red)} ${label}`;

export const renderLine = (text) => process.stdout.write(`\r\x1b[2K${text}`);
export const renderLineLn = (text) => process.stdout.write(`\r\x1b[2K${text}\n`);

export const hideCursor = () => process.stdout.write('\x1b[?25l');
export const showCursor = () => process.stdout.write('\x1b[?25h');
