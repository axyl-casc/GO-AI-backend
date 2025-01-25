function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

let current_puzzle_id = -1
async function new_tsumego() {
    // Clear the tsumego wrapper content
    const wrapper = document.getElementById("tsumego_wrapper");
    wrapper.innerHTML = "";

    // Get rank and type
    let rank = getRank();
    let type = "any";

    try {
        // Fetch tsumego data from the server
        const response = await fetch(`${window.location.href}get-tsumego?difficulty=${rank}&type=${type}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Assuming the server sends a JSON object
        console.log("Received Puzzle:", data.puzzle);

        // Initialize the Tsumego with responsive board dimensions
        function setupTsumego() {
            return new WGo.Tsumego(wrapper, {
                sgf: data.puzzle,
                debug: false, // Set to false to hide solution
                answerDelay: 500,
                displayHintButton: false, // Disable hint button
                layout: {
                    bottom: ["CommentBox", "InfoBox"], // Exclude "Control" to remove buttons
                }
            });

        }


        // Create the initial tsumego
        let tsumego = setupTsumego();

        // Enable coordinates display
        tsumego.setCoordinates(true);

        // Adjust the board size on window resize
        window.addEventListener("resize", () => {
            wrapper.innerHTML = ""; // Clear the wrapper
            tsumego = setupTsumego(); // Recreate the tsumego with new dimensions
            tsumego.setCoordinates(true); // Enable coordinates again
        });
        document.querySelectorAll(".wgo-tsumego-control").forEach((element) => {
            element.style.display = "none"; // Properly hides the elements
        });
        return data.id; // Assuming `id` is part of the JSON response
    } catch (error) {
        console.error("Failed to fetch tsumego data:", error);
        wrapper.innerText = "Failed to load tsumego data.";
        return null; // Return null in case of an error
    }



}

document.addEventListener('DOMContentLoaded', async () => {
    current_puzzle_id = await new_tsumego();
    document.getElementById("nextTsumego").addEventListener("click", async () => {
        incrementPuzzlesDone();
        document.getElementById("dislikeTsumego").classList.remove("hidden");
        document.getElementById("likeTsumego").classList.remove("hidden");
        const tsumegoCommentElement = document.querySelector(".wgo-tsumego-comment");
        let correct = false;

        if (tsumegoCommentElement) {
            const text = tsumegoCommentElement.textContent.toLowerCase();
            correct = text.includes("correct") && !text.includes("incorrect");
        }

        if (correct) {
            incrementExperience(2);
            incrementPuzzlesCorrect();
        } else {
            incrementExperience(1)
        }

        console.log(`Correct flag is set to: ${correct}`);

        // Get user rank from local storage
        const localRank = localStorage.getItem('local_rank');

        // only adjust the tsumego ranks if you have lost at least once
        if (getHasLost() && getGamesPlayed() > 5) {
            // Send data to the local tsumego-complete endpoint
            fetch(`${window.location.href}tsumego-complete?is_correct=${correct}&puzzle_id=${current_puzzle_id}&user_rank=${localRank}`, {
                method: 'GET'
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Tsumego completion data sent successfully');
                    } else {
                        console.error('Error sending tsumego completion data');
                    }
                })
                .catch(error => console.error('Fetch error:', error));
        } else {
            console.log("You have not lost yet, so we will not adjust your rank");
        }

        current_puzzle_id = await new_tsumego();


        document.querySelectorAll(".wgo-tsumego-control").forEach((element) => {
            element.style.display = "none"; // Properly hides the elements
        });

    });
    document.getElementById("likeTsumego").addEventListener("click", async () => {
        showToast("Thanks for the feedback!");
        // Send data to the local tsumego-rate endpoint for a like
        fetch(`${window.location.href}tsumego-rate?puzzle_id=${current_puzzle_id}&delta=1`, {
            method: 'GET'
        })
            .then(response => {
                if (response.ok) {
                    console.log('Tsumego like data sent successfully');
                } else {
                    console.error('Error sending tsumego like data');
                }
            })
            .catch(error => console.error('Fetch error:', error));
        document.getElementById("dislikeTsumego").classList.add("hidden");
        document.getElementById("likeTsumego").classList.add("hidden");
    });

    document.getElementById("dislikeTsumego").addEventListener("click", async () => {
        showToast("Disliked Tsumego");
        // Send data to the local tsumego-rate endpoint for a dislike
        fetch(`${window.location.href}tsumego-rate?puzzle_id=${current_puzzle_id}&delta=-1`, {
            method: 'GET'
        })
            .then(response => {
                if (response.ok) {
                    console.log('Tsumego dislike data sent successfully');
                } else {
                    console.error('Error sending tsumego dislike data');
                }
            })
            .catch(error => console.error('Fetch error:', error));
        document.getElementById("dislikeTsumego").classList.add("hidden");
        document.getElementById("likeTsumego").classList.add("hidden");
    });

    document.querySelectorAll(".wgo-tsumego-control").forEach((element) => {
        element.style.display = "none"; // Properly hides the elements
    });
});
