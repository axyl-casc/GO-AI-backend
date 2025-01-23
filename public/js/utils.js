function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}




function showToast(text) {
    const toast = document.querySelector('#toast');
    const toastContainer = document.querySelector('#toast-container');

    if (!toast || !toastContainer) {
        console.log("utils.js : Toast elements not found in the DOM");
        return;
    }

    toast.textContent = text;

    // Show the toast
    toastContainer.classList.remove('hidden');
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
        setTimeout(() => {
            toastContainer.classList.add('hidden');
        }, 500);
    }, 3000);
}


function resetStats() {
    if (confirm("Are you sure you want to reset all statistics? This action cannot be undone.")) {
        localStorage.removeItem("playerWins");
        localStorage.removeItem("puzzlesDone");
        localStorage.removeItem("puzzlesCorrect");
        localStorage.removeItem("gamesPlayed");
        localStorage.removeItem("hasLost");
        localStorage.removeItem("local_rank");
        alert("Statistics have been reset.");
        location.reload(); // Reloads the current page

    } else {
        alert("Reset action canceled.");
    }
}


// for checking if the user has lost a game yet
function getHasLost() {
    // Check if "hasLost" exists in local storage
    if (localStorage.getItem("hasLost") === null) {
        // If it doesn't exist, create it and set it to false
        localStorage.setItem("hasLost", JSON.stringify(false));
        return false;
    }

    // Retrieve the value of "hasLost" and parse it
    const hasLost = JSON.parse(localStorage.getItem("hasLost"));
    
    // Return the boolean value
    return hasLost;
}
function setHasLost(value) {
    if (typeof value !== "boolean") {
        throw new Error("Value must be a boolean.");
    }
    localStorage.setItem("hasLost", JSON.stringify(value));
}

// For retrieving the number of games played
function getGamesPlayed() {
    // Check if "gamesPlayed" exists in local storage
    if (localStorage.getItem("gamesPlayed") === null) {
        // If it doesn't exist, initialize it to 0
        localStorage.setItem("gamesPlayed", JSON.stringify(0));
        return 0;
    }

    // Retrieve and parse the value of "gamesPlayed"
    const gamesPlayed = JSON.parse(localStorage.getItem("gamesPlayed"));
    
    // Return the number of games played
    return gamesPlayed;
}

// For incrementing the number of games played
function incrementGamesPlayed() {
    // Get the current number of games played
    const currentGamesPlayed = getGamesPlayed();

    // Increment the value
    const newGamesPlayed = currentGamesPlayed + 1;

    // Store the updated value back in local storage
    localStorage.setItem("gamesPlayed", JSON.stringify(newGamesPlayed));

    return newGamesPlayed;
}


// For checking the player's win status
function getPlayerWins() {
    if (localStorage.getItem("playerWins") === null) {
        localStorage.setItem("playerWins", JSON.stringify(0));
        return 0;
    }
    return JSON.parse(localStorage.getItem("playerWins"));
}

function incrementPlayerWins() {
    const currentWins = getPlayerWins();
    const newWins = currentWins + 1;
    localStorage.setItem("playerWins", JSON.stringify(newWins));
    return newWins;
}

// For managing puzzles done
function getPuzzlesDone() {
    if (localStorage.getItem("puzzlesDone") === null) {
        localStorage.setItem("puzzlesDone", JSON.stringify(0));
        return 0;
    }
    return JSON.parse(localStorage.getItem("puzzlesDone"));
}

function incrementPuzzlesDone() {
    const currentPuzzlesDone = getPuzzlesDone();
    const newPuzzlesDone = currentPuzzlesDone + 1;
    localStorage.setItem("puzzlesDone", JSON.stringify(newPuzzlesDone));
    return newPuzzlesDone;
}

// For managing correctly solved puzzles
function getPuzzlesCorrect() {
    if (localStorage.getItem("puzzlesCorrect") === null) {
        localStorage.setItem("puzzlesCorrect", JSON.stringify(0));
        return 0;
    }
    return JSON.parse(localStorage.getItem("puzzlesCorrect"));
}

function incrementPuzzlesCorrect() {
    const currentPuzzlesCorrect = getPuzzlesCorrect();
    const newPuzzlesCorrect = currentPuzzlesCorrect + 1;
    localStorage.setItem("puzzlesCorrect", JSON.stringify(newPuzzlesCorrect));
    return newPuzzlesCorrect;
}
