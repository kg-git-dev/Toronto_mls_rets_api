const { spawn } = require("child_process");
const cron = require("node-cron");

// Function to execute Redis process
function executeRedisProcess() {
  // Construct the command to be executed
  const command = `redis-cli -n 0 FLUSHDB`;

  console.log(`initialized function executeRedisProcess at ${new Date(Date.now()).toLocaleString()}`);

  // Execute the Redis command with the constructed command via shell
  const redisProcess = spawn(command, {
    shell: true,
    stdio: ["pipe", "pipe", "pipe"], // Redirect all stdio streams to pipes
  });

  console.log(`executeRedisProcess: spawned at ${new Date(Date.now()).toLocaleString()}`);

  let output = "";

  // Capture output from Redis command
  redisProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  // Logging errors, if any, from Redis command
  redisProcess.stderr.on("data", (data) => {
    console.error("fexecuteRedisProcess errors:", data.toString());
  });

  redisProcess.on("close", (code) => {
    if (code === 0) {
      console.log(`function executeRedisProcess: completed successfully at ${new Date(Date.now()).toLocaleString()}`);
      console.log("executeRedisProcess output:", output); // Log captured output
    } else {
      console.error("executeRedisProcess failed whiled closing");
    }
  });
}

// Function to execute update process
function executeUpdateProcess() {
  console.log(`initialized function executeUpdateProcess at ${new Date(Date.now()).toLocaleString()}`)

  const updateProcess = spawn("node", ["./XmlParser/Residential/updateListing.js"]);

  console.log(`executeUpdateProcess: spawned at ${new Date(Date.now()).toLocaleString()}`)

  updateProcess.stdout.on("data", (data) => {
    console.log(`executeUpdateProcess Data: ${data}`);
  });

  updateProcess.stderr.on("data", (data) => {
    console.error(`executeUpdateProcess error: ${data}`);
  });

  updateProcess.on("close", (code) => {
    console.log(`executeUpdateProcess: completed successfully at ${new Date(Date.now()).toLocaleString()} ${code}`);
    executeRedisProcess(); // Execute Redis process after update process completion
  });
}

// Function to execute delete process
function executeDeleteProcess() {
  const deleteProcess = spawn("node", ["./XmlParser/Residential/deleteListing.js"]);
  
  console.log(`initialized function deleteProcess at ${new Date(Date.now()).toLocaleString()}`)

  deleteProcess.stdout.on("data", (data) => {
    console.log(`deleteProcess Data: ${data}`);
  });

  deleteProcess.stderr.on("data", (data) => {
    console.error(`deleteProcess Error: ${data}`);
  });

  deleteProcess.on("close", (code) => {
    console.log(`executeDeleteProcess: completed successfully at ${new Date(Date.now()).toLocaleString()} ${code}`);
    executeRedisProcess(); // Execute Redis process after delete process completion
  });
}

// Schedule the update process to run every three hours starting at 15 minutes past (Eastern Standard Time)
cron.schedule("15 */3 * * *", executeUpdateProcess, {
  timezone: "America/Toronto",
});

// Schedule delete process to run twice a day at 10:30 AM and 10:30 PM (Eastern Standard Time)
// cron.schedule("30 10,22 * * *", executeDeleteProcess, {
//   timezone: "America/Toronto",
// });

// Start the Express application

const expressApp = spawn("node", ["index.js"]);

expressApp.stdout.on("data", (data) => {
  console.log(`Express App ${new Date(Date.now()).toLocaleString()}: ${data}`);
});

expressApp.stderr.on("data", (data) => {
  console.error(`Express App Error ${new Date(Date.now()).toLocaleString()}: ${data}`);
});

expressApp.on("close", (code) => {
  console.log(`Express App closed with code ${code} at ${new Date(Date.now()).toLocaleString()}`);
});


