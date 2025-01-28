function getTopMoves(data) {
    // Split the input data into individual lines
    const lines = data.split('info');

    // Parse moves from the input data
    const moves = [];
    let currentMove = null;
    let moveScore = null;

    for (const line of lines) {
        if (line.startsWith(' move')) {
            const tokens = line.split(' ');
            currentMove = tokens[2];
            moveScore = parseFloat(tokens[10]); // Parse as a float for numerical sorting

            // Start a new move entry
            if (currentMove && !Number.isNaN(moveScore)) {
                moves.push({ move: currentMove, winrate: moveScore });
            }
        }
    }

    // Sort moves by winrate in descending order
    moves.sort((a, b) => b.winrate - a.winrate);

    // Get the top half of moves
    if(moves.length <= 6){
        return moves
    }
    const topMoves = moves.slice(0, Math.ceil(moves.length / 2));

    // Return the result
    return topMoves;
}
