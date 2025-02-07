const companionToggleButton = document.getElementById('companionToggleButton');

function generateClientId(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clientId = '';
    for (let i = 0; i < length; i++) {
        clientId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return clientId;
}



function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled; // The maximum is inclusive and the minimum is inclusive
}


const toastHistory = []

function showToast(text) {
    const toast = document.querySelector('#toast');
    const toastContainer = document.querySelector('#toast-container');

    if (!toast || !toastContainer) {
        console.log("utils.js : Toast elements not found in the DOM");
        return;
    }

    toastHistory.push(text)
    toast.innerHTML = text;

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

    toastAux.innerHTML = text;
    toastHistory.push(text)
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

function isNewAccount(){
    if(getLevel() === 1 && getGamesPlayed() < 1){
        return true;
    }else{
        return false;
    }
}

function populateNotifications() {
    const listContainer = document.getElementById("scrollableList");
    listContainer.innerHTML = ""; // Clear the list

    // Reverse the order so the oldest item (index 0) appears at the bottom
    toastHistory.slice().reverse().forEach(text => {
        const div = document.createElement("div");
        div.className = "p-2 border-b last:border-none text-gray-700";
        div.textContent = text;
        listContainer.prepend(div); // Prepend to maintain correct order
    });

    // Scroll to the bottom so the oldest item is in view
    listContainer.scrollTop = listContainer.scrollHeight;
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
        updateBelt();
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
        return 1;
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

    if(newLevel % 5 === 0){
        const found_item = getItemDrop(getLevel())
        addToInventory(found_item);
        showToastAux(`Leveled up from ${getLevel() - 1} to ${getLevel()}!<br>You found a ${found_item}`)
    }else{
        showToastAux(`Leveled up from ${getLevel() - 1} to ${getLevel()}!`)
    }

    return newLevel;
}

function getItemDrop(rarity){
    const random_item = ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];

    if(random_item.dropchance < 2 * rarity){
        return getItemDrop(rarity) // item was not rare enough
    }

    if(2 * rarity >= random_item.dropchance || getRandomInt(rarity, random_item.dropchance - rarity) === Math.floor(random_item.dropchance/2)){
        // item dropped
        return random_item.title
    }else{
        // failed to colect the item and try with another
        return getItemDrop(rarity)
    }
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
function updateProgressBar(numerator, denominator) {
    let percentage = (numerator / denominator) * 100;
    percentage = Math.min(99, Math.max(0, percentage)); // Clamp between 0 and 100
    document.getElementById("progress-bar").style.width = percentage + "%";
}

function getExperienceRequired(){
    if(getLevel() >= 10){
        return 105 + 2 * getLevel()
    }
    // make the level increase fast until level 10, then slow down
    return 10 * getLevel() + 5
}

function incrementExperience(delta) {
    const currentExperience = getExperience();
    const newExperience = currentExperience + delta;
    localStorage.setItem("experience", JSON.stringify(newExperience));
    // check if level up using x^2 + 5 formula
    if (newExperience > getExperienceRequired()) {
        localStorage.setItem("experience", newExperience - getExperienceRequired()); // reset experience
        incrementLevel();
    } else {
        showToastAux(`You gained ${delta} experience!`)
    }
    updateProgressBar(getExperience(), 10 * getLevel() + 5);
    return newExperience;
}


function getCurrency() {
    if (localStorage.getItem("currency") === null) {
        localStorage.setItem("currency", JSON.stringify(0));
        return 0;
    }
    return parseFloat(JSON.parse(localStorage.getItem("currency"))).toFixed(2);
}


function adjustCurrency(delta) {
    const currentCurrency = getCurrency();
    const newCurrency = parseFloat(currentCurrency) + parseFloat(delta);
    localStorage.setItem("currency", JSON.stringify(parseFloat(newCurrency).toFixed(2)));

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

// inventory functions
function getInventory() {
    // Initialize inventory if it doesn't exist
    if (localStorage.getItem("inventory") === null) {
        const initialInventory = [];
        localStorage.setItem("inventory", JSON.stringify(initialInventory));
        return initialInventory;
    }
    return JSON.parse(localStorage.getItem("inventory"));
}

function addToInventory(itemKey, quantity = 1) {
    // Get the current inventory
    const inventory = getInventory();

    // Find the item in ALL_ITEMS
    const shopItem = ALL_ITEMS.find(item => item.title === itemKey);
    if (!shopItem) {
        console.error(`Item "${itemKey}" not found in ALL_ITEMS.`);
        return;
    }

    // Check if the item already exists in the inventory
    const existingItem = inventory.find(item => item.title === itemKey);
    if (existingItem) {
        existingItem.quantity += quantity; // Update quantity
    } else {
        // Add the item to the inventory with the specified quantity
        inventory.push({ ...shopItem, quantity });
    }

    // Save back to local storage
    localStorage.setItem("inventory", JSON.stringify(inventory));
    return inventory;
}

function removeFromInventory(itemKey, quantity = 1) {
    const inventory = getInventory();

    // Find the item in the inventory
    const existingItemIndex = inventory.findIndex(item => item.title === itemKey);
    if (existingItemIndex === -1) {
        console.error(`Item "${itemKey}" not found in inventory.`);
        return;
    }

    // Update or remove the item
    const existingItem = inventory[existingItemIndex];
    existingItem.quantity -= quantity;

    if (existingItem.quantity <= 0) {
        inventory.splice(existingItemIndex, 1); // Remove item if quantity reaches 0
    }

    // Save back to local storage
    localStorage.setItem("inventory", JSON.stringify(inventory));
    return inventory;
}

function clearInventory() {
    const initialInventory = [];
    localStorage.setItem("inventory", JSON.stringify(initialInventory));
    return initialInventory;
}

// Helper function to fetch an inventory item by title
function findInventoryItemByTitle(title) {
    const inventory = getInventory();
    return inventory.find(item => item.title === title);
}


function properCase(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCompanion() {
    // Get the user's inventory
    const inventory = getInventory();

    // Find the equipped companion in the inventory
    const equippedCompanion = inventory.find(item => 
        item.category.includes("companion") && item.equipped
    );

    // Return the equipped companion or null if none is equipped
    return equippedCompanion || null;
}
function getStones() {
    // Get the user's inventory
    const inventory = getInventory();

    const equippedStones = inventory.find(item => 
        item.category.includes("stones") && item.equipped
    );

    return equippedStones || null
}

function getBoardImg() {
    // Get the user's inventory
    const inventory = getInventory();

    const equippedBoard = inventory.find(item => 
        item.category.includes("boards") && item.equipped
    );
    return equippedBoard || {image:"textures/wood2.jpg"}
}

const coordinates = {
    grid: {
        draw: function(args, board) {
            let ch, t, xright, xleft, ytop, ybottom;
            
            this.fillStyle = "rgba(0,0,0,0.7)";
            this.textBaseline = "middle";
            this.textAlign = "center";
            this.font = board.stoneRadius + "px " + (board.font || "");

            xright = board.getX(-0.75);
            xleft = board.getX(board.size - 0.25);
            ytop = board.getY(-0.75);
            ybottom = board.getY(board.size - 0.25);

            for (let i = 0; i < board.size; i++) {
                ch = i + "A".charCodeAt(0);
                if (ch >= "I".charCodeAt(0)) ch++; // Skip 'I' for traditional Go notation

                t = board.getY(i);
                this.fillText(board.size - i, xright, t);
                this.fillText(board.size - i, xleft, t);

                t = board.getX(i);
                this.fillText(String.fromCharCode(ch), t, ytop);
                this.fillText(String.fromCharCode(ch), t, ybottom);
            }

            this.fillStyle = "black";
        }
    }
};
