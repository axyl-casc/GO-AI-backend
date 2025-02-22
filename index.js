// main.js or index.js
const { app, BrowserWindow, screen } = require("electron");
const { fork } = require("child_process");
const path = require("path");

let mainWindow;
let serverProcess;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  let zoomFactor = 1;
  if (width <= 1280) {
    zoomFactor = 0.8; // Scale down for small screens
  } else if (width < 1920) {
    zoomFactor = 0.9; // Slightly smaller for medium screens
  }

  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: zoomFactor,
    },
  });

  // Load your Express server's URL
  mainWindow.loadURL("http://localhost:3001");

  // When the main window is closed, request child server to stop
  mainWindow.on("closed", () => {
    console.log("Main window closed. Stopping Express server...");
    stopServer();
    mainWindow = null;
  });
}

function startServerAndOpenWindow() {
  console.log("Starting Express server...");

  // Fork the Express server
  serverProcess = fork(path.join(__dirname, "app.js"), {
    stdio: ["ignore", "pipe", "pipe", "ipc"], // Allow IPC
  });

  // Listen for server output
  serverProcess.stdout.on("data", (data) => {
    const message = data.toString();
    process.stdout.write(message); // Show server logs in Electron console

    if (message.includes("SERVER_READY")) {
      console.log("Server is ready. Launching Electron window...");
      createWindow();
    }
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[Express Error] ${data}`);
  });

  serverProcess.on("exit", (code) => {
    console.log(`Express server exited with code ${code}`);
  });
}

// Send a "stop-server" message to the child process
function stopServer() {
  if (serverProcess?.connected) {
    console.log("Sending 'stop-server' IPC message to child process...");
    serverProcess.send("stop-server");
  }
}

app.whenReady().then(startServerAndOpenWindow);

// Also stop the server when the app is explicitly quitting
app.on("before-quit", () => {
  stopServer();
});

// For non-macOS, quit the app when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// npx electron .
// npx electron-builder build --win portable