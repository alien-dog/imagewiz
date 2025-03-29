const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Get the Replit workspace directory
const workspaceDir = process.cwd();

// Function to start the Flask backend
function startFlaskBackend() {
  console.log('Starting Flask backend...');
  
  const flaskProcess = spawn('python', ['backend/run.py'], {
    cwd: workspaceDir,
    stdio: 'inherit',
    shell: true
  });
  
  flaskProcess.on('error', (err) => {
    console.error('Failed to start Flask backend:', err);
  });
}

// Start the Flask backend
startFlaskBackend();