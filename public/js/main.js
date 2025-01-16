async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse JSON data
        return data; // Return the processed data
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Rethrow the error for the caller to handle
    }
}

let game_id = "0"
let move_count = 0


document.addEventListener('DOMContentLoaded', () => {


    const tabs = document.querySelectorAll('[data-tab]');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            // Hide all content and remove active state from tabs
            contents.forEach(content => content.classList.add('hidden'));
            tabs.forEach(t => t.classList.remove('border-b-4', 'border-badukAccent'));

            if(targetTab == "play"){
                const startGameButton = document.getElementById('startGame');

                // Check if the button exists and trigger the click event
                if (startGameButton) {
                  const clickEvent = new Event('click', { bubbles: true, cancelable: true });
                  startGameButton.dispatchEvent(clickEvent);
                }
                
            }

            // Show selected content and highlight tab
            document.getElementById(targetTab).classList.remove('hidden');
            tab.classList.add('border-b-4', 'border-badukAccent');
            window.dispatchEvent(new Event('resize'));

        });
    });

    const selectors = document.getElementById('selectors');
    const wgoBoardDiv = document.getElementById('wgoBoard');
    const startGameButton = document.getElementById('startGame');
    const newGameButton = document.getElementById('newGame');
    const endGameButton = document.getElementById('endGame');
    const boardContainer = document.getElementById('boardContainer');
    let board = null;
    let boardsize = parseInt(document.getElementById('boardSize').value, 10);
    const rankSelector = document.getElementById('rankSelector')

    document.getElementById('boardSize').addEventListener("change", () => {
        rankSelector.classList.remove('hidden');
    })
    rankSelector.addEventListener("change", () => {
        startGameButton.classList.remove('hidden');
    })



    endGameButton.addEventListener('click', async () => {
        game_id = "0"
        move_count = 0
        let score = document.querySelector("#scorespan").textContent
        if(score[0] == "B"){
            alert("You won!")
            adjustRank(2) // increase rank by 2 on win
        }else{
            alert("You lost!")
            adjustRank(-1) // decrease rank by 1 on loss
        }
        
    })

    // Start Game
    startGameButton.addEventListener('click', async () => {
        rungame()
    })
    rungame()

    async function rungame(){
        boardsize = parseInt(document.getElementById('boardSize').value, 10)
        let rank = document.getElementById('playerRank').value

        if(isNaN(boardsize) || rank.endsWith("k") == false){
            console.log("Auto game started...")
            const beginner = convertKyuDanToLevel("35k")
            const playerlevel = convertKyuDanToLevel(getRank())
            if(playerlevel < beginner){
                boardsize = 7
            }else{
                boardsize = 9
            }
            rank = getRank()
        }
        console.log("New Game")

        move_count = 0

        // Hide selectors and show WGo.js board
        selectors.classList.add('hidden');
        wgoBoardDiv.classList.remove('hidden');
        // Initialize WGo.js Board
        boardContainer.innerHTML = "";
        board = new WGo.Board(boardContainer, {
            size: boardsize
        });
        endGameButton.classList.add('hidden');

        // Dynamically set board size to fit most of the screen
function resizeBoard() {
    const boardSize = Math.min(window.innerWidth, window.innerHeight) * 0.7; // 80% of the smaller dimension
    board.setDimensions(boardSize, boardSize); // Adjust the board dimensions
}

// Attach resize listener to update the board on window resize
window.addEventListener("resize", resizeBoard);

// Set initial size
resizeBoard();
        const game = new WGo.Game(boardsize); // Manages game state and rules
        game_id = await fetchData(`/create-game?boardsize=${boardsize}&rank=${rank}`);
        game_id = game_id.gameId
        console.log(game_id);

        // Restrict to one color (e.g., black)
        const stoneColor = WGo.B; // WGo.B for Black, WGo.W for White

        // Add a click event listener to place a stone// Board click event listener for player's move
board.addEventListener("click", async function (x, y) {
    if (!game.isOnBoard(x, y)) return; // Ignore invalid clicks

    // Check if it's the player's turn
    const isBlackTurn = move_count % 2 === 0;
    if ((stoneColor === WGo.B && !isBlackTurn) || (stoneColor === WGo.W && isBlackTurn)) {
        return; // Not the player's turn
    }

    // Play the move and validate using WGo.Game
    const result = game.play(x, y, stoneColor); // Validates and checks captures
    if (result === 1 || result === 2 || result === 3 || result === 4) {
        console.log("Invalid move:", result); // 1 = Out of bounds, 2 = Occupied, 3 = Suicide
        return;
    }

    // Add the player's stone to the board
    board.addObject({ x: x, y: y, c: stoneColor });
    addMarker(x, y, board, stoneColor); // Update the marker for the player's move

    // Remove captured stones
    result.forEach(captured => board.removeObjectsAt(captured.x, captured.y));

    // Convert move to Go notation (e.g., "D4")
    const playerMove = convertToCoords(x, y);
    console.log(`Player (${stoneColor === WGo.B ? "Black" : "White"}) move: ${playerMove}`);

    move_count++; // Switch turns
    document.querySelector("#movecountspan").textContent = move_count

    // Fetch and play AI move
    await handleAIMove(playerMove, board);

    if(move_count > 20){
        endGameButton.classList.remove('hidden');
    }
});

// Function to handle AI's move
async function handleAIMove(playerMove, board) {
    try {
        // sleep
        //await new Promise(resolve => setTimeout(resolve, 2000));

        const AI_COLOR = WGo.W

        // Fetch AI move, passing player's move as a parameter
        const response = await fetchData(`/move?id=${game_id}&move=${playerMove}`);
        console.log(response)
        const score = response.aiScore[0]
        const ai_move = response.aiResponse; // Example: "D4"
        console.log(`AI move: ${ai_move}`);
        if(ai_move == 'pass'){
            move_count++; // Switch turns
            document.querySelector("#movecountspan").textContent = move_count
            document.querySelector("#scorespan").textContent = score
            return;
        }

        // Convert AI move to coordinates
        const ai_x = ai_move[0].charCodeAt(0) - "A".charCodeAt(0) - (ai_move[0] >= "J" ? 1 : 0);
        const ai_y = parseInt(ai_move.slice(1)) - 1;

        // Play AI's move using WGo.Game
        const result = game.play(ai_x, ai_y, AI_COLOR); // AI is White
        if (result instanceof Array) {
            // Add AI's stone to the board
            board.addObject({ x: ai_x, y: ai_y, c: AI_COLOR });
            addMarker(ai_x, ai_y, board, AI_COLOR); // Update the marker for the AI's move


            // Remove captured stones
            result.forEach(captured => board.removeObjectsAt(captured.x, captured.y));

            console.log(`AI placed: ${ai_move}`);
            move_count++; // Switch turns
            document.querySelector("#movecountspan").textContent = move_count
            document.querySelector("#scorespan").textContent = score
        } else {
            console.error("AI made an invalid move:", result);
        }
    } catch (error) {
        console.error("Error fetching AI move:", error);
    }
}

// Helper function to convert coordinates to Go format (e.g., D4)
function convertToCoords(x, y) {
    const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ"; // Skips 'I'
    return `${letters[x]}${y + 1}`;
}

    };

    // New Game
    newGameButton.addEventListener('click', () => {
        wgoBoardDiv.classList.add('hidden');
        selectors.classList.remove('hidden');
        document.getElementById('playerRank').value = ""
        document.getElementById('boardSize').selectedIndex = 0
        startGameButton.classList.add('hidden');
        rankSelector.classList.add('hidden');
    });
});


let lastMarkerPosition = null; // To store the position of the last marker

function addMarker(x, y, board, color) {
    // Remove the previous marker if it exists
    if (lastMarkerPosition) {
        board.removeObject({
            x: lastMarkerPosition.x,
            y: lastMarkerPosition.y,
            type: "CR" // Specify the marker type to avoid removing stones
        });
    }

    if(color == WGo.W){
        // Add a new marker at the given coordinates
        board.addObject({
            x: x,
            y: y,
            type: "CR", // Circle marker
            c: "rgba(0, 0, 0, 0.6)", // Optional: Customize the marker color (semi-transparent blue)
        });
    }
    if(color == WGo.B){
        // Add a new marker at the given coordinates
        board.addObject({
            x: x,
            y: y,
            type: "CR", // Circle marker
            c: "rgba(255, 255, 255, 0.6)", // Optional: Customize the marker color (semi-transparent blue)
        });
    }

    // Update the last marker position
    lastMarkerPosition = { x: x, y: y };
}


