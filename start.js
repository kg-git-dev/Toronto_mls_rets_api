const { spawn } = require("child_process");
const cron = require("node-cron");

// Function to execute Redis process
function executeRedisProcess() {
  // Construct the command to be executed
  const command = `redis-cli -n 0 FLUSHDB`;

  console.log(`${new Date(Date.now()).toLocaleString()}: initialized function executeRedisProcess}`);

  // Execute the Redis command with the constructed command via shell
  const redisProcess = spawn(command, {
    shell: true,
    stdio: ["pipe", "pipe", "pipe"], // Redirect all stdio streams to pipes
  });

  console.log(`${new Date(Date.now()).toLocaleString()}: executeRedisProcess spawned`);

  let output = "";

  // Capture output from Redis command
  redisProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  // Logging errors, if any, from Redis command
  redisProcess.stderr.on("data", (data) => {
    console.error(`${new Date(Date.now()).toLocaleString()}: executeRedisProcess errors: ${data}`);
  });

  redisProcess.on("close", (code) => {
    if (code === 0) {
      console.log(`${new Date(Date.now()).toLocaleString()}: function executeRedisProcess: completed successfully}`);
      console.log(`${new Date(Date.now()).toLocaleString()}: executeRedisProcess output: ${output}`); // Log captured output
    } else {
      console.error(`${new Date(Date.now()).toLocaleString()}: executeRedisProcess failed whiled closing`);
    }
  });
}

// Function to execute update process
function executeUpdateProcess() {
  console.log(`${new Date(Date.now()).toLocaleString()}: initialized function executeUpdateProcess}`)

  const updateProcess = spawn("node", ["./XmlParser/Residential/updateListing.js"]);

  console.log(`${new Date(Date.now()).toLocaleString()}: executeUpdateProcess spawned}`)

  updateProcess.stdout.on("data", (data) => {
    console.log(`${new Date(Date.now()).toLocaleString()}: executeUpdateProcess Data: ${data}`);
  });

  updateProcess.stderr.on("data", (data) => {
    console.error(`${new Date(Date.now()).toLocaleString()}: executeUpdateProcess error: ${data}`);
  });

  updateProcess.on("close", (code) => {
    console.log(`${new Date(Date.now()).toLocaleString()}: executeUpdateProcess: completed successfully with code:} ${code}`);
    executeRedisProcess(); // Execute Redis process after update process completion
  });
}

// Function to execute delete process
function executeDeleteProcess() {
  const deleteProcess = spawn("node", ["./XmlParser/Residential/deleteListing.js"]);
  
  console.log(`${new Date(Date.now()).toLocaleString()}:initialized function deleteProcess}`)

  deleteProcess.stdout.on("data", (data) => {
    console.log(`${new Date(Date.now()).toLocaleString()}: deleteProcess Data: ${data}`);
  });

  deleteProcess.stderr.on("data", (data) => {
    console.error(`${new Date(Date.now()).toLocaleString()}: deleteProcess Error: ${data}`);
  });

  deleteProcess.on("close", (code) => {
    console.log(`${new Date(Date.now()).toLocaleString()}: executeDeleteProcess: completed successfully with code:} ${code}`);
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
  console.log(`${new Date(Date.now()).toLocaleString()}: Express App closed with code: ${code}}`);
});


