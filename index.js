const { SqlConnection } = require('./sql_connection');
const { GoAIInstance } = require('./ExternalAI');
const { Game } = require('tenuki');

/**
 * Converts GTP move string (e.g., D4) to Tenuki (x, y) coordinates.
 * @param {string} moveResponse - GTP move response.
 * @returns {Array<number>} - [x, y] coordinates or [undefined, undefined] for passes.
 */
function parseMove(moveResponse) {
    const trimmedResponse = moveResponse.trim();
    if (!trimmedResponse.startsWith('=')) {
        console.error('Invalid AI response:', moveResponse);
        return [undefined, undefined];
    }

    const move = trimmedResponse.slice(1).trim(); // Remove '=' prefix
    if (move.toLowerCase() === 'pass') {
        console.log('AI passed.');
        return [undefined, undefined]; // Representing a pass
    }

    // Convert GTP coordinates (e.g., "T18") to Tenuki coordinates
    let x = move.charCodeAt(0) - 'A'.charCodeAt(0); // Convert 'A'-based column to 0-indexed
    if (x >= 8) x--; // Skip the letter 'I' in GTP (standard in Go coordinate systems)
    const y = 19 - parseInt(move.slice(1), 10); // Convert row number to 0-indexed

    // Check for invalid coordinates
    if (x < 0 || x >= 19 || y < 0 || y >= 19) {
        console.error(`Invalid move coordinates: (${x}, ${y}) for move "${move}"`);
        return [undefined, undefined];
    }

    return [x, y];
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

/**
 * Prints the current state of the board.
 * @param {Game} game - Tenuki game instance.
 */
function printBoard(game) {
    const size = game.boardSize; // Access board size from the `board` object
    for (let y = 0; y < size; y++) {
        let row = '';
        for (let x = 0; x < size; x++) {
            const intersection = game.intersectionAt(y, x); // Get the intersection state
            if (!intersection) {
                row += '. '; // Empty intersection
            } else if (intersection === 'black') {
                row += 'B '; // Black stone
            } else if (intersection === 'white') {
                row += 'W '; // White stone
            }
        }
        console.log(row.trim());
    }
}

(async () => {
    const dbPath = 'AI_DATA.db'; // SQLite database path
    const sqlConnection = new SqlConnection(dbPath, true); // Enable debug mode

    try {
        const allAIs = await sqlConnection._send('SELECT path FROM AI');
        if (allAIs.length < 2) throw new Error('Not enough AI engines in the database.');

        const randomAIs = allAIs.sort(() => 0.5 - Math.random()).slice(0, 2);
        const [ai1Path, ai2Path] = randomAIs.map(ai => ai.path);

        console.log(`Selected AIs: ${ai1Path} vs ${ai2Path}`);


        const blackAI = new GoAIInstance(ai1Path, []); // Pachi
        const whiteAI = new GoAIInstance(ai2Path, []); // KataGo

        // Set up each AI with game parameters
        console.log('Setting up Black AI...');
        await blackAI.setup({ boardsize: 19, komi: 6.5, handicap: 0 });
        console.log('Setting up White AI...');
        await whiteAI.setup({ boardsize: 19, komi: 6.5, handicap: 0 });

        // Initialize Tenuki game
        const game = new Game({
            boardSize: 19, // Standard 19x19 Go board
            komi: 6.5, // Komi for white player
        });

        console.log('Match started!');

        let turn = 'black'; // Black starts
        for (let move = 0; move < 100; move++) { // Limit to 100 moves
            const currentAI = turn === 'black' ? blackAI : whiteAI; // The AI for the current turn
            const currentColor = turn === 'black' ? 'black' : 'white'; // Current player's color

            // Send 'genmove' command for the current color
            let moveResponse;
            try {
                moveResponse = await currentAI.sendCommand(`genmove ${currentColor}`);
            } catch (err) {
                console.error(`Error generating move for ${currentColor}:`, err);
                break;
            }

            console.log(`Got Move from ${currentColor.toUpperCase()}: ${moveResponse.trim()}`);

            const [x, y] = parseMove(moveResponse);
            if (x === undefined || y === undefined) {
                console.log(`${currentColor.toUpperCase()} passed.`);
                // Optionally, handle passes (e.g., consecutive passes end the game)
                break;
            }

            const success = game.playAt(y, x); // Tenuki uses (y, x) coordinates
            if (!success) {
                console.error(`Invalid move detected at (${x}, ${y}). Ending match.`);
                break;
            }

            // Inform both AIs about the move
            const gtpMove = convertMoveToGTP(x, y);
            try {
                await blackAI.sendCommand(`play ${currentColor} ${gtpMove}`);
                await whiteAI.sendCommand(`play ${currentColor} ${gtpMove}`);
            } catch (err) {
                console.error(`Error updating AIs with move ${gtpMove}:`, err);
                break;
            }

            // Print the board every 10 moves
            if ((move + 1) % 10 === 0) {
                console.log(`Board state after ${move + 1} moves:`);
                printBoard(game);
            }

            if (game.isOver()) {
                console.log('Game is over. Scoring...');
                const scores = game.score();
                console.log('Final Scores:', scores);
                break;
            }

            // Switch turn
            turn = turn === 'black' ? 'white' : 'black';
        }

        console.log('Game Over');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sqlConnection.close();
        // Optionally, stop the AI processes
        // blackAI.stop();
        // whiteAI.stop();
    }
})();
