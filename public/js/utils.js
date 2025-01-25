function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled; // The maximum is inclusive and the minimum is inclusive
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
    }, 2000);
}

function showToastAux(text) {
    const toastAux = document.querySelector('#toast-aux');
    const toastContainerAux = document.querySelector('#toast-container-aux');

    if (!toastAux || !toastContainerAux) {
        console.log("utils.js : Toast elements not found in the DOM - AUX");
        return;
    }

    toastAux.textContent = text;

    // Show the toast
    toastContainerAux.classList.remove('hidden');
    toastAux.classList.remove('opacity-0');
    toastAux.classList.add('opacity-100');

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toastAux.classList.remove('opacity-100');
        toastAux.classList.add('opacity-0');
        setTimeout(() => {
            toastContainerAux.classList.add('hidden');
        }, 500);
    }, 1500);
}

function resetStats() {
    if (confirm("Are you sure you want to reset all statistics? This action cannot be undone.")) {
        localStorage.removeItem("playerWins");
        localStorage.removeItem("puzzlesDone");
        localStorage.removeItem("puzzlesCorrect");
        localStorage.removeItem("gamesPlayed");
        localStorage.removeItem("hasLost");
        localStorage.removeItem("local_rank");
        localStorage.removeItem("experience");
        localStorage.removeItem("level");
        localStorage.removeItem("currency");
        clearInventory();
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
function getLevel() {
    if (localStorage.getItem("level") === null) {
        localStorage.setItem("level", JSON.stringify(1));
        return 0;
    }

    const level = JSON.parse(localStorage.getItem("level"));

    return level;
}

// For incrementing the number of games played
function incrementLevel() {
    // Get the current number of games played
    const currentLevel = getLevel();

    // Increment the value
    const newLevel = currentLevel + 1;

    // Store the updated value back in local storage
    localStorage.setItem("level", JSON.stringify(newLevel));

    adjustCurrency(newLevel * 2)

    return newLevel;
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
function getExperience() {
    if (localStorage.getItem("experience") === null) {
        localStorage.setItem("experience", JSON.stringify(0));
        return 0;
    }
    return JSON.parse(localStorage.getItem("experience"));
}

function incrementExperience(delta) {
    const currentExperience = getExperience();
    const newExperience = currentExperience + delta;
    localStorage.setItem("experience", JSON.stringify(newExperience));
    // check if level up using x^2 + 5 formula
    if (newExperience > getLevel() * getLevel() + 5) {
        localStorage.setItem("experience", newExperience - (getLevel() * getLevel() + 5)); // reset experience
        incrementLevel();
        showToastAux(`Leveled up from ${getLevel() - 1} to ${getLevel()}!`)
    } else {
        showToastAux(`You gained ${delta} experience!`)
    }
    return newExperience;
}


function getCurrency() {
    if (localStorage.getItem("currency") === null) {
        localStorage.setItem("currency", JSON.stringify(0));
        return 0;
    }
    return JSON.parse(localStorage.getItem("currency"));
}

function adjustCurrency(delta) {
    const currentCurrency = getCurrency();
    const newCurrency = currentCurrency + delta;
    localStorage.setItem("currency", JSON.stringify(newCurrency));

    return newCurrency;
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

function getInventory() {
    // Initialize inventory if it doesn't exist
    if (localStorage.getItem("inventory") === null) {
        const initialInventory = {};
        localStorage.setItem("inventory", JSON.stringify(initialInventory));
        return initialInventory;
    }
    return JSON.parse(localStorage.getItem("inventory"));
}

function addToInventory(itemKey, quantity = 1) {
    // Get the current inventory
    const inventory = getInventory();

    // Update the specific item in the inventory
    if (inventory[itemKey] === undefined) {
        inventory[itemKey] = quantity; // Initialize if not present
    } else {
        inventory[itemKey] += quantity; // Increment existing item
    }

    // Save back to local storage
    localStorage.setItem("inventory", JSON.stringify(inventory));
    return inventory[itemKey];
}

function removeFromInventory(itemKey, quantity = 1) {
    const inventory = getInventory();

    // Check if the item exists and has enough quantity to remove
    if (inventory[itemKey] !== undefined) {
        inventory[itemKey] = Math.max(0, inventory[itemKey] - quantity); // Prevent negative values
        if (inventory[itemKey] === 0) {
            delete inventory[itemKey]; // Optional: Remove item when quantity reaches 0
        }
    }

    // Save back to local storage
    localStorage.setItem("inventory", JSON.stringify(inventory));
    return inventory[itemKey] || 0;
}

function clearInventory() {
    const initialInventory = {};
    localStorage.setItem("inventory", JSON.stringify(initialInventory));
    return initialInventory;
}

function properCase(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}