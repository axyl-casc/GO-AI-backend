function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

document.addEventListener('DOMContentLoaded', async () => {
    // Clear the tsumego wrapper content
    document.getElementById("tsumego_wrapper").innerHTML = "";

    // Get rank and type
    let rank = getRank();
    let type = "any";

    try {
        // Fetch tsumego data from the server
        const response = await fetch(`http://10.0.0.228:3001/get-tsumego?difficulty=${rank}&type=${type}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Assuming the server sends a JSON object

        // Initialize the Tsumego with the response data
        var tsumego = new WGo.Tsumego(document.getElementById("tsumego_wrapper"), {
            sgf: data.puzzle,
            debug: false, // Set to false to hide solution
            answerDelay: 500,
            displayHintButton: false
        });

        // Enable coordinates display
        tsumego.setCoordinates(true);

    } catch (error) {
        console.error("Failed to fetch tsumego data:", error);
        document.getElementById("tsumego_wrapper").innerText = "Failed to load tsumego data.";
    }
});
