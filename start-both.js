import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure colors for output
const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

/**
 * Spawn a process with given arguments and handle output
 * @param {string} command - The command to execute
 * @param {string[]} args - Arguments for the command
 * @param {string} cwd - Current working directory
 * @param {string} name - Display name for the process
 */
function spawnProcess(command, args, cwd, name) {
  console.log(`${colors.blue}Starting ${name}...${colors.reset}`);
  
  const proc = spawn(command, args, { 
    cwd,
    stdio: 'pipe',
    shell: true
  });

  const prefix = `${colors.green}[${name}]${colors.reset}`;
  
  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.log(`${prefix} ${line}`));
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.log(`${colors.red}[${name} ERROR]${colors.reset} ${line}`));
  });
  
  proc.on('close', (code) => {
    if (code !== 0) {
      console.log(`${colors.red}[${name}]${colors.reset} Process exited with code ${code}`);
    }
  });
  
  return proc;
}

// Start Flask backend
const backend = spawnProcess(
  'python', 
  ['run.py'], 
  path.join(__dirname, 'backend'),
  'Flask Backend'
);

// Start Node.js server
const server = spawnProcess(
  'npx', 
  ['tsx', 'server/index.ts'], 
  __dirname,
  'Node Server'
);

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down all processes...${colors.reset}`);
  
  backend.kill();
  server.kill();
  
  setTimeout(() => {
    process.exit(0);
  }, 500);
});