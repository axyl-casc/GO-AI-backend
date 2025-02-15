//// WIP DOES NOT WORK
function populateLessons(lessonsData) {
	// Sort lessons by level first, then by rank
	lessonsData.sort((a, b) => a.level - b.level || a.rank - b.rank);

	// Generate and populate the lessons
	const lessonsContainer = document.getElementById("lessons");
	lessonsContainer.innerHTML = ""; // Clear existing content

	lessonsData.forEach((lesson, index) => {
		const lessonHTML = `
            <div class="lesson-item border rounded-lg bg-white shadow" data-rank="${lesson.rank}" data-level="${lesson.level}">
                <div class="lesson-title px-4 py-2 cursor-pointer bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800">
                    Lesson ${index + 1}: ${lesson.title}
                </div>
                <div class="lesson-content hidden px-4 py-2 text-gray-700">
                    ${lesson.content}
                </div>
            </div>
        `;
		lessonsContainer.innerHTML += lessonHTML;
	});
}

// Example usage
const lessonsData = [
	{
		rank: 50,
		level: 0,
		title: "About this Website",
		content: "Welcome to our Go learning platform! This website...",
	},
	{
		rank: 36,
		level: 0,
		title: "Understanding Liberties",
		content:
			"Understand the concept of liberties, a critical aspect of Go strategy.",
	},
	{
		rank: 34,
		level: 0,
		title: "Capture a Stone",
		content:
			"Here we will learn how to capture an opponent's stone and understand the concept of atari.",
	},
	{
		rank: 32,
		level: 5,
		title: "A 9x9 Game",
		content:
			"Review a 9x9 game and discuss the strategies and tactics used by both players.",
	},
	{
		rank: 30,
		level: 5,
		title: "Shape - Good or bad?",
		content:
			"Go over the basics of shape and how it can be used to your advantage.",
	},
];

document.addEventListener("DOMContentLoaded", () => {
	//populateLessons(lessonsData);
});

