function reviewGame(sgf) {
	const dialog = document.getElementById("reviewDialog");
	dialog.showModal(); // Open the dialog first
	let player = null;

	setTimeout(() => {
		// Wait for the dialog to be visible before initializing the player
		document.getElementById("reviewPlayer").innerHTML = ""; // Clear previous instance

		player = new WGo.BasicPlayer(document.getElementById("reviewPlayer"), {
			sgfFile: sgf,
			board: {
				section: {
					top: 0,
					left: 0,
					right: 0,
					bottom: -2,
				},
			},
		});
	}, 50); // Delay initialization slightly to ensure the dialog is rendered
}

function closeReview() {
	document.getElementById("reviewDialog").close(); // Close the dialog
	document.getElementById("reviewPlayer").innerHTML = ""; // Reset SGF player
}
