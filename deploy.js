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
