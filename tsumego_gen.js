const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
const fs = require('fs').promises; // Use the promises API
const path = require('path');

/**
 * Selects a random element from an array.
 * @param {Array} array - The array to select a random element from.
 * @returns {*} - A random element from the array.
 */
async function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
async function parseSGFAndAddVW(sgf) {
  return sgf
  // Valid letters for a 19x19 board, skipping 'i'
  const validLetters = "abcdefghjklmnopqrst";

  // Regex to find B[...] or W[...] with two coordinates
  const regex = /[BW]\[([a-z])([a-z])\]/g;

  let minLeftIndex = Infinity;
  let maxLeftIndex = -Infinity;
  let minRightIndex = Infinity;
  let maxRightIndex = -Infinity;

  let match;
  while ((match = regex.exec(sgf)) !== null) {
    const left = match[1];
    const right = match[2];

    // Skip invalid letters or 'i'
    if (!validLetters.includes(left) || !validLetters.includes(right)) {
      continue;
    }

    const leftIndex = validLetters.indexOf(left);
    const rightIndex = validLetters.indexOf(right);

    // Update smallest/largest indices for left and right
    minLeftIndex = Math.min(minLeftIndex, leftIndex);
    maxLeftIndex = Math.max(maxLeftIndex, leftIndex);
    minRightIndex = Math.min(minRightIndex, rightIndex);
    maxRightIndex = Math.max(maxRightIndex, rightIndex);
  }

  // If no valid coordinates were found, return SGF unchanged
  if (minLeftIndex === Infinity) {
    return sgf;
  }

  // Determine the overall smallest and largest indices, including padding
  const overallMinIndex = Math.min(minLeftIndex, minRightIndex);
  const overallMaxIndex = Math.max(maxLeftIndex, maxRightIndex);

  const clamp = (val) => Math.max(0, Math.min(val, validLetters.length - 1));
  const paddedMinIndex = clamp(overallMinIndex - 5);
  const paddedMaxIndex = clamp(overallMaxIndex + 5);

  const smallestLetter = validLetters[paddedMinIndex];
  const largestLetter = validLetters[paddedMaxIndex];

  // Create the VW property
  const vwValue = `${smallestLetter}${smallestLetter}:${largestLetter}${largestLetter}`;

  // Add VW property right after the first "(;"
  return sgf.replace("(;", `(;VW[${vwValue}]`);
}


/**
 * Generates a random Tsumego (Go problem) from the "puzzles" directory.
 * @returns {string|null} - The content of a randomly selected Tsumego file, or null if the directory is empty.
 */
async function generateTsumego(difficulty, type, tsumego_sql) {
  try {
      // Directory containing the Tsumego puzzles
      const puzzlesDir = path.join(__dirname, 'puzzles');

      // Read all files in the puzzles directory
      const files = await fs.readdir(puzzlesDir);

      if (files.length === 0) {
          console.warn('No Tsumego puzzles found in the directory.');
          return null;
      }

      // Convert difficulty to ELO level
      const elo = await convertKyuDanToLevel(difficulty);
      console.log(`Requested difficulty: ${difficulty} -> ELO: ${elo}`);
      const puzzle = await tsumego_sql.getRandomPuzzle(elo);

      if (!puzzle || !puzzle.filename) {
          console.error('No valid puzzle returned from the database.');
          return null;
      }

      // Read and parse the selected file
      const filePath = path.join(puzzlesDir, puzzle.filename);
      const contents = await fs.readFile(filePath, 'utf-8'); // Use promises API for reading files
      const parsedContents = await parseSGFAndAddVW(contents);

      console.log('Returning puzzle:', puzzle);
      return parsedContents;
  } catch (err) {
      console.error('Error generating Tsumego puzzle:', err);
      return null;
  }
}
module.exports = { generateTsumego };
