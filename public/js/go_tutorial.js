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
            board.addObject({ x: 2, y: 2, c: WGo.B }); // Adjust coordinates for 5x5
            board.addObject({ x: 3, y: 2, c: WGo.W });
            lessoninfo.innerHTML = "Black stones go first. Try placing a stone!"
            break;

        case "liberties":
            board.addObject({ x: 1, y: 1, c: WGo.B }); // Adjust coordinates for 5x5
            board.addObject({ x: 1, y: 2, c: WGo.W });
            lessoninfo.innerHTML = "Count liberties of the black stone."
            break;

        // Add cases for other lessons
    }
}
