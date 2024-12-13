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

  module.exports = { ALL_RANKS, convertKyuDanToLevel, convertLevelToKyuDan };