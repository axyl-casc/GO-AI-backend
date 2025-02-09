const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const url = require('url');

function createWindow() {
    // Run app.js before opening the window
    const appProcess = exec('node app.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting app.js: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`app.js stderr: ${stderr}`);
            return;
        }
        console.log(`app.js stdout: ${stdout}`);
    });

    // Create the browser window.
    const win = new BrowserWindow({ width: 800, height: 600 });

    // Load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'public/index.html'),
        protocol: 'file:',
        slashes: true
    }));
}

app.on('ready', createWindow);
