const { spawn } = require('child_process');
const path = require('path');

// Configuration
const FRONTEND_PORT = 5173;
const BACKEND_PORT = 5000;
const BACKEND_HOST = '0.0.0.0';

/**
 * Spawn a process with given arguments and handle output
 * @param {string} command - The command to execute
 * @param {string[]} args - Arguments for the command
 * @param {string} cwd - Current working directory
 * @param {string} name - Display name for the process
 */
function spawnProcess(command, args, cwd, name) {
  console.log(`Starting ${name}...`);
  
  const process = spawn(command, args, { 
    cwd, 
    stdio: 'pipe',
    shell: true
  });
  
  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[${name}] ${data.toString().trim()}`);
  });
  
  process.on('close', (code) => {
    console.log(`${name} process exited with code ${code}`);
  });
  
  return process;
}

// Start Python Flask Backend
const backendProcess = spawnProcess(
  'python',
  ['-m', 'backend.run'],
  '.',
  'Backend'
);

// Start Frontend development server
const frontendProcess = spawnProcess(
  'npm',
  ['run', 'dev'],
  'frontend',
  'Frontend'
);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down services...');
  
  backendProcess.kill('SIGINT');
  frontendProcess.kill('SIGINT');
  
  process.exit(0);
});