const forever = require("forever-monitor");
const { exec } = require('child_process');

const args = process.argv.slice(2);

const child = new forever.Monitor("app.js", {
    max: 10, 
    silent: false,
    args: args,
});

function performCleanup() {
    console.log("Performing resource cleanup...");
    
    // Windows cleanup
    if (process.platform === 'win32') {
        // Kill process trees (/t) for better cleanup
        const targets = ['katago.exe', 'gnugo.exe', 'aya.exe', 'node.exe'];
        targets.forEach(exe => {
            exec(`taskkill /f /t /im ${exe}`, (err) => {
                if (err && !err.message.includes('not found')) {
                    console.error(`Error killing ${exe}:`, err);
                }
            });
        });
    }
    // Linux/Mac cleanup
    else {
        // Use pkill with exact process names and handle missing processes
        const processes = ['node', 'katago', 'gnugo', 'aya', 'app.js'];
        processes.forEach(proc => {
            exec(`pkill -x "${proc}"`, (err) => {
                if (err && err.code !== 1) {  // Ignore "no process found" errors
                    console.error(`Error killing ${proc}:`, err);
                }
            });
        });
    }

    // Optional GPU cleanup (NVIDIA example)
    // exec('nvidia-smi --gpu-reset -i 0', (err) => {
    //     if (err) console.error('GPU reset failed:', err);
    // });
}
child.on('restart', () => {
    console.log('Restarting app...');
    performCleanup();
});

child.on('exit', () => {
    console.log('Permanent exit');
    performCleanup();
});

// Handle signals
['SIGTERM', 'SIGINT'].forEach(signal => {
    process.on(signal, () => {
        console.log(`Received ${signal}, stopping...`);
        child.stop();
        performCleanup();
        process.exit();
    });
});

child.start();