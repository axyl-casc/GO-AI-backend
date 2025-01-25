
const { GoAIInstance } = require('./ExternalAI');
const { Game } = require('tenuki');

const DEBUG = true;

async function playGame(team1_paths, team2_paths, handicap_stone_count, komi, boardsize) {
    console.log(`New game started\n\n${team1_paths}\n\nVERSUS\n\n${team2_paths}\n`);
    const team1 = [];
    const team2 = [];
    let team1_counter = 0;
    let team2_counter = 0;
    let move_list = [];

    for (let t of team1_paths) {
        let [exePath, args] = parseCommand(t);
        team1.push(new GoAIInstance(exePath, args));
    }
    for (let t of team2_paths) {
        let [exePath, args] = parseCommand(t);
        team2.push(new GoAIInstance(exePath, args));
    }

    const colors = ['black', 'white'];
    let turn_counter = 0;

    // Initialize Tenuki game
    const game = new Game({
        scoring: "area",
        handicapStones: handicap_stone_count,
        freeHandicapPlacement: false,
        boardSize: boardsize,
        komi: komi
    });


    const allAIs = [...team1, ...team2];
    for (let ai of allAIs) {
        await ai.sendCommand(`clear_board`);
        await ai.sendCommand(`boardsize ${boardsize}`);
        await ai.sendCommand(`komi ${komi}`);
    }
    let placed_stones = scanBoardStones(game)
    // Propagate the scanned stones to all AIs
    for (const stone of placed_stones) {
        const gtpMove = formatToGTP(stone.x, stone.y, boardsize); // Convert coordinates to GTP
        for (let ai of allAIs) {
            await ai.sendCommand(`play black ${gtpMove}`);
        }
    }
    if (placed_stones.length > 0) {
        turn_counter++; // white goes first
    }

    // Initialize all AIs
    try {
        while (turn_counter < boardsize * 10 && !game.isOver()) {
            // Determine the current team and AI making the move
            const currentTeam = turn_counter % 2 === 0 ? team1 : team2;
            let currentPlayer;
            if (currentTeam === team1) {
                currentPlayer = currentTeam[team1_counter % currentTeam.length];
                team1_counter++;
            }
            if (currentTeam === team2) {
                currentPlayer = currentTeam[team2_counter % currentTeam.length];
                team2_counter++;
            }

            const moveColor = colors[turn_counter % 2];

            // Generate a move
            let stone_move = await currentPlayer.sendCommand(`genmove ${moveColor}`);
            stone_move = stone_move[0]
            stone_move = cleanMove(stone_move);


            //if (turn_counter % 5 == 0) {
            //   print_board(game);
            //}

            // Check if the move is "resign" or "pass"
            if (stone_move.toLowerCase() === "resign" || stone_move.toLowerCase() === "pass") {
                game.pass();
                turn_counter++;
            } else {
                // Parse the move into board coordinates
                let [x, y] = parseCoordinates(stone_move, boardsize);

                move_list.push(stone_move);

                // Apply the move to the Tenuki board
                if (game.playAt(y, x)) {
                    // Propagate the move to all other AIs
                    for (let ai of allAIs) {
                        if (ai !== currentPlayer) {
                            await ai.sendCommand(`play ${moveColor} ${stone_move}`);
                        }
                    }


                    turn_counter++;
                } else {
                    console.error("Invalid Move Attempted");
                    console.error(currentPlayer.exePath);
                    console.error(currentPlayer.args);
                    game.pass();
                    turn_counter++;

                }
            }
            process.stdout.write(".");

        }

        const score_diff = game.score().black - game.score().white;
        console.log(`\n\nScore:\nBlack: ${game.score().black}\nWhite: ${game.score().white}`);
        let scores = [];

        for (let ai of allAIs) {
            let AI_score = await ai.sendCommand(`final_score`);
            scores.push(cleanMove(AI_score[0]));
        }
        if (game.score().black > game.score().white) {
            scores.push(`B+${score_diff}`);
        } else {
            scores.push(`W+${-score_diff}`);
        }
        console.log(scores);
        let game_result = countResults(scores);
        console.log(game_result);
        let certainty = 0;

        // tell AI to exit
        for (let ai of allAIs) {
            await ai.sendCommand(`quit`);
            await ai.terminate();
        }

        // for a tie breaker, assume server is correct
        if (game_result.bCount == game_result.wCount) {
            if (game.score().black > game.score().white) {
                scores.push(`B+${score_diff}`);
            } else {
                scores.push(`W+${-score_diff}`);
            }
        }
        game_result = countResults(scores);

        if (game_result.bCount > game_result.wCount) {
            console.log("Black Won");
            certainty = (game_result.bCount / (game_result.bCount + game_result.wCount)) * 100
            return { winner: team1_paths[0], certainty: certainty };
        } else {
            console.log("White Won");
            certainty = (game_result.wCount / (game_result.bCount + game_result.wCount)) * 100
            return { winner: team2_paths[0], certainty: certainty };
        }

    } catch (err) {
        console.error('Error communicating with external AI:', err);
    }

    console.log("End of File");
    return { winner: null, certainty: 100 }; // In case of an error or tie
}


function countResults(results) {
    let bCount = 0;
    let wCount = 0;

    for (let result of results) {
        if (result.startsWith('B+')) {
            bCount++;
        } else if (result.startsWith('W+')) {
            wCount++;
        }
    }

    return { bCount, wCount };
}

function cleanMove(input) {
    // Trim any leading or trailing whitespace and remove the leading '=' if present
    return input.trim().replace(/^=\s*/, '');
}


function parseCommand(command) {
    const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g);
    if (!parts || parts.length === 0) throw new Error("Invalid command string");
    const exePath = parts[0];
    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, '').replace(/\s*=\s*/g, '='));
    return [exePath, args];
}

function parseCoordinates(move, boardsize) {
    // Extract the column (letter) and row (number) from the move string
    const colLetter = move[0].toUpperCase();
    const row = parseInt(move.slice(1)) - 1; // Convert to 0-based index

    // Calculate column index, skipping 'I'
    const col = colLetter < 'I'
        ? colLetter.charCodeAt(0) - 'A'.charCodeAt(0) // Before 'I'
        : colLetter.charCodeAt(0) - 'A'.charCodeAt(0) - 1; // After 'I'

    return [col, boardsize - row - 1];
}

function print_board(game) {
    console.log('\n');
    // Print the board's current state
    const size = game.boardSize; // Assuming a 19x19 board
    for (let y = 0; y < size; y++) {
        let row = '';
        for (let x = 0; x < size; x++) {
            const intersection = game.intersectionAt(y, x).value;
            if (intersection === 'empty') {
                row += '.';
            } else if (intersection === 'black') {
                row += 'B';
            } else if (intersection === 'white') {
                row += 'W';
            }
        }
        console.log(row);
    }
    console.log('\n');
}

function scanBoardStones(game) {
    const size = game.boardSize;
    const stones = [];

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const intersection = game.intersectionAt(y, x).value;
            if (intersection === 'black' || intersection === 'white') {
                stones.push({ x, y, color: intersection }); // Store x, y, and color
            }
        }
    }

    return stones;
}

function formatToGTP(x, y, boardSize) {
    const column = String.fromCharCode(x + 'A'.charCodeAt(0) + (x >= 8 ? 1 : 0)); // Skip 'I'
    const row = boardSize - y;
    return `${column}${row}`;
}

module.exports = { playGame, formatToGTP, scanBoardStones, parseCoordinates, parseCommand, cleanMove };
