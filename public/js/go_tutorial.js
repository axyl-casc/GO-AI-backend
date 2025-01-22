function startInteractiveTutorial(topic, boardsize) {
    // Clear the board container
    const learnboard = document.getElementById("learnboard");
    learnboard.innerHTML = "";

    // Create the board
    const board = new WGo.Board(learnboard, {
        width: 400,
        size: boardsize,
    });

    // Initialize the game state
    const gameState = new WGo.Position(boardsize); // Dynamic size based on the boardsize argument
    let turn = WGo.B; // Black starts

    // Add click event listener for interactive stone placement
    board.addEventListener("click", function (x, y) {
        if (gameState.get(x, y) === 0) { // Check if the position is empty
            board.addObject({ x, y, c: turn }); // Place the stone
            gameState.set(x, y, turn); // Update game state
            turn = turn === WGo.B ? WGo.W : WGo.B; // Toggle the turn
        } else {
            alert("This position is already occupied!");
        }
    });

    const lessoninfo = document.getElementById("learninfo");
    lessoninfo.innerHTML = "";

    // Handle tutorial topics
    switch (topic) {
        case "intro":
            lessoninfo.innerHTML = "Black stones go first. Try placing a stone!";
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
                if (liberty.x >= 0 && liberty.x < boardsize && liberty.y >= 0 && liberty.y < boardsize) {
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

        case "9x9demo":
            // Replace the interactive board with the SGF player
            learnboard.innerHTML = ""; // Clear the existing board for the player

            // Initialize WGo.BasicPlayer for the 9x9 SGF demo
            var player = new WGo.BasicPlayer(learnboard, {
                sgfFile: "./SGF/demo_9x9.sgf", // Path to your SGF file
                board: {
                    width: 600, // Adjust board size (optional)
                    starPoints: { 9: [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]] } // Star points for 9x9
                },
                layout: {
                    bottom: ["Control", "CommentBox"] // Customizable layout
                },
                enableScroll: true, // Enable mouse wheel scroll
                enableKeys: true,  // Enable keyboard arrow interaction
            });

            createButtonContainer("learninfo");
            lessoninfo.innerHTML += "<br>Explore the loaded 9x9 SGF demo.<br>(Scroll to view next move, or right/left arrow key)";
            break;

        default:
            lessoninfo.innerHTML = "Topic not found!";
    }
}


function createButtonContainer(containerID) {
    const container = document.getElementById(containerID);
  
    // Previous Button
    const prevButton = document.createElement("button");
    prevButton.className = "px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300";
    prevButton.textContent = "← Previous";
    prevButton.onclick = () => {
      handlePrevious(); // Directly trigger the action for the left arrow key
    };
  
    // Next Button
    const nextButton = document.createElement("button");
    nextButton.className = "px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300";
    nextButton.textContent = "Next →";
    nextButton.onclick = () => {
      handleNext(); // Directly trigger the action for the right arrow key
    };
  
    // Append buttons to the container
    container.appendChild(prevButton);
    container.appendChild(nextButton);
  }
  
  // Define the actions for Previous and Next
  function handlePrevious() {
    console.log("Previous action triggered (ArrowLeft)");
    // Add your desired functionality here
  }
  
  function handleNext() {
    console.log("Next action triggered (ArrowRight)");
    // Add your desired functionality here
  }
