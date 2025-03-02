const { spawn } = require('child_process');
const path = require('path');

// Launch the unified server process on port 5000
const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

// Handle process termination
process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});

// Log process errors
server.on('error', (err) => {
  console.error('Server process error:', err);
});

// Log process exit
server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

console.log('Starting unified server...');
console.log('Server running on port 5000 (serving both frontend and API)');