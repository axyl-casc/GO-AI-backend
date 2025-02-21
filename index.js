const { app, BrowserWindow, screen  } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const url = require("url");

function createWindow() {
  // Start Express server
  
  const serverProcess = exec("server.exe");

  // Listen for server readiness
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
	process.stdout.write(output);

    
    if (output.includes("SERVER_READY")) {
      createBrowserWindow();
    }
  });

  // Error handling
  serverProcess.stderr.on('data', (data) => {
    console.error(`[Express Error] ${data}`);
  });

  serverProcess.on('error', (error) => {
    console.error(`Failed to start server: ${error.message}`);
  });
}

function createBrowserWindow() {
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
		zoomFactor: zoomFactor, // Adjust zoom level
	  },
	});
  
  // Load the Express server
  win.loadURL("http://localhost:3001");
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
// npx electron .