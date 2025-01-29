
const LOWEST_RANK = '45k';
const DEFAULT_RANK = '40k';

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
        "Novice Adventurer I",      // Level 1-4
        "Novice Adventurer II",     // Level 5-9
        "Novice Adventurer III",    // Level 10-14
    
        "Aspiring Student I",       // Level 15-19
        "Aspiring Student II",      // Level 20-24
        "Aspiring Student III",     // Level 25-29
    
        "Rising Strategist I",      // Level 30-34
        "Rising Strategist II",     // Level 35-39
        "Rising Strategist III",    // Level 40-44
    
        "Tactical Adept I",         // Level 45-49
        "Tactical Adept II",        // Level 50-54
        "Tactical Adept III",       // Level 55-59
    
        "Shape Master I",           // Level 60-64
        "Shape Master II",          // Level 65-69
        "Shape Master III",         // Level 70-74
    
        "Fuseki Scholar I",         // Level 75-79
        "Fuseki Scholar II",        // Level 80-84
        "Fuseki Scholar III",       // Level 85-89
    
        "Honinbo Contender I",      // Level 90-94
        "Honinbo Contender II",     // Level 95-99
        "Grandmaster of Go"         // Level 100 (final)
    ];
    

    if (convertKyuDanToLevel(getRank()) > convertKyuDanToLevel("15k")) {
        return `${levelTitles[Math.min(Math.floor((getLevel() - 1) / 5), levelTitles.length - 1)]} (${getRank()})`;
    }

    return levelTitles[Math.min(Math.floor((getLevel() - 1) / 5), levelTitles.length - 1)];
}



function convertKyuDanToLevel(rank) {
    rank = String(rank);
    const index = ALL_RANKS.indexOf(rank);
    return index !== -1 ? index : '?';
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
    let localRank = localStorage.getItem('local_rank');
    if (!localRank) {
        localRank = DEFAULT_RANK;
        localStorage.setItem('local_rank', localRank);
    }
    return localRank;
}

function setRank(newRank) {
    if (ALL_RANKS.includes(newRank)) {
        localStorage.setItem('local_rank', newRank);
    } else {
        console.error(`Invalid rank: ${newRank}`);
    }
}

function adjustRank(amount) {
    const currentRank = getRank();
    const currentLevel = convertKyuDanToLevel(currentRank);

    if (currentLevel === '?') {
        console.error(`Invalid current rank: ${currentRank}`);
        return;
    }

    let newLevel = Math.max(0, Math.min(ALL_RANKS.length - 1, currentLevel + amount));

    if (newLevel < convertKyuDanToLevel(LOWEST_RANK)) {
        newLevel = convertKyuDanToLevel(LOWEST_RANK); // lowest rank
    }

    const newRank = convertLevelToKyuDan(newLevel);

    setRank(newRank);
    return newRank;
}