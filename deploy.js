const { spawn } = require('child_process');
const path = require('path');

// Launch the backend process on port 5000
const backend = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

// Launch the frontend process on port 8000
const frontend = spawn('node', ['client/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '8000' }
});

// Handle process termination
process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Log process errors
backend.on('error', (err) => {
  console.error('Backend process error:', err);
});

frontend.on('error', (err) => {
  console.error('Frontend process error:', err);
});

// Log process exit
backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

frontend.on('exit', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

console.log('Starting services...');
console.log('Backend running on port 5000');
console.log('Frontend running on port 8000');