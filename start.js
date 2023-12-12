// start.js

const { spawn } = require('child_process');
const cron = require('node-cron');

// Start the Express application
const expressApp = spawn('node', ['index.js']); // 

expressApp.stdout.on('data', (data) => {
  console.log(`Express App: ${data}`);
});

expressApp.stderr.on('data', (data) => {
  console.error(`Express App Error: ${data}`);
});

expressApp.on('close', (code) => {
  console.log(`Express App closed with code ${code}`);
});


