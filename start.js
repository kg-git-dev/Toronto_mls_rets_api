const { spawn } = require("child_process");
const cron = require("node-cron");

// Function to execute Redis process
function executeRedisProcess() {
  // Construct the commands to be executed
  const commands = `redis-cli -n 0 SELECT 0\nFLUSHDB`;

  // Execute the Redis command with the constructed commands via shell
  const redisProcess = spawn(commands, [], {
    shell: true,
    stdio: ["pipe", "pipe", "pipe"] // Redirect all stdio streams to pipes
  });

  let output = '';

  // Capture output from Redis command
  redisProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  // Logging errors, if any, from Redis command
  redisProcess.stderr.on('data', (data) => {
    console.error('Redis Process errors:', data.toString());
  });

  redisProcess.on('close', (code) => {
    if (code === 0) {
      console.log("Redis Process completed successfully");
      console.log("Redis Process output:", output); // Log captured output
    } else {
      console.error("Redis Process failed");
    }
  });
}

// Start the Express application
const expressApp = spawn("node", ["index.js"]);

expressApp.stdout.on("data", (data) => {
  console.log(`Express App: ${data}`);
});

expressApp.stderr.on("data", (data) => {
  console.error(`Express App Error: ${data}`);
});

expressApp.on("close", (code) => {
  console.log(`Express App closed with code ${code}`);
});

// Schedule the update process to run every two hours starting at 15 minute past (Eastern Standard Time)
cron.schedule('15 */2 * * *', () => {
  const updateProcess = spawn("node", ["./XmlParser/Residential/updateListing.js"]);

  updateProcess.stdout.on("data", (data) => {
    console.log(`Update Process: ${data}`);
  });

  updateProcess.stderr.on("data", (data) => {
    console.error(`Update Process Error: ${data}`);
  });

  updateProcess.on("close", (code) => {
    console.log(`Update Process closed with code ${code}`);
    executeRedisProcess(); // Execute Redis process after update process completion
  });
}, {
  timezone: "America/Toronto"
});

// Schedule delete process to run twice a day at 10:30 AM and 10:30 PM (Eastern Standard Time)
cron.schedule('30 10,22 * * *', () => {
  const { spawnSync } = require('child_process');

  // Logging a message to indicate the cron job is triggered
  console.log("Cron job running...");

  // Executing delete.js using spawnSync
  const deleteProcess = spawnSync("node", ["./XmlParser/Residential/deleteListing.js"]);

  // Checking the status of deleteProcess
  if (deleteProcess.status === 0) {
    console.log("Delete Process completed successfully");
    executeRedisProcess(); // Execute Redis process after delete process completion
  } else {
    console.error("Delete Process failed");
  }
}, {
  timezone: "America/Toronto"
});
