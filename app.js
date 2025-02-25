
const { SqlConnection, TsumegoConnection } = require("./sql_connection");
const { trainingGame } = require("./train_database");
const { generateTsumego } = require("./tsumego_gen.js");
const { PlayerAI } = require("./playerAI");

const {
	convertKyuDanToLevel,
	convertLevelToKyuDan,
} = require("./rank_conversion");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // For generating unique game IDs

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const db = require("./jsondb"); // Import JSON database
const feedbackdb = require("./jsondb_static");

const sql = new SqlConnection("./AI_Data.db");
const tsumego_sql = new TsumegoConnection("./tsumego_sets.db");
const aiInstances = {};

// seconds per week = 604800
// seconds per day = 86400
// seconds per hour = 3600
// seconds per minute = 60
const AI_game_delay_seconds = 60;
let is_train = true;
const DEBUG = false;

// app.js

const CONFIG_PATH = 'data/config.json';

try {
    // Read and parse the JSON file
    const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    // Assign global values
    global.RAM = parseInt(configData.RAM, 10);
    global.VRAM = parseInt(configData.VRAM, 10);
	is_train = configData.is_train
    console.log(`RAM: ${global.RAM} GB`);
    console.log(`VRAM: ${global.VRAM} GB`);
} catch (error) {
    console.error('Error reading config.json:', error);
}

console.log(`Total RAM: ${global.RAM} GB`);
console.log(`Total VRAM: ${global.VRAM} GB`);



