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
