
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

            // Show selected content and highlight tab
            document.getElementById(targetTab).classList.remove('hidden');
            tab.classList.add('border-b-4', 'border-badukAccent');
            window.dispatchEvent(new Event('resize'));
            document.getElementById('profile-rank').innerHTML = localStorage.getItem('local_rank') || "Error" // set rank to last rank used  
            document.querySelectorAll(".wgo-tsumego-control").forEach((element) => {
                element.style.display = "none"; // Properly hides the elements
            });
            if (targetTab == "play") {
                const startGameButton = document.getElementById('startGame');

                // Check if the button exists and trigger the click event
                if (startGameButton) {
                    const clickEvent = new Event('click', { bubbles: true, cancelable: true });
                    startGameButton.dispatchEvent(clickEvent);
                }
                let testDiv = document.getElementById("boardContainer");
                testDiv.scrollIntoView({
                    behavior: "auto",
                    block: "center",
                    inline: "center",
                });


            }

            if (targetTab == "learn") {
                document.querySelector("#learninfo").innerHTML = "";
                document.querySelector("#learnboard").innerHTML = "";
                updateLessonsVisibility();
            }

            if (targetTab == "puzzle") {
                let testDiv = document.getElementById("tsumego_wrapper");
                testDiv.scrollIntoView({
                    behavior: "auto",
                    block: "center",
                    inline: "center",
                });
            }

            if(targetTab == "profile") {
                document.getElementById('profile-rank').textContent = getDisplayRank()
                document.getElementById('profile-games-played').textContent = getGamesPlayed();
                document.getElementById('profile-wins').textContent = getPlayerWins();
                document.getElementById('profile-puzzles-done').textContent = getPuzzlesDone();
                document.getElementById('profile-puzzles-correct').textContent = getPuzzlesCorrect();
            }

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
        incrementGamesPlayed();
        game_id = "0"
        let score = document.querySelector("#scorespan").textContent
        if (score[0] == "B" && move_count != 0) {
            showToast("You won!")
            incrementPlayerWins();
            adjustRank(1) // increase rank by 1 on win
        } else if (move_count != 0) {
            showToast("You lost!")
            setHasLost(true);
            adjustRank(-1) // decrease rank by 1 on loss
            if(convertKyuDanToLevel(getRank()) <= convertKyuDanToLevel("15k")) {
                adjustRank(-1)
            }
        }

         document.getElementById("rankspan").innerHTML = getDisplayRank()
        document.getElementById("movecountspan").innerHTML = "..."
        move_count = 0
        document.querySelector('[data-tab="play"]').click();

    })

    // Start Game
    startGameButton.addEventListener('click', async () => {
        rungame()
    })
    rungame()

    async function rungame() {
        document.getElementById("rankspan").innerHTML = getDisplayRank()
        boardsize = parseInt(document.getElementById('boardSize').value, 10)
        let rank = document.getElementById('playerRank').value
        rank = getRank()
        if (isNaN(boardsize)) {
            console.log("Auto game started...")

            // 7x7
            const beginner = convertKyuDanToLevel("35k")
            // 9x9
            const intermediate = convertKyuDanToLevel("20k")
            // 13x13
            const advanced = convertKyuDanToLevel("16k")
            // 19x19

            // spread
            const rndSpread = 2;
            let playerlevel = convertKyuDanToLevel(getRank()) + getRandomInt(-rndSpread, rndSpread);

            // add a bit of randomness to the player level

            if (playerlevel < beginner) {
                boardsize = 7
            } else if (playerlevel < intermediate) {
                boardsize = 9
            } else if (playerlevel < advanced) {
                boardsize = 13
            } else {
                boardsize = 19
            }
            playerlevel = convertKyuDanToLevel(getRank())

        }

        // shift + alt + f
        console.log("New Game")

        // clamp rank
        const MAXRANK = "3d"
        if (convertKyuDanToLevel(getRank()) > convertKyuDanToLevel(MAXRANK)) {
            rank = MAXRANK
        }

        move_count = 0

        // Hide selectors and show WGo.js board
        selectors.classList.add('hidden');
        wgoBoardDiv.classList.remove('hidden');
        // Initialize WGo.js Board
        boardContainer.innerHTML = "";
        board = new WGo.Board(boardContainer, {
            size: boardsize, // Board size (e.g., 19 for standard)
            width: Math.min(window.innerWidth * 0.8, 600), // Responsive width
            height: Math.min(window.innerHeight * 0.8, 600), // Responsive height
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

            if (move_count > boardsize * boardsize / 3) {
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
                if (ai_move == 'pass') {
                    showToast("AI passed!")
                    move_count++; // Switch turns
                    game.pass()
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


    // Update lessons visibility based on rank
    function updateLessonsVisibility() {
        const currentRank = getRank();
        const currentLevel = convertKyuDanToLevel(currentRank);

        console.log("Current Rank:", currentRank, "Current Level:", currentLevel);

        document.querySelectorAll('.lesson-item').forEach(lesson => {
            const lessonRank = lesson.getAttribute('data-rank');
            const lessonLevel = convertKyuDanToLevel(lessonRank);

            console.log(`Lesson Rank: ${lessonRank}, Level: ${lessonLevel}`);

            // Show the lesson if current rank level is greater than or equal to the lesson's required level
            if (currentLevel >= lessonLevel) {
                console.log(`Unlocking lesson: ${lessonRank}`);
                lesson.classList.remove('hidden');
            } else {
                console.log(`Locking lesson: ${lessonRank}`);
                lesson.classList.add('hidden');
            }
        });
    }

    // Add click event listeners to lesson titles for toggling content
    document.querySelectorAll('.lesson-title').forEach(title => {
        title.addEventListener('click', () => {
            // Hide all other lesson contents
            document.querySelectorAll('.lesson-content').forEach(content => {
                if (content !== title.nextElementSibling) {
                    content.classList.add('hidden');
                }
            });

            // Toggle the visibility of the current content
            const content = title.nextElementSibling;
            content.classList.toggle('hidden');
        });
    });


    // Call the function to update lessons visibility
    updateLessonsVisibility();
    // end init learn tab



    let testDiv = document.getElementById("boardContainer");
    testDiv.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center",
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

    if (color == WGo.W) {
        // Add a new marker at the given coordinates
        board.addObject({
            x: x,
            y: y,
            type: "CR", // Circle marker
            c: "rgba(0, 0, 0, 0.6)", // Optional: Customize the marker color (semi-transparent blue)
        });
    }
    if (color == WGo.B) {
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
