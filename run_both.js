const { spawn } = require('child_process');
const path = require('path');

/**
 * Spawn a process with given arguments and handle output
 * @param {string} command - The command to execute
 * @param {string[]} args - Arguments for the command
 * @param {string} cwd - Current working directory
 * @param {string} name - Display name for the process
 */
function spawnProcess(command, args, cwd, name) {
  console.log(`Starting ${name}...`);
  
  const proc = spawn(command, args, {
    cwd: path.resolve(__dirname, cwd),
    stdio: 'pipe',
    shell: true
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data.toString().trim()}`);
  });
  
  proc.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });
  
  return proc;
}

// Start the Flask backend server
const backendProc = spawnProcess(
  'python', 
  ['run.py'], 
  './backend',
  'FLASK BACKEND'
);

// Wait a bit for Flask to initialize
setTimeout(() => {
  // Start the frontend development server
  const frontendProc = spawnProcess(
    'npm', 
    ['run', 'dev'], 
    './frontend',
    'FRONTEND DEV SERVER'
  );
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down all processes...');
    backendProc.kill('SIGINT');
    frontendProc.kill('SIGINT');
    process.exit(0);
  });
}, 3000); // 3 second delay before starting frontend

console.log('Starting both services. Press Ctrl+C to stop.');