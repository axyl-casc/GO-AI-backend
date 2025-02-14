const LOWEST_RANK = "45k";
const DEFAULT_RANK = "40k";

// Ranks conversion utility
const ALL_RANKS = (() => {
	const ranks = [];
	for (let i = 99; i >= 1; i--) {
		ranks.push(`${i}d`);
	}
	for (let i = 1; i <= 999; i++) {
		ranks.push(`${i}k`);
	}
	return ranks.reverse();
})();

function getDisplayRank() {
    const levelTitles = [ 
        "Novice Adventurer",
        "Aspiring Student",
        "Rising Strategist",
        "Tactical Adept",
        "Shape Master",
        "Fuseki Scholar",
        "Joseki Explorer",
        "Sabaki Artist",
        "Tenuki Wanderer",
        "Endgame Virtuoso",
        "Territory Architect",
        "Ko Trickster",
        "Judan Aspirant",
        "Kisei Visionary",
        "Tengen Mystic",
        "Tanuki Gambler",
        "Honinbo Contender",
        "Meijin Challenger",
        "Kitsune Deceiver",
        "Oni of Influence",
        "Tatsu of the Board",
        "Grandmaster of Go"
    ];
    
    const expandedRanks = [];
    
    for (const title of levelTitles) {
        expandedRanks.push(`${title} I`);
        expandedRanks.push(`${title} II`);
        expandedRanks.push(`${title} III`);
        expandedRanks.push(`${title} IV`);
        expandedRanks.push(`${title} V`);
        expandedRanks.push(`${title} VI`);
        expandedRanks.push(`${title} VII`);
        expandedRanks.push(`${title} VIII`);
        expandedRanks.push(`${title} IX`);
        expandedRanks.push(`${title} X`);
        expandedRanks.push(`The ${title}`);
    }
    
    console.log(`Named rank count: ${expandedRanks.length}`)
	if (convertKyuDanToLevel(getHighestRank()) >= convertKyuDanToLevel("25k")) {
		return `${expandedRanks[Math.min(Math.floor((getLevel() - 1)), expandedRanks.length - 1)]} (${getRank()})`;
	}

	return expandedRanks[
		Math.min(Math.floor((getLevel() - 1)), expandedRanks.length - 1)
	];
}

function convertKyuDanToLevel(rank) {
	rank = String(rank);
	const index = ALL_RANKS.indexOf(rank);
	return index !== -1 ? index : "?";
}

function convertLevelToKyuDan(level) {
	level = parseInt(level, 10);
	if (level >= 0 && level < ALL_RANKS.length) {
		return ALL_RANKS[level];
	}
	return ALL_RANKS[ALL_RANKS.length - 1];
}

// Local storage rank management
function getRank() {
	let localRank = localStorage.getItem("local_rank");
	if (!localRank) {
		localRank = DEFAULT_RANK;
		localStorage.setItem("local_rank", localRank);
	}

	return localRank;
}
// Local storage rank management
function getHighestRank() {
	let localRank = localStorage.getItem("highest_rank");
	if (!localRank) {
		localRank = getRank();
		localStorage.setItem("highest_rank", localRank);
	}

	return localRank;
}
function updateBelt() {
	const user_elo = convertKyuDanToLevel(getHighestRank());
	const starting_elo = convertKyuDanToLevel(DEFAULT_RANK);
	const danThreshold = convertKyuDanToLevel("1d");
	let delta = user_elo - starting_elo;
	function changeColor(c1, c2) {
		const colorMap = {
			white: "#f8f9fa",
			yellow: "#facc15",
			orange: "#fb923c",
			green: "#22c55e",
			blue: "#3b82f6",
			purple: "#a855f7",
			red: "#ef4444",
			brown: "#8b5a2b",
			black: "#000000",
		};

		const beltColor = colorMap[c1] || "#d1d5db";
		const stripeColor = colorMap[c2] || "#6b7280";

		document.getElementById("colorBar").style.backgroundColor = beltColor;
		document.getElementById("stripe").style.backgroundColor = stripeColor;

		console.log(`Belt: ${c1} (${beltColor})\nStripe: ${c2} (${stripeColor})`);
	}

	const colors = [
		"white",
		"yellow",
		"orange",
		"green",
		"blue",
		"purple",
		"red",
		"brown",
		"black",
	];
    // 160 fits so the user goes from 1k to 1d correctly. 
	const free_levels_until = 160;

    delta += Math.floor(Math.min(getLevel(), free_levels_until) / 5);


	let stripe_index = delta % colors.length;
	let belt_index = Math.floor(delta / colors.length);

	if (stripe_index === colors.length) {
		belt_index++;
		stripe_index = belt_index;
	}

	if (user_elo >= danThreshold) {
		delta = user_elo - danThreshold;

		stripe_index = delta % colors.length;
		belt_index = colors.indexOf("black");
	}
	if (user_elo <= starting_elo) {
		stripe_index = 0;
		belt_index = 0;
	}
	if (user_elo > convertKyuDanToLevel("9d")) {
		stripe_index = colors.length - 1;
		belt_index = colors.length - 1;
	}
	changeColor(colors[belt_index], colors[stripe_index]);
}

function setRank(newRank) {
    if (ALL_RANKS.includes(newRank)) {
        localStorage.setItem("local_rank", newRank);
    } else {
        console.error(`Invalid rank: ${newRank}`);
        return;
    }

    console.log(`New rank -> ${getRank()}`);

    if (convertKyuDanToLevel(newRank) > convertKyuDanToLevel(getHighestRank())) {
        setHighestRank(newRank);
        createParticles(25); // Celebrate milestone
    }
	setRankHistory(newRank);
}

/**
 * Stores the user's rank history in localStorage with a daily entry.
 * If an entry exists for today, it overwrites the previous value.
 */
function setRankHistory(rank) {
	const today = getCurrentDate()
    localStorage.setItem(`rankhistory_${today}`, rank);
}
function getCurrentDate(){
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
	return today
}

/**
 * Retrieves the rank history for a given date.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {string|null} - The rank on that date, or null if not found.
 */
function getRankHistory(date) {
    return localStorage.getItem(`rankhistory_${date}`);
}

function setHighestRank(newRank) {
	if (ALL_RANKS.includes(newRank)) {
		localStorage.setItem("highest_rank", newRank);
	} else {
		console.error(`Invalid rank: ${newRank}`);
	}
	console.log(`New rank -> ${getRank()}`);

}

function adjustRank(amount) {
	const currentRank = getRank();
	const currentLevel = convertKyuDanToLevel(currentRank);

	if (currentLevel === "?") {
		console.error(`Invalid current rank: ${currentRank}`);
		return;
	}

	let newLevel = Math.max(
		0,
		Math.min(ALL_RANKS.length - 1, currentLevel + amount),
	);

	if (newLevel < convertKyuDanToLevel(LOWEST_RANK)) {
		newLevel = convertKyuDanToLevel(LOWEST_RANK); // lowest rank
	}

	const newRank = convertLevelToKyuDan(newLevel);

	setRank(newRank);

	updateBelt()
	return newRank;
}
