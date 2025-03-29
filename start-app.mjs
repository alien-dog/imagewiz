/**
 * Node.js script to start the Node.js-based proxy server
 * The proxy server will handle frontend serving and API proxying to Flask
 */

import { spawn } from 'child_process';
import path from 'path';

// Start the Node.js proxy server
console.log('Starting Node.js proxy server...');

const nodeServer = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
});

// Log any errors
nodeServer.on('error', (error) => {
  console.error('Failed to start Node.js server:', error);
});

// Handle exit
nodeServer.on('exit', (code, signal) => {
  if (code !== 0) {
    console.log(`Node.js server process exited with code ${code} and signal ${signal}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  nodeServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  nodeServer.kill();
  process.exit(0);
});