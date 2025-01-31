function reviewGame(sgf) {
    const dialog = document.getElementById('reviewDialog');
    dialog.showModal(); // Open the dialog first

    setTimeout(() => {  // Wait for the dialog to be visible before initializing the player
        document.getElementById('reviewPlayer').innerHTML = ""; // Clear previous instance

        new WGo.BasicPlayer(document.getElementById("reviewPlayer"), {
            sgfFile: sgf
        });
    }, 50); // Delay initialization slightly to ensure the dialog is rendered
}

function closeReview() {
    document.getElementById('reviewDialog').close(); // Close the dialog
    document.getElementById('reviewPlayer').innerHTML = ""; // Reset SGF player
}