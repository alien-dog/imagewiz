const { exec } = require('child_process');

// Start the Flask backend and Node.js server
function startFlaskBackend() {
  console.log('Starting Flask backend...');
  
  // Execute the run_both.js script
  const childProcess = exec('node run_both.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  
  // Pipe the output to the console
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
}

// Start the application
startFlaskBackend();