function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled; // The maximum is inclusive and the minimum is inclusive
}

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
	rows.forEach((row) => {
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
app.get("/ai-table", async (req, res) => {
	const boardSize = parseInt(req.query.boardsize) || 19; // Default to 19 if not provided

	try {
		const html = await generateAiTable(sql, boardSize);
		res.send(html);
	} catch (error) {
		res.status(500).send("Error generating AI table.<br>" + error);
	}
});
app.get("/tsumego-rate", async (req, res) => {
	// Extract query parameters
	const { puzzle_id, delta } = req.query; // 1 for like, -1 for dislike

	console.log("Tsumego like Data:");
	console.log(`  Puzzle ID: ${puzzle_id}`);
	console.log(`  Delta: ${delta}`);

	await tsumego_sql.adjustHappyScore(puzzle_id, delta);

	// Send a simple response back
	res.send("Tsumego rating data logged to the console.");
});
app.get("/tsumego-complete", async (req, res) => {
	// Extract query parameters
	const { is_correct, puzzle_id, user_rank } = req.query;

	// Log the parameters to the console
	console.log("Tsumego Completion Data:");
	console.log(`  Is Correct: ${is_correct}`);
	console.log(`  Puzzle ID: ${puzzle_id}`);
	console.log(`  User Rank: ${user_rank}`);

	const puzzle_rating = await tsumego_sql.getPuzzleRatingById(puzzle_id);
	const user_rating = await convertKyuDanToLevel(user_rank);

	if (Math.abs(puzzle_rating - user_rating) <= 4) {
		if (is_correct === "true") {
			console.log("Correct");
			await tsumego_sql.adjustRating(puzzle_id, -1);
			await tsumego_sql.markPuzzleAsSolved(puzzle_id);
		} else {
			console.log("Incorrect");
			await tsumego_sql.adjustRating(puzzle_id, 1);
		}
	}

	// Send a simple response back
	res.send("Tsumego completion data logged to the console.");
});

// get requests

// for tsumego puzzles
app.get("/get-tsumego", async (req, res) => {
	const { difficulty, type } = req.query;

	// Validate the parameters
	if (!difficulty || !type) {
		return res
			.status(400)
			.json({ error: "Missing required parameters: difficulty and type" });
	}

	try {
		const puzzle = await generateTsumego(
			difficulty,
			type,
			tsumego_sql,
			db.getValues().puzzleDelta,
		);

		if (!puzzle) {
			return res
				.status(404)
				.json({ error: "Puzzle not found or failed to generate." });
		}
		res.status(200).json({ puzzle: puzzle.sgf, id: puzzle.id });
	} catch (err) {
		console.error("Error handling /get-tsumego request:", err);
		res.status(500).json({ error: "Internal server error." });
	}
});

let training_timer = null;

let isTaskRunning = false; // Add this line at the top with other variables

async function task() {
	if (isTaskRunning) {
		console.log("Task is already running. Skipping...");
		return;
	}
	isTaskRunning = true;
	try {
		if (Object.keys(aiInstances).length < 1) {
			console.log(`Training game started at ${new Date().toISOString()}`);
			await trainingGame(sql, 9);
			await trainingGame(sql, 13);
			await trainingGame(sql, 19);
			console.log(`Training game completed at ${new Date().toISOString()}`);
		} else {
			console.log(
				`Skipped training...\nLIVE games -> ${Object.keys(aiInstances).length}`,
			);
		}
	} catch (error) {
		console.log(`Error during training game: ${error.message}`);
	} finally {
		isTaskRunning = false;
		// Schedule next task after the delay
		training_timer = setTimeout(task, AI_game_delay_seconds * 1000);
	}
}

// Modify the cleanup function's finally block
async function cleanup() {
	try {
		const min = 3 * 60 * 1000;
		// ~3 mins per move should be plenty of time?
		const now = Date.now();

		for (const key in aiInstances) {
			const aiInstance = aiInstances[key];
			console.log(aiInstance.ai.last_move_time);
			if (now - aiInstance.ai.last_move_time > min) {
				console.log(`Terminating AI instance: ${key}`);
				await aiInstance.ai.terminate();
				delete aiInstances[key];
			}
		}
	} catch (error) {
		console.error(`Error during cleanup: ${error.message}`);
	} finally {
		setTimeout(cleanup, 60 * 1000); // Remove the task() call from here
	}
}

app.use(express.static(path.join(__dirname, "public")));

// Endpoint to create a new game
app.get("/create-game", async (req, res) => {
	let {
		companion_key = 38,
		komi = 6.5,
		handicap = 0,
		rank = "30k",
		boardsize = 13,
		ai_color = "white",
		type = "normal",
		client_id, // expect client_id to be provided as a query parameter
	} = req.query;

	// Validate that the client_id is provided
	if (!client_id) {
		return res
			.status(400)
			.json({ error: "Missing 'client_id' query parameter." });
	}

	console.log("Query parameters:", req.query);

	komi = parseInt(komi);
	komi = Math.floor(komi) + 0.5;
	handicap = parseInt(handicap);
	boardsize = parseInt(boardsize);

	// Create a new game
	const gameId = uuidv4();
	const pAI = new PlayerAI();
	let game_created = false
	while(game_created === false){
		try{
			await pAI.create(
				sql,
				komi,
				boardsize,
				handicap,
				rank,
				ai_color,
				type,
				companion_key,
				await db.getValues().AIDelta,
			);
			game_created = true;
		}catch{
			console.log("Error creating game, trying again...")
		}
	}

	for (const key in aiInstances) {
		if (aiInstances[key].client_id === client_id) {
			// Terminate the existing AI instance
			if (typeof aiInstances[key].ai.terminate === "function") {
				aiInstances[key].ai.terminate(); // Assuming the AI instance has a terminate method
			}
			delete aiInstances[key]; // Remove it from the mapping
			break; // Exit loop once found and terminated
		}
	}

	// Store the new AI instance and update the mapping for this client_id
	aiInstances[gameId] = {
		ai: pAI,
		komi: komi,
		handicap: handicap,
		rank: rank,
		client_id: client_id,
	};

	res.json({ gameId });
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get("/move", async (req, res) => {
	const { id, move, boardsize, movetime } = req.query;
	console.log("?GOT MOVE REQUEST:");
	console.log(`Game id = ${id}`);
	console.log(move);
	console.log(`Boardsize: ${boardsize}`);
	console.log(`Move time taken: ${movetime}`)
	const player_move_time = parseInt(movetime)
	if (!id || !move) {
		return res.status(400).json({ error: "Game ID and move are required." });
	}

	const game = aiInstances[id];
	game.player_move_time = player_move_time;
	if (!game) {
		return res.status(404).json({ error: "Game not found." });
	}
	//AIPlayspeedDelta
	try {
		console.log("Playing the move B");

		// Start timing
		const startTime = performance.now();

		// Send the player's move to the AI
		const { response, score, hint } = await game.ai.play(move);

		// End timing
		const endTime = performance.now();
		const moveTime = (endTime - startTime) / 1000; // Convert ms to seconds
		console.log(`Move generation time: ${moveTime.toFixed(3)} seconds`);

		// Determine the total time the request should take
		const upper_time = Math.floor(boardsize / 2);
		const lower_time = 1;
		const totalTime =
			getRandomInt(lower_time, upper_time) + db.getValues().AIPlayspeedDelta;
		console.log(`Random sleep time -> ${totalTime}`)
		let sleepTime = totalTime;
		const ai_sleep_ratio = 0.5;
		sleepTime = ((ai_sleep_ratio)*sleepTime + (1 - ai_sleep_ratio)*player_move_time);
		console.log(`Weighted sleep time -> ${sleepTime}`)
		sleepTime -= moveTime; // remove time taken to generate move
		console.log(`Sleep time after move delay -> ${sleepTime}`)

		sleepTime = Math.ceil(sleepTime);
		// clamp time
		sleepTime = Math.max(1, sleepTime);
		sleepTime = Math.min(30, sleepTime);
		// sleep for at least 1 second
		// sleep no longer than 30 seconds

		console.log(
			`Attempting sleep for ${sleepTime.toFixed(3)} seconds to meet delay target...`,
		);
		if (game.ai.moveCount >= 5 && sleepTime > 1 && !DEBUG) {
			console.log("Sleeping...");
			await sleep(sleepTime * 1000); // Convert to milliseconds
			console.log("Done sleeping")
		}

		res.json({
			aiResponse: response,
			aiScore: score,
			hint: hint,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Submit feedback and adjust AI and puzzle difficulty
app.post("/submit-feedback", (req, res) => {
	const feedback = req.body;

	if (!feedback) {
		return res.status(400).json({ error: "Invalid feedback data" });
	}
	feedbackdb.add("feedback", feedback); // Store feedback in feedback.json

	console.log("Received Feedback:", feedback);

	// Adjust AI difficulty
	if (feedback.ai_difficulty === "too_easy") {
		db.increment("AIDelta");
	} else if (feedback.ai_difficulty === "too_hard") {
		db.decrement("AIDelta");
	}

	// Adjust puzzle difficulty
	if (feedback.puzzle_difficulty === "too_easy") {
		db.increment("puzzleDelta");
	} else if (feedback.puzzle_difficulty === "too_hard") {
		db.decrement("puzzleDelta");
	}
	// Adjust ai speed
	if (feedback.ai_speed === "too_fast") {
		db.increment("AIPlayspeedDelta");
	} else if (feedback.ai_speed === "too_slow") {
		db.decrement("AIPlayspeedDelta");
	}

	res.status(200).json({
		message: "Feedback stored successfully",
		adjustments: db.getValues(), // Return updated values
	});
});

// Get all feedback entries
app.get("/view-feedback", (req, res) => {
	res.json(feedbackdb.get("feedback"));
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/feedback", (req, res) => {
	res.sendFile(path.join(__dirname, "/public/feedback.html"));
});

cleanup();

if (is_train) {
	task();
}

//
function deleteDirectorySync(targetPath) {
	if (fs.existsSync(targetPath)) {
		// Delete directory with all contents
		fs.rmSync(targetPath, {
			recursive: true,
			force: true,
			maxRetries: 3,
			retryDelay: 100,
		});
		console.log(`Successfully deleted ${targetPath}`);
	}
}

// Usage
const directoryToDelete = path.join(__dirname, "gtp-logs");
deleteDirectorySync(directoryToDelete);
// Start the server
app.listen(PORT, () => {
	console.log("SERVER_READY");
	console.log(`Server is running on http://localhost:${PORT}`);
});

// End of file
