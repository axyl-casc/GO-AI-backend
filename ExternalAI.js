const { spawn } = require('child_process');
const readline = require('readline');

class GoAIInstance {
  constructor(exePath, args = []) {
    this.exePath = exePath;
    this.args = args;
    this.child = spawn(this.exePath, this.args, { stdio: ['pipe', 'pipe', 'pipe'] });
    this.rl = readline.createInterface({ input: this.child.stdout });
    this.pendingRequests = [];
    this.currentRequest = null;

    this.setupListeners();
  }

  setupListeners() {
    this.rl.on('line', (line) => {
      if (this.currentRequest) {
        this.currentRequest.lines.push(line);

        // Check for response termination (empty line)
        if (line.trim() === '') {
          const responseLines = this.currentRequest.lines;
          const { resolve, reject } = this.currentRequest;

          // Check for GTP error response
          if (responseLines.length > 0 && responseLines[0].startsWith('? ')) {
            const errorMsg = responseLines[0].substring(2).trim();
            reject(new Error(`GTP error: ${errorMsg}`));
          } else {
            resolve(responseLines);
          }

          // Process next request
          this.currentRequest = this.pendingRequests.shift() || null;
        }
      }
    });

    this.child.stderr.on('data', (data) => {
      //console.error('AI STDERR:', data.toString());
    });

    this.child.on('error', (err) => {
      this.rejectAll(new Error(`Process error: ${err.message}`));
    });

    this.child.on('close', (code) => {
      this.rejectAll(new Error(`Process exited with code ${code}`));
    });
  }

  rejectAll(err) {
    if (this.currentRequest) {
      this.currentRequest.reject(err);
      this.currentRequest = null;
    }
    while (this.pendingRequests.length > 0) {
      this.pendingRequests.shift().reject(err);
    }
  }

  terminate() {
    if (this.child && !this.child.killed) {
      this.child.stdin.end();
      this.child.kill();
    }
    this.rejectAll(new Error('Process terminated'));
  }

  async sendCommand(command, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const request = {
        resolve,
        reject,
        lines: [],
        timeout: setTimeout(() => {
          this.handleTimeout(request);
        }, timeout)
      };

      if (this.currentRequest) {
        this.pendingRequests.push(request);
      } else {
        this.currentRequest = request;
      }

      // Send command with proper GTP formatting
      this.child.stdin.write(`${command}\n`);
    });
  }

  handleTimeout(request) {
    const error = new Error(`Command timeout: ${request.lines[0]?.split(' ')[0] || 'unknown'}`);
    if (this.currentRequest === request) {
      this.currentRequest = null;
      request.reject(error);
      this.terminate(); // Terminate process on timeout
    } else {
      const index = this.pendingRequests.indexOf(request);
      if (index !== -1) {
        this.pendingRequests.splice(index, 1);
        request.reject(error);
      }
    }
  }
}

module.exports = { GoAIInstance };