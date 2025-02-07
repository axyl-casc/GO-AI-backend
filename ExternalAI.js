const { getAvailableVRAM } = require("./gfxtst");


const { spawn } = require('child_process');
const { warn } = require('console');
const readline = require('readline');



class GoAIInstance {
  constructor(exePath, args = []) {
    this.exePath = exePath;
    this.args = args;
    this.shouldExit = false;
    this.intentionallyTerminated = false;
    this.child = null;
    this.rl = null;
    this.pendingRequests = [];
    this.currentRequest = null;
    this.initializeProcess();
  }

  initializeProcess() {
    // for slow computer
    this.exePath = this.exePath.replace("/katago/", "/katago_cpu/")
    console.log(`Running :: ${this.exePath}`)
    this.child = spawn(this.exePath, this.args, { 
        stdio: ['pipe', 'pipe', 'pipe'], 
        windowsHide: true, 
        detached: true 
    });

    this.rl = readline.createInterface({ input: this.child.stdout });
    this.setupListeners();
}


  setupListeners() {
    this.rl.on('line', (line) => {
      if (this.currentRequest) {
        this.currentRequest.lines.push(line);

        if (line.trim() === '') {
          const responseLines = this.currentRequest.lines;
          const { resolve, reject } = this.currentRequest;

          if (responseLines.length > 0 && responseLines[0].startsWith('? ')) {
            const errorMsg = responseLines[0].substring(2).trim();
            reject(new Error(`GTP error: ${errorMsg}`));
          } else {
            resolve(responseLines);
          }

          this.currentRequest = this.pendingRequests.shift() || null;
        }
      }
    });

    this.child.stderr.on('data', (data) => {
      //warn('AI STDERR:', data.toString());
    });

    this.child.on('error', (err) => {
      this.rejectAll(new Error(`Process error: ${err.message}`));
    });

    this.child.on('close', (code) => {
      if (!this.intentionallyTerminated) {
        warn('Process crashed, restarting...');
        this.rejectAll(new Error(`Process exited with code ${code}`));
        this.restartProcess();
      } else {
        this.rejectAll(new Error(`Process terminated with code ${code}`));
      }
    });
  }

  restartProcess() {
    try {
      if (this.child) {
        this.child.removeAllListeners();
        this.child.stdin.end();
        this.child.kill();
      }
    } catch (e) {
      warn('Error cleaning up previous process:', e);
    }

    this.initializeProcess();
    warn('Process restarted successfully');
    this.terminate()
  }

  rejectAll(err) {
    const requests = this.currentRequest ? [this.currentRequest, ...this.pendingRequests] : [...this.pendingRequests];
    this.currentRequest = null;
    this.pendingRequests = [];

    for (const request of requests) {
      clearTimeout(request.timeout);
      request.reject(err);
    }
  }

  async terminate() {
    this.shouldExit = true;
    this.intentionallyTerminated = true;
    if (this.child) {
      this.child.stdin.end();
      this.child.kill();
    }
  }

  async sendCommand(command, timeout = 300000) {
    while (!this.shouldExit) {
      try {
        return await this.sendSingleCommand(command, timeout);
      } catch (err) {
        if (this.shouldExit) break;
        warn(`Command failed: ${command}\n${err.message}. Retrying...`);
        return await this.sendSingleCommand("play B pass", timeout);
        //await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Process terminated');
  }

  sendSingleCommand(command, timeout) {
    return new Promise((resolve, reject) => {
      if (this.shouldExit) return reject(new Error('Process terminated'));

      const request = {
        command,
        resolve,
        reject,
        lines: [],
        timeout: setTimeout(() => {
          reject(new Error(`Command timeout: ${command.split(' ')[0]}`));
          this.handleTimeout(request);
        }, timeout)
      };

      if (this.currentRequest) {
        this.pendingRequests.push(request);
      } else {
        this.currentRequest = request;
      }

      this.child.stdin.write(`${command}\n`);
    });
  }

  handleTimeout(request) {
    const index = this.pendingRequests.indexOf(request);
    if (index !== -1) {
      this.pendingRequests.splice(index, 1);
    }
    if (this.currentRequest === request) {
      this.currentRequest = null;
    }
  }
}

module.exports = { GoAIInstance };