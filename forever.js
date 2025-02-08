const forever = require("forever-monitor");

// Get arguments from Python
const args = process.argv.slice(2);
console.log(`Received from Python:`);
console.log(`Total RAM: ${args[0]} GB`);
console.log(`Total VRAM: ${args[1]} GB`);

const child = new forever.Monitor("app.js", {
  max: 3,
  silent: false,
  args: args, // Pass arguments to app.js
});

child.on("exit", () => {
  console.log("app.js has exited after 3 restarts");
});

// Handle termination signals (cleanup on Python exit)
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, stopping app.js...");
  child.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, stopping app.js...");
  child.stop();
  process.exit(0);
});

child.start();
