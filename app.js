const { SqlConnection, TsumegoConnection } = require('./sql_connection');
const { trainingGame } = require('./train_database');
const { generateTsumego } = require('./tsumego_gen.js');
const { PlayerAI } = require('./playerAI');

const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
const path = require('path');
const { v4: uuidv4 } = require("uuid"); // For generating unique game IDs


const express = require('express');

const sql = new SqlConnection("./AI_Data.db")
const tsumego_sql = new TsumegoConnection("./tsumego_sets.db")
const aiInstances = {};


const AI_game_delay_seconds = 30

// seconds per week = 604800
// seconds per day = 86400
// seconds per hour = 3600
// seconds per minute = 60


const generateAiTable = async (dbConnection, boardSize) => {
    const sql = `SELECT path, level_${boardSize} FROM AI;`;

    let rows;
    try {
        // Fetch multiple rows (default behavior, as `single` is false)
        rows = await dbConnection._send(sql, { single: false });
        console.log(rows); // Will log an array of rows
    } catch (err) {
        console.error("Error fetching data from the database:", err);
        throw err;
    }


    if (!Array.isArray(rows)) {
        throw new Error("Query result is not an array.");
    }

    // Start constructing the HTML
    let html = `
    <html>
    <head>
        <style>
            table {
                border-collapse: collapse;
                width: 100%;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                cursor: pointer;
                background-color: #f2f2f2;
            }
        </style>
        <script>
function sortTable(n) {
    const table = document.getElementById("aiTable");
    let rows, switching, i, x, y, shouldSwitch, dir, switchCount = 0;
    switching = true;
    dir = "asc"; // Set the sorting direction to ascending

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            const xKey = x.getAttribute("data-key") ? parseFloat(x.getAttribute("data-key")) : x.innerHTML.toLowerCase();
            const yKey = y.getAttribute("data-key") ? parseFloat(y.getAttribute("data-key")) : y.innerHTML.toLowerCase();

            if (dir === "asc") {
                if (xKey > yKey) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (xKey < yKey) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchCount++;
        } else {
            if (switchCount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}
        </script>
    </head>
    <body>
        <table id="aiTable">
            <thead>
                <tr>
                    <th onclick="sortTable(0)">Path</th>
                    <th onclick="sortTable(1)">Converted Rank</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Add rows to the table
    rows.forEach(row => {
        const path = row.path;
        const rank = row[`level_${boardSize}`];
        const convertedRank = convertLevelToKyuDan(rank); // Implement this function
        html += `<tr><td>${path}</td><td data-key="${rank}">${convertedRank}</td></tr>\n`;
    });

    // Close the table and HTML structure
    html += `
            </tbody>
        </table>
    
    <script>
        sortTable(1);
        sortTable(1);
        // Timer to refresh the page every 10 minutes
setTimeout(() => {
    location.reload(); // Reload the webpage
}, 600000); // 600,000 milliseconds = 10 minutes

    </script>

    </body>
    </html>
    `;

    return html;
};


// Express server setup
const app = express();
const PORT = 3001;

// Route to serve the AI table
app.get('/ai-table', async (req, res) => {
    const boardSize = parseInt(req.query.boardsize) || 19; // Default to 19 if not provided

    try {
        const html = await generateAiTable(sql, boardSize);
        res.send(html);
    } catch (error) {
        res.status(500).send("Error generating AI table.<br>" + error);
    }
});
app.get('/tsumego-rate', async (req, res) => {
    // Extract query parameters
    const { puzzle_id, delta } = req.query; // 1 for like, -1 for dislike

    console.log(`Tsumego like Data:`);
    console.log(`  Puzzle ID: ${puzzle_id}`);
    console.log(`  Delta: ${delta}`);

    await tsumego_sql.adjustHappyScore(puzzle_id, delta);

    // Send a simple response back
    res.send('Tsumego rating data logged to the console.');
});
app.get('/tsumego-complete', async (req, res) => {
    // Extract query parameters
    const { is_correct, puzzle_id, user_rank } = req.query;

    // Log the parameters to the console
    console.log(`Tsumego Completion Data:`);
    console.log(`  Is Correct: ${is_correct}`);
    console.log(`  Puzzle ID: ${puzzle_id}`);
    console.log(`  User Rank: ${user_rank}`);

    const puzzle_rating = await tsumego_sql.getPuzzleRatingById(puzzle_id);
    const user_rating = await convertKyuDanToLevel(user_rank);

    if (Math.abs(puzzle_rating - user_rating) <= 4) {
        if (is_correct == 'true') {
            console.log("Correct")
            await tsumego_sql.adjustRating(puzzle_id, -1)
            await tsumego_sql.markPuzzleAsSolved(puzzle_id)
        } else {
            console.log("Incorrect")
            await tsumego_sql.adjustRating(puzzle_id, 1)
        }
    }

    // Send a simple response back
    res.send('Tsumego completion data logged to the console.');
});


// get requests

// for tsumego puzzles
app.get('/get-tsumego', async (req, res) => {
    const { difficulty, type } = req.query;

    // Validate the parameters
    if (!difficulty || !type) {
        return res.status(400).json({ error: 'Missing required parameters: difficulty and type' });
    }

    try {
        const puzzle = await generateTsumego(difficulty, type, tsumego_sql);

        if (!puzzle) {
            return res.status(404).json({ error: 'Puzzle not found or failed to generate.' });
        }

        res.status(200).json({ puzzle: puzzle.sgf, id: puzzle.id });
    } catch (err) {
        console.error('Error handling /get-tsumego request:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

async function task() {
    try {
      console.log(`Training game started at ${new Date().toISOString()}`);
  
      // Kick off all tasks at the same time.
      // Promise.all waits until they all complete (or fail on any error).
      await Promise.all([
        trainingGame(sql, 9),
        trainingGame(sql, 13),
        trainingGame(sql, 19),
      ]);
  
      console.log(`Training game completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`Error during training game: ${error.message}`);
    } finally {
      // Schedule the next execution after these tasks complete
      setTimeout(task, AI_game_delay_seconds * 1000);
    }
  }
  

