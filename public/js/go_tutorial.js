function startInteractiveTutorial(topic, boardsize) {
    // Create a 5x5 board with interactive stone placement
    document.getElementById("learnboard").innerHTML = ""
    const board = new WGo.Board(document.getElementById("learnboard"), { 
        width: 400, 
        size: boardsize 
    });

    // Initialize the game state
    const gameState = new WGo.Position(5); // 5x5 board
    let turn = WGo.B; // Black starts

    // Add click event listener for interactive stone placement
    board.addEventListener("click", function(x, y) {
        if (gameState.get(x, y) === 0) { // Check if the position is empty
            // Place the stone on the board
            board.addObject({ x, y, c: turn });

            // Update the game state
            gameState.set(x, y, turn);

            // Toggle the turn
            turn = turn === WGo.B ? WGo.W : WGo.B;
        } else {
            alert("This position is already occupied!");
        }
    });
    const lessoninfo = document.getElementById("learninfo");

    // Handle tutorial cases
    switch (topic) {
        case "intro":
            lessoninfo.innerHTML = "Black stones go first. Try placing a stone!"
            break;

            case "liberties":
                const stoneX = 1, stoneY = 1; // Coordinates of the black stone
                board.addObject({ x: stoneX, y: stoneY, c: WGo.B }); // Add black stone
            
                // Define adjacent coordinates and corresponding labels
                const liberties = [
                    { x: stoneX, y: stoneY + 1, text: "1" }, // Above
                    { x: stoneX, y: stoneY - 1, text: "2" }, // Below
                    { x: stoneX - 1, y: stoneY, text: "3" }, // Left
                    { x: stoneX + 1, y: stoneY, text: "4" }  // Right
                ];
            
                liberties.forEach(liberty => {
                    // Only add label if it's within the board
                    if (liberty.x >= 0 && liberty.x < board.size && liberty.y >= 0 && liberty.y < board.size) {
                        board.addObject({
                            x: liberty.x,
                            y: liberty.y,
                            type: "LB", // Label marker
                            text: liberty.text // The number or label
                        });
                    }
                });
            
                lessoninfo.innerHTML = "Count liberties of the black stone.";
                break;
            

            

        // Add cases for other lessons
    }
}
