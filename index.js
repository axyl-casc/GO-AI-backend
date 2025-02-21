const { app, BrowserWindow, screen } = require("electron");
const { exec } = require("child_process");
const path = require("path");

let serverProcess;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  let zoomFactor = 1;
  if (width <= 1280) {
    zoomFactor = 0.8; // Scale down for small screens
  } else if (width < 1920) {
    zoomFactor = 0.9; // Slightly smaller for medium screens
  }

  const win = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: zoomFactor,
    },
  });

  // Load the Express server
  win.loadURL("http://localhost:3001"); 
}

function startServerAndOpenWindow() {
  console.log("Starting Express server...");

  // Start the Express server
  serverProcess = exec("node app.js 2 2"); // patchy, but makes it work

  // Listen for server readiness
  serverProcess.stdout.on("data", (data) => {
    process.stdout.write(data);
    if (data.includes("SERVER_READY")) {
      console.log("Server is ready. Launching Electron window...");
      createWindow();
    }
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[Express Error] ${data}`);
  });

  serverProcess.on("error", (error) => {
    console.error(`Failed to start server: ${error.message}`);
  });
}

app.whenReady().then(startServerAndOpenWindow);

// Close server when Electron app quits
app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});

// Handle macOS app behavior
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// npx electron .