const { spawn } = require('child_process');
const readline = require('readline');

class GoAIInstance {
  /**
   * Creates an instance of GoAIInstance.
   * @param {string} exePath - The path to the executable
   * @param {Array<string>} [args] - Arguments for the executable
   */
  constructor(exePath, args = []) {
    this.exePath = exePath;
    this.args = args;
    this.child = spawn(this.exePath, this.args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.rl = readline.createInterface({ input: this.child.stdout });
    this.pendingRequests = [];
    this.currentRequest = null; // Track the current request collecting lines

    this.setupListeners();
  }

  setupListeners() {
    this.rl.on('line', (line) => {
      if (this.currentRequest) {
        this.currentRequest.lines.push(line);

        // Special handling for "final_score" command
        if (line.includes('final_score')) {
          const { resolve } = this.currentRequest;
          const allLines = this.currentRequest.lines;
          this.currentRequest = null;

          resolve(allLines);

          // Exit process after resolving the current request
          this.terminate();
          return;
        }

        // Check termination condition:
        if (line.trim() === '') {
          // Termination based on empty line
          const { resolve } = this.currentRequest;
          const allLines = this.currentRequest.lines;
          this.currentRequest = null;
          resolve(allLines);
        }
      }
    });

    this.child.stderr.on('data', (data) => {
      // Optionally handle stderr
      // console.error('STDERR:', data.toString());
    });

    this.child.on('error', (err) => {
      this.rejectAll(err);
    });

    this.child.on('close', (code) => {
      const err = new Error(`External process exited with code ${code}`);
      this.rejectAll(err);
    });
  }

  rejectAll(err) {
    if (this.currentRequest) {
      this.currentRequest.reject(err);
      this.currentRequest = null;
    }
    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests.shift();
      request.reject(err);
    }
  }

  /**
   * Terminates the child process and cleans up resources.
   */
  terminate() {
    this.rl.close();
    this.child.stdin.end();
    this.child.kill();
  }

  /**
   * Sends a command and returns a promise that resolves with all lines until termination.
   *
   * @param {string} command - Command to send
   * @param {number} timeout - Timeout in ms, defaults to 60 seconds
   * @returns {Promise<string[]>} - Promise that resolves with an array of lines
   */
  sendCommand(command, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const request = { resolve, reject, lines: [] };

      if (this.currentRequest) {
        this.pendingRequests.push(request);
      } else {
        this.currentRequest = request;
      }

      this.child.stdin.write(command + '\n');

      const timer = setTimeout(() => {
        if (this.currentRequest === request) {
          this.currentRequest = null;
        } else {
          const idx = this.pendingRequests.indexOf(request);
          if (idx !== -1) {
            this.pendingRequests.splice(idx, 1);
          }
        }
        reject(new Error('Timeout waiting for response'));
      }, timeout);

      const originalResolve = request.resolve;
      request.resolve = (lines) => {
        clearTimeout(timer);
        originalResolve(lines);

        if (this.pendingRequests.length > 0) {
          this.currentRequest = this.pendingRequests.shift();
        }
      };
    });
  }
}

module.exports = { GoAIInstance };
