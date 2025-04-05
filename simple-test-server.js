const express = require('express');
const path = require('path');

const app = express();
const PORT = 3100;

// Serve static files from the server directory
app.use(express.static(path.join(__dirname, 'server')));

// Direct test route
app.get('/direct-test.html', (req, res) => {
  console.log('Serving direct test HTML file');
  res.sendFile(path.join(__dirname, 'server/direct-test.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple test server running at http://0.0.0.0:${PORT}`);
  console.log(`Access your test server at: ${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co:${PORT}`);
});