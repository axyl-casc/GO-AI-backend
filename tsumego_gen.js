const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
const fs = require('fs');
const path = require('path');

/**
 * Selects a random element from an array.
 * @param {Array} array - The array to select a random element from.
 * @returns {*} - A random element from the array.
 */
function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function parseSGFAndAddVW(sgf) {
    console.log("Original SGF:\n", sgf); // Debugging log
  
    // Step 1: Helper function to parse SGF coordinates
    const parseCoord = (coord) => ({
      x: coord.charCodeAt(0) - "a".charCodeAt(0), // 'a' = 0, 'b' = 1, etc.
      y: 19 - parseInt(coord.slice(1)), // Reverse for Go coordinates
    });
  
    // Step 2: Helper function to convert numeric indices back to Go coordinates
    const toGoCoord = ({ x, y }) =>
      String.fromCharCode(x + "a".charCodeAt(0)) + (19 - y);
  
    // Step 3: Extract all `AW` and `AB` entries
    const stones = [...sgf.matchAll(/(AW|AB)\[([a-z]\d+)\]/g)];
    console.log("Extracted stones:", stones); // Debugging log
  
    const positions = stones.map(([, , coord]) => parseCoord(coord));
  
    // Step 4: If no stones are found, return the SGF unchanged
    if (positions.length === 0) {
      console.warn("No stones found in SGF.");
      return sgf;
    }
  
    // Step 5: Calculate the bounding box for all stones
    const minX = Math.min(...positions.map((pos) => pos.x));
    const maxX = Math.max(...positions.map((pos) => pos.x));
    const minY = Math.min(...positions.map((pos) => pos.y));
    const maxY = Math.max(...positions.map((pos) => pos.y));
  
    // Step 6: Generate the `VW` tag
    const startCoord = toGoCoord({ x: minX, y: minY });
    const endCoord = toGoCoord({ x: maxX, y: maxY });
    const vwTag = `VW[${startCoord}:${endCoord}]`;
    console.log("Generated VW tag:", vwTag); // Debugging log
  
    // Step 7: Insert the VW tag after RU[...] in the SGF
    const sgfWithVW = sgf.replace(/(RU\[.*?\])/, `$1${vwTag}`);
  
    console.log("Updated SGF:\n", sgfWithVW); // Debugging log
  
    return sgfWithVW;
  } // doesnt work

/**
 * Generates a random Tsumego (Go problem) from the "puzzles" directory.
 * @returns {string|null} - The content of a randomly selected Tsumego file, or null if the directory is empty.
 */
function generateTsumego() {
    // Directory containing the Tsumego puzzles
    const puzzlesDir = path.join(__dirname, 'puzzles');

    try {
        // Read all files in the puzzles directory
        const files = fs.readdirSync(puzzlesDir);

        if (files.length === 0) {
            console.warn('No Tsumego puzzles found in the directory.');
            return null;
        }

        // Select a random file from the list
        const randomFile = getRandomElement(files);

        // Read and return the content of the selected file
        let contents = fs.readFileSync(path.join(puzzlesDir, randomFile), 'utf-8');
        contents = parseSGFAndAddVW(contents)

        return contents;
    } catch (err) {
        console.error('Error reading puzzles directory:', err);
        return null;
    }
}

module.exports = { generateTsumego };
