/**
 * Simple standalone server for testing order confirmation with fallbacks
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const paymentHandler = require('./server/payment-handler');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Express test server');
console.log('Current directory:', process.cwd());

// Find frontend build directory
let frontendPath = path.join(process.cwd(), 'frontend', 'dist');
if (!fs.existsSync(frontendPath)) {
  console.log(`❌ Could not find frontend path: ${frontendPath}`);
  console.log('Using current directory for static files');
  frontendPath = process.cwd();
}

// Find test-order-confirmation.html
if (fs.existsSync(path.join(process.cwd(), 'test-order-confirmation.html'))) {
  console.log('✅ Found test-order-confirmation.html in current directory');
  // Copy it to the frontend directory if needed
  if (fs.existsSync(frontendPath) && frontendPath !== process.cwd()) {
    fs.copyFileSync(
      path.join(process.cwd(), 'test-order-confirmation.html'),
      path.join(frontendPath, 'test-order-confirmation.html')
    );
    console.log('✅ Copied test-order-confirmation.html to frontend directory');
  }
}

// Register payment handler for testing order confirmation
app.use(paymentHandler);

// Frontend static files
app.use(express.static(frontendPath));

// For any route not handled above, serve the main test page
app.get('*', (req, res) => {
  console.log(`📝 GET request to: ${req.url}`);
  
  // Try to serve the test page
  if (fs.existsSync(path.join(frontendPath, 'test-order-confirmation.html'))) {
    res.sendFile(path.join(frontendPath, 'test-order-confirmation.html'));
  } else if (fs.existsSync(path.join(process.cwd(), 'test-order-confirmation.html'))) {
    res.sendFile(path.join(process.cwd(), 'test-order-confirmation.html'));
  } else {
    res.send(`
      <html>
        <body>
          <h1>Test Server Running</h1>
          <p>Please create a test-order-confirmation.html file in the root directory.</p>
        </body>
      </html>
    `);
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:${PORT}`);
  
  // Get the service URL
  try {
    const repl_id = process.env.REPL_ID;
    
    if (repl_id) {
      const serviceUrl = `${repl_id}-00-nzrxz81n08w.kirk.replit.dev`;
      console.log(`Access your app at: ${serviceUrl}`);
    }
  } catch (error) {
    console.error('Error getting service URL:', error);
  }
});

// Handle termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close();
  process.exit(0);
});

/**
 * Spawn a process with given arguments and handle output
 * @param {string} command - The command to execute
 * @param {string[]} args - Arguments for the command
 * @param {string} cwd - Current working directory
 * @param {string} name - Display name for the process
 */
function spawnProcess(command, args, cwd, name) {
  console.log(`Starting ${name}...`);
  const process = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    detached: false,
  });

  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`[${name}] ERROR: ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });

  process.on('error', (err) => {
    console.error(`[${name}] Failed to start process: ${err.message}`);
  });

  return process;
}