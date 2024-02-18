const { spawn } = require("child_process");
const cron = require("node-cron");

// Function to execute Redis process
function executeRedisProcess() {
  // Construct the command to be executed
  const command = `redis-cli -n 0 FLUSHDB`;

  // Execute the Redis command with the constructed command via shell
  const redisProcess = spawn(command, {
    shell: true,
    stdio: ["pipe", "pipe", "pipe"], // Redirect all stdio streams to pipes
  });

  console.log(`Redis Process started at ${new Date(Date.now()).toLocaleString()}`);

  let output = "";

  // Capture output from Redis command
  redisProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  // Logging errors, if any, from Redis command
  redisProcess.stderr.on("data", (data) => {
    console.error("Redis Process errors:", data.toString());
  });

  redisProcess.on("close", (code) => {
    if (code === 0) {
      console.log(`Redis Process completed successfully at ${new Date(Date.now()).toLocaleString()}`);
      console.log("Redis Process output:", output); // Log captured output
    } else {
      console.error("Redis Process failed");
    }
  });
}

// Function to execute update process
function executeUpdateProcess() {
  const updateProcess = spawn("node", ["./XmlParser/Residential/updateListing.js"]);

  console.log(`Update process started at ${new Date(Date.now()).toLocaleString()}`)

  // Log memory usage for the update process every 30 seconds
  const updateMemoryLoggingInterval = setInterval(() => {
    const used = process.memoryUsage();
    console.log(`Update Process Memory usage at ${new Date(Date.now()).toLocaleString()}: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);
    console.log(`Update Process Heap memory available: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`);
  }, 30 * 1000); 

  updateProcess.stdout.on("data", (data) => {
    console.log(`Update Process: ${data}`);
  });

  updateProcess.stderr.on("data", (data) => {
    console.error(`Update Process Error: ${data}`);
  });

  updateProcess.on("close", (code) => {
    clearInterval(updateMemoryLoggingInterval); // Stop memory logging interval when update process is closed
    console.log(`Update Process closed with code at ${new Date(Date.now()).toLocaleString()} ${code}`);
    executeRedisProcess(); // Execute Redis process after update process completion
  });
}

// Function to execute delete process
function executeDeleteProcess() {
  const deleteProcess = spawn("node", ["./XmlParser/Residential/deleteListing.js"]);
  
  console.log(`Delete process started at ${new Date(Date.now()).toLocaleString()}`)

  // Log memory usage for the delete process every 30 seconds
  const deleteMemoryLoggingInterval = setInterval(() => {
    const used = process.memoryUsage();
    console.log(`Delete Process Memory usage ${new Date(Date.now()).toLocaleString()}: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);
    console.log(`Delete Process Heap memory available: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`);
  }, 30 * 1000);

  deleteProcess.stdout.on("data", (data) => {
    console.log(`Delete Process: ${data}`);
  });

  deleteProcess.stderr.on("data", (data) => {
    console.error(`Delete Process Error: ${data}`);
  });

  deleteProcess.on("close", (code) => {
    clearInterval(deleteMemoryLoggingInterval); // Stop memory logging interval when delete process is closed
    console.log(`Delete Process closed with code at ${new Date(Date.now()).toLocaleString()} ${code}`);
    executeRedisProcess(); // Execute Redis process after delete process completion
  });
}

// Schedule the update process to run every three hours starting at 15 minutes past (Eastern Standard Time)
cron.schedule("15 */3 * * *", executeUpdateProcess, {
  timezone: "America/Toronto",
});

// Schedule delete process to run twice a day at 10:30 AM and 10:30 PM (Eastern Standard Time)
cron.schedule("30 10,22 * * *", executeDeleteProcess, {
  timezone: "America/Toronto",
});

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

// Log memory usage every 15 minutes
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Memory usage for the main application at ${new Date(Date.now()).toLocaleString()} : ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);
  console.log(`Heap memory available for the main application: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`);
}, 15 * 60 * 1000); 