async function cleanup() {
    try {
        const min_5 = 5 * 60 * 1000; // 5 minutes in milliseconds
        const now = Date.now(); // Current timestamp in milliseconds

        for (const key in aiInstances) {
            const aiInstance = aiInstances[key];

            // Check if the instance's last move time is older than 5 minutes
            if (now - aiInstance.ai.last_move_time > min_5) {
                console.log(`Terminating AI instance: ${key}`);
                await aiInstance.ai.terminate(); // Call terminate method
                delete aiInstances[key]; // Remove the instance from the collection
            }
        }
    } catch (error) {
        console.error(`Error during cleanup: ${error.message}`);
    } finally {
        // Schedule the cleanup function to run again after 1 minute
        setTimeout(cleanup, 60 * 1000);
    }
}

app.use(express.static(path.join(__dirname, 'public')));

// AI move creation / game creation

// Endpoint to create a new game
app.get("/create-game", async (req, res) => {
    let { komi = 6.5, handicap = 0, rank = "30k", boardsize = 13, ai_color = "white", type = "normal" } =
        req.query;


    console.log(req.query)
    // games types
    // normal -> standard game
    // handicap -> game with handicap stones
    // chinese -> place stones on opposing corners

    komi = parseInt(komi)
    handicap = parseInt(handicap)
    boardsize = parseInt(boardsize)

    const gameId = uuidv4();

    const pAI = new PlayerAI();

    await pAI.create(sql, komi, boardsize, handicap, rank, ai_color, type);

    aiInstances[gameId] = {
        ai: pAI,
        komi: komi,
        handicap: handicap,
        rank: rank
    };

    res.json({ gameId });
});

// Endpoint to make a move
app.get("/move", async (req, res) => {
    const { id, move } = req.query;
    console.log("?GOT MOVE REQUEST:")
    console.log(id)
    console.log(move)
    if (!id || !move) {
        return res.status(400).json({ error: "Game ID and move are required." });
    }

    const game = aiInstances[id];
    if (!game) {
        return res.status(404).json({ error: "Game not found." });
    }

    try {
        console.log("Playing the move B")
        // Send the player's move to the AI
        let { response, score } = await game.ai.play(move);

        res.json({ aiResponse: response, aiScore: score });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

cleanup()
task()
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// End of file