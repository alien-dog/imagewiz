const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

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
    cwd,
    stdio: 'pipe',
    shell: true
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`[${name}] ${data.toString().trim()}`);
  });
  
  proc.on('error', (err) => {
    console.error(`[${name}] Failed to start: ${err.message}`);
  });
  
  proc.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });
  
  return proc;
}

// Get the current directory
const rootDir = process.cwd();

// Start Flask backend
const flaskProc = spawnProcess(
  'python', 
  ['run.py'], 
  path.join(rootDir, 'backend'),
  'Flask'
);

// Allow Flask to start up first
setTimeout(() => {
  // Start the Node.js server
  const nodeProc = spawnProcess(
    'node',
    ['index.js'],
    path.join(rootDir, 'server'),
    'Node.js'
  );
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    flaskProc.kill();
    nodeProc.kill();
    process.exit(0);
  });
}, 3000); // Wait 3 seconds before starting Node