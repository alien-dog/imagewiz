import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting both backend and frontend servers...');

// Start the backend Flask server
const backendProcess = spawn('python', ['run.py'], { 
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true 
});

backendProcess.on('error', (error) => {
  console.error(`Backend Error: ${error.message}`);
});

// Wait for backend to initialize before starting frontend
setTimeout(() => {
  // Start the frontend Vite server
  const frontendProcess = spawn('npm', ['run', 'dev'], { 
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true 
  });

  frontendProcess.on('error', (error) => {
    console.error(`Frontend Error: ${error.message}`);
  });

  // Handle frontend process exit
  frontendProcess.on('exit', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    // Kill backend when frontend exits
    backendProcess.kill();
    process.exit(code);
  });
}, 3000);

// Handle backend process exit
backendProcess.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down...');
  backendProcess.kill();
  process.exit(0);
});