function startInteractiveTutorial(topic, boardsize) {
	// Clear the board container
	const learnboard = document.getElementById("learnboard");
	learnboard.innerHTML = "";

	boardsize = parseInt(boardsize); // Ensure the board size is an integer

	// Initialize the game logic
	const game = new WGo.Game(boardsize);

	// Create the board and link it to the game
	const board = new WGo.Board(learnboard, {
		width: 600,
		size: boardsize,
		section: {
			top: -0.5,
			left: -0.5,
			right: -0.5,
			bottom: -0.5,
		},
	});
	console.log(`Boardsize: ${boardsize}`); // Expected: 5
	console.log(`Boardsize: ${game.size}`); // Expected: 5

	board.addCustomObject(coordinates);

	console.log(game.isOnBoard(2, 2)); // Expected: true for a 5x5 board

	// Handle clicks on the board
	board.addEventListener("click", (x, y) => {
		console.log(`Clicked coordinates: x=${x}, y=${y}`); // Debugging to verify coordinates

		const old_turn = game.turn;
		const result = game.play(x, y, game.turn); // Validates and checks captures
		if (result === 1 || result === 2 || result === 3 || result === 4) {
			console.log("Invalid move:", result); // 1 = Out of bounds, 2 = Occupied, 3 = Suicide
			return;
		}
		board.addObject({ x: x, y: y, c: old_turn });
		result.forEach((captured) => board.removeObjectsAt(captured.x, captured.y));
	});

	// Render the initial state of the board
	board.update(game.getPosition());

	const lessoninfo = document.getElementById("learninfo");
	lessoninfo.innerHTML = "";
	const stoneX = 1,
		stoneY = 1; // Coordinates of the black stone
	const liberties = [];

	// Handle tutorial topics
	switch (topic) {
		case "intro":
			lessoninfo.innerHTML = `
            <p class="mb-4"><strong>Black stones go first. Try placing a stone!</strong></p>
            <p class="mb-4">
                Go is one of the oldest strategy games in the world, with a history spanning over 4,000 years. Originating in ancient China, Go (or "Weiqi" in Chinese, "Baduk" in Korean, and "Igo" in Japanese) was played by scholars and generals alike as a means of developing strategic thinking. It is deeply embedded in East Asian culture and philosophy, often regarded as a metaphor for life, where every move reflects long-term planning and adaptability.
            </p>
        
            <p class="mb-4">
                The game spread to Japan in the 7th century, where it was refined and gained widespread popularity among samurai and nobles. By the 20th century, Go reached the Western world, where it continues to grow as a beloved and challenging intellectual pursuit.
            </p>
        
            <p class="mb-4"><strong>How to Play Go</strong></p>
            <p class="mb-4">
                The game of Go is played between two players on a grid board, traditionally 19x19, though beginners often start on smaller boards like 9x9 or 13x13 to learn the fundamentals. One player uses black stones, and the other uses white stones.
            </p>
            
            <p class="mb-4"><strong>Basic Rules:</strong></p>
            <ul class="mb-4">
                <li><strong>Turns:</strong> Black moves first, followed by White. Players take turns placing one stone on the board at a time.</li>
                <li><strong>Objective:</strong> The goal is to claim the most territory by surrounding empty areas with your stones.</li>
                <li><strong>Capturing Stones:</strong> Stones are captured if all their liberties (adjacent empty points) are surrounded by the opponent's stones.</li>
                <li><strong>Ko Rule:</strong> A player cannot make a move that recreates a previous board state, ensuring the game progresses.</li>
                <li><strong>Ending the Game:</strong> The game ends when both players pass their turn consecutively. The winner is determined by counting the surrounded territory and captured stones.</li>
            </ul>
        
            <p class="mb-4"><strong>Why Play Go?</strong></p>
            <p class="mb-4">
                Go is more than just a game—it’s a lifelong journey of learning and self-improvement. Its simplicity in rules hides its incredible depth, offering limitless possibilities and strategies. Go sharpens your ability to think ahead, adapt to new challenges, and appreciate the beauty of balance and harmony.
            </p>
            
            <p class="mb-4">
                Whether you are a beginner exploring its mysteries or a seasoned player striving for mastery, Go offers an enriching experience that connects you to a timeless tradition of strategic thought.
            </p>
            
            <p>
                Dive into the world of Go, and discover a game that has captivated minds for millennia. Start by placing your first stone!
            </p>
        `;
			break;

		case "liberties": {
			board.addObject({ x: stoneX, y: stoneY, c: WGo.B }); // Add black stone
			game.play(stoneX, stoneY, WGo.B); // Play the black stone

			// Define adjacent coordinates and corresponding labels
			const liberties = [
				{ x: stoneX, y: stoneY + 1, text: "1" }, // Above
				{ x: stoneX, y: stoneY - 1, text: "2" }, // Below
				{ x: stoneX - 1, y: stoneY, text: "3" }, // Left
				{ x: stoneX + 1, y: stoneY, text: "4" }, // Right
			];

			liberties.forEach((liberty) => {
				if (
					liberty.x >= 0 &&
					liberty.x < boardsize &&
					liberty.y >= 0 &&
					liberty.y < boardsize
				) {
					board.addObject({
						x: liberty.x,
						y: liberty.y,
						type: "LB", // Label marker
						text: liberty.text, // The number or label
					});
				}
			});

			lessoninfo.innerHTML = "Count liberties of the black stone.";
			break;
		}
		case "capture": {
			const centerX = Math.floor(boardsize / 2); // Center X coordinate
			const centerY = Math.floor(boardsize / 2); // Center Y coordinate

			// Add a white stone in the middle
			board.addObject({ x: centerX, y: centerY, c: WGo.W }); // White stone
			game.play(centerX, centerY, WGo.W); // Play the white stone

			// Define the surrounding positions
			const surroundingStones = [
				{ x: centerX - 1, y: centerY }, // Left
				{ x: centerX + 1, y: centerY }, // Right
				{ x: centerX, y: centerY - 1 }, // Above
			];

			// Place black stones around the white stone
			surroundingStones.forEach((stone) => {
				if (
					stone.x >= 0 &&
					stone.x < boardsize &&
					stone.y >= 0 &&
					stone.y < boardsize
				) {
					board.addObject({
						x: stone.x,
						y: stone.y,
						c: WGo.B, // Black stone
					});
					game.play(stone.x, stone.y, WGo.B); // Play the black stone
				}
			});

			// Add some instructional text
			lessoninfo.innerHTML = `
                <p><strong>Capture the white stone!</strong></p>
                <p>Place another black stone to capture the white stone by surrounding it completely.</p>
            `;
			break;
		}

		case "9x9demo": {
			// Replace the interactive board with the SGF player
			learnboard.innerHTML = ""; // Clear the existing board for the player

			// Initialize WGo.BasicPlayer for the 9x9 SGF demo
			const player = new WGo.BasicPlayer(learnboard, {
				sgfFile: "./SGF/demo_9x9.sgf", // Path to your SGF file
				board: {
					width: 600, // Adjust board size (optional)
					starPoints: {
						9: [
							[2, 2],
							[6, 2],
							[4, 4],
							[2, 6],
							[6, 6],
						],
					}, // Star points for 9x9
					section: {
						top: -0.5,
						left: -0.5,
						right: -0.5,
						bottom: -0.5,
					},
				},
				layout: {
					bottom: ["Control", "CommentBox"], // Customizable layout
				},
				enableWheel: false, // Proper setting to disable mouse wheel scrolling for move navigation
				enableKeys: true, // Disable keyboard arrow interaction for navigating moves
			});

			player.board.addCustomObject(coordinates);
			createButtonContainer(".wgo-player-control", player);
			lessoninfo.innerHTML =
				"<br>Explore the loaded 9x9 SGF demo.<br>(right/left arrow key)";
			break;
		}
		case "shapedemo": {
			// Replace the interactive board with the SGF player
			learnboard.innerHTML = ""; // Clear the existing board for the player

			const player = new WGo.BasicPlayer(learnboard, {
				sgfFile: "./SGF/shapes.sgf", // Path to your SGF file
				board: {
					width: 600, // Adjust board size (optional)
					starPoints: {
						9: [
							[2, 2],
							[6, 2],
							[4, 4],
							[2, 6],
							[6, 6],
						],
					}, // Star points for 9x9
					section: {
						top: -0.5,
						left: -0.5,
						right: -0.5,
						bottom: -0.5,
					},
				},
				layout: {
					bottom: ["Control", "CommentBox"],
				},
				enableWheel: false, // Proper setting to disable mouse wheel scrolling for move navigation
				enableKeys: true, // Disable keyboard arrow interaction for navigating moves
			});

			player.board.addCustomObject(coordinates);
			createButtonContainer(".wgo-player-control", player);
			lessoninfo.innerHTML =
				"<br>Explore the loaded 9x9 SGF demo.<br>(right/left arrow key)";

			break;
		}
		case "empty_triangle":
			board.addObject({ x: 1, y: 1, c: WGo.B });
			board.addObject({ x: 1, y: 2, c: WGo.B });
			board.addObject({ x: 2, y: 1, c: WGo.B });
			board.addObject({ x: 2, y: 2, type: "MA" });
			lessoninfo.innerHTML = `
            <p class="mb-4"><strong>The Concept of Shapes in Go</strong></p>
            <p class="mb-4">
                In Go, <strong>shape</strong> refers to the arrangement of stones on the board and how efficiently they work together to secure territory, maintain flexibility, and stay connected. Good shapes are efficient, providing strong connections, maximizing liberties, and leaving room for further development. Poor shapes are inefficient, making your stones vulnerable, over-concentrated, or less effective overall.
            </p>
            
            <p class="mb-4"><strong>What is an Empty Triangle?</strong></p>
            <p class="mb-4">
                An <strong>empty triangle</strong> occurs when three stones of the same color form a triangular shape with an empty space in the middle. This is a classic example of an inefficient shape in Go. Here’s why:
            </p>
            <ul class="mb-4">
                <li><strong>Loss of Efficiency:</strong> The three stones in an empty triangle could achieve better connectivity and influence with different placements. By forming this shape, you waste a move that could be used elsewhere on the board.</li>
                <li><strong>Reduced Liberties:</strong> The empty triangle has fewer liberties (available breathing spaces) compared to other arrangements with three stones. This makes the group weaker and more vulnerable to attack.</li>
                <li><strong>Over-concentration:</strong> The stones in an empty triangle are clustered too tightly, which means they control less territory and leave fewer options for growth or flexibility.</li>
            </ul>
            
            <p class="mb-4"><strong>Good Shapes vs. Bad Shapes</strong></p>
            <p class="mb-4">
                Go players often compare shapes like the empty triangle to more effective patterns, such as a <em>bamboo joint</em> or a <em>diagonal connection</em>. These better shapes provide similar connectivity but with greater efficiency, more liberties, and better influence over the board.
            </p>
            
            <p>
                While sometimes an empty triangle might be unavoidable in specific tactical situations, it is generally a shape to be avoided in most positions. Recognizing and avoiding bad shapes like this is an important step in improving your play and developing a sense for good shape in Go.
            </p>
                            <br><button
                                class="btn mt-2 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow"
                                onclick="startInteractiveTutorial('shapedemo', 9)">Learn more shapes</button>
        `;

			break;
		default:
			lessoninfo.innerHTML = "Topic not found!";
	}
	game.turn = WGo.B; // Set the initial turn to black
}

function createButtonContainer(containerID, player) {
	const container = document.querySelector(containerID);

	// Previous Button
	const prevButton = document.createElement("button");
	prevButton.className =
		"px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 m-2";
	prevButton.textContent = "← Previous";
	prevButton.onclick = () => {
		player.previous();
		console.log("Previous move shown");
	};

	// Next Button
	const nextButton = document.createElement("button");
	nextButton.className =
		"px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 m-2";
	nextButton.textContent = "Next →";
	nextButton.onclick = () => {
		player.next();
		console.log("Next move shown");
	};

	// Append buttons to the container
	container.appendChild(prevButton);
	container.appendChild(nextButton);
}
