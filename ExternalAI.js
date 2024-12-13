const { spawn } = require("child_process");
const path = require('path');
const shellQuote = require('shell-quote');
const fs = require('fs');

/**
 * Utility function to pause execution for a specified duration.
 * @param {number} ms - Duration in milliseconds.
 * @returns {Promise} - Resolves after the specified duration.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates if the given path exists and is executable.
 * @param {string} executablePath - Path to the executable.
 * @returns {boolean} - True if valid, else false.
 */
function validateExecutable(executablePath) {
    try {
        if (fs.existsSync(executablePath)) {
            // On Unix-like systems, you might check for execute permissions
            // On Windows, existence is usually sufficient
            return true;
        } else {
            console.error(`Executable not found at path: ${executablePath}`);
            return false;
        }
    } catch (err) {
        console.error(`Error validating executable path: ${err.message}`);
        return false;
    }
}

/**
 * A class to manage a single Go AI instance.
 */
class GoAIInstance {
    /**
     * Initializes a new instance of the GoAIInstance class.
     * @param {string} command - The command to execute (including executable path and initial arguments).
     * @param {Array<string>} additionalArgs - Additional arguments for the AI process.
     */
    constructor(command, additionalArgs = []) {
        // Parse the command string into tokens, handling quotes and spaces
        const parsed = shellQuote.parse(command);
        if (parsed.length === 0) {
            throw new Error('Invalid command provided to GoAIInstance.');
        }

        // Extract the executable and its initial arguments
        const executable = parsed[0];
        const cmdArgs = parsed.slice(1);

        // Resolve the executable path
        const resolvedPath = path.resolve(executable) ;

        // Validate executable path
        if (!validateExecutable(resolvedPath)) {
            throw new Error(`Executable not found or inaccessible: ${resolvedPath}`);
        }

        // Spawn the AI process with initial and additional arguments
        this.process = spawn(resolvedPath, [...cmdArgs, ...additionalArgs]);

        // Handle process errors
        this.process.on('error', (err) => {
            console.error(`Error starting AI process (${resolvedPath}):`, err);
        });

        // Handle process exit
        this.process.on('exit', (code, signal) => {
            console.log(`AI process (${resolvedPath}) exited with code ${code}, signal ${signal}`);
        });

        // Handle stderr data
        this.process.stderr.on('data', (data) => {
            console.error(`AI process stderr (${resolvedPath}): ${data.toString().trim()}`);
        });

        // Initialize command queue
        this.commandQueue = [];
        this.isProcessing = false;
    }

    /**
     * Sends a command to the AI process and awaits a response.
     * @param {string} command - The command to send.
     * @param {number} timeoutDuration - Maximum time to wait for a response in milliseconds.
     * @returns {Promise<string>} - Resolves with the AI's response.
     */
    sendCommand(command, timeoutDuration = 120000) {
        return new Promise((resolve, reject) => {
            // Queue the command
            this.commandQueue.push({ command, resolve, reject, timeoutDuration });
            this.processQueue();
        });
    }

    /**
     * Processes the next command in the queue.
     */
    async processQueue() {
        if (this.isProcessing || this.commandQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const { command, resolve, reject, timeoutDuration } = this.commandQueue.shift();

        console.log(`Sent: ${command}`);
        let output = "";

        // Define listeners
        const onData = (data) => {
            const chunk = data.toString();
            output += chunk;
            console.log(`AI Response Chunk: "${chunk.trim()}"`); // Debugging

            // Check if the response ends with two newlines, indicating end of response
            if (output.endsWith('\n\n')) {
                cleanup();

                // Parse the response
                const response = output.trim();
                if (response.startsWith('=')) {
                    const content = response.slice(1).trim();
                    console.log(`AI Response: "${content}"`);
                    resolve(content);
                } else if (response.startsWith('?')) {
                    const error = response.slice(1).trim();
                    reject(new Error(`AI Error: ${error}`));
                } else {
                    reject(new Error(`Unexpected AI response: ${response}`));
                }
            }
        };

        const onEnd = () => {
            cleanup();
            reject(new Error(`AI process stream ended before responding to "${command}". Output so far: "${output.trim()}"`));
        };

        const onError = (err) => {
            cleanup();
            reject(new Error(`Error during communication with AI process: ${err.message}`));
        };

        // Cleanup function to remove listeners and clear timeout
        const cleanup = () => {
            clearTimeout(timeout);
            this.process.stdout.removeListener("data", onData);
            this.process.stdout.removeListener("end", onEnd);
            this.process.removeListener("error", onError);
            this.isProcessing = false;
            this.processQueue();
        };

        // Set up timeout
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`AI process did not respond to "${command}" in time. Output so far: "${output.trim()}"`));
        }, timeoutDuration);

        // Attach listeners
        this.process.stdout.on("data", onData);
        this.process.stdout.once("end", onEnd);
        this.process.once("error", onError);

        // Write the command to stdin
        this.process.stdin.write(`${command}\n`, (err) => {
            if (err) {
                cleanup();
                reject(new Error(`Failed to write command "${command}" to AI process: ${err.message}`));
            }
        });
    }

    /**
     * Stops the AI process.
     */
    stop() {
        if (this.process) {
            this.process.kill();
            console.log('AI process has been terminated.');
        }
    }

    /**
     * Sets up the AI with the provided options.
     * @param {Object} options - Configuration options for the AI.
     * @param {number} [options.boardsize] - Size of the Go board.
     * @param {number} [options.komi] - Komi value.
     * @param {number} [options.handicap] - Number of handicap stones.
     */
    async setup(options) {
        await sleep(5000); // Pause for 5000 milliseconds (5 seconds)

        const { boardsize, komi, handicap } = options;

        try {
            if (boardsize) {
                console.log(`Setting boardsize to ${boardsize}`);
                await this.sendCommand(`boardsize ${boardsize}`);
            }

            if (komi !== undefined) {
                console.log(`Setting komi to ${komi}`);
                await this.sendCommand(`komi ${komi}`);
            }

            if (handicap) {
                console.log(`Setting handicap to ${handicap}`);
                await this.sendCommand(`fixed_handicap ${handicap}`);
            }

            console.log('AI setup complete.');
        } catch (err) {
            console.error('Error during AI setup:', err);
        }
    }
}

/**
 * Converts Tenuki (x, y) coordinates to GTP move format (e.g., D4).
 * @param {number} x - X-coordinate (0-based).
 * @param {number} y - Y-coordinate (0-based).
 * @returns {string} - GTP move string.
 */
function convertMoveToGTP(x, y) {
    // Convert x to letters, skipping 'I'
    let letter = String.fromCharCode('A'.charCodeAt(0) + x + (x >= 8 ? 1 : 0));
    // Convert y to numbers (1-based, top to bottom)
    let number = 19 - y;
    return `${letter}${number}`;
}

module.exports = { GoAIInstance };
