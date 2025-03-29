import { exec } from 'child_process';

console.log('Starting Python Flask backend...');

// Execute the Python Flask application
const pythonProcess = exec('cd .. && python run.py', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(`stdout: ${stdout}`);
});

// Route stdout and stderr to the console
if (pythonProcess.stdout) {
  pythonProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
}

if (pythonProcess.stderr) {
  pythonProcess.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down Python Flask backend...');
  if (pythonProcess) {
    pythonProcess.kill();
  }
  process.exit();
});