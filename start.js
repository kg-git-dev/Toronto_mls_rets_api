// start.js

const { spawn } = require('child_process');
const cron = require('node-cron');

// Start the Express application
const expressApp = spawn('node', ['index.js']); // Replace 'app.js' with the entry point of your Express app

expressApp.stdout.on('data', (data) => {
  console.log(`Express App: ${data}`);
});

expressApp.stderr.on('data', (data) => {
  console.error(`Express App Error: ${data}`);
});

expressApp.on('close', (code) => {
  console.log(`Express App closed with code ${code}`);
});

// // Schedule the sampleCron.js watcher as a cron job
// cron.schedule('*/5 * * * * *', () => {
//   const residentialWatcher = spawn('node', ['./sampleCron']); 

//   residentialWatcher.stdout.on('data', (data) => {
//     console.log(`Residential Watcher: ${data}`);
//   });

//   residentialWatcher.stderr.on('data', (data) => {
//     console.error(`Residential Watcher Error: ${data}`);
//   });

//   residentialWatcher.on('close', (code) => {
//     console.log(`Residential Watcher closed with code ${code}`);
//   });
// });

// // Log that the cron job has started
// console.log('Cron job scheduled to run sampleCron.js every 5 seconds.');
