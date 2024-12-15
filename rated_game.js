const { SqlConnection } = require('./sql_connection');
const { playGame } = require('./GoAIPlay');
const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');

function getDist(a, b) {
    return Math.abs(a - b);
}


async function playRatedGame(ai1_path, ai2_path, boardsize, sql) {

    let rank1 = await sql.getRank(ai1_path, boardsize);
    let rank2 = await sql.getRank(ai2_path, boardsize);
    let komi = 6.5
    let rank_diff = getDist(rank1, rank2);
    if(rank_diff > 9){
        return "err";
    }
    if(rank_diff > 0){
        komi = 0.5
    }
    if(rank_diff == 1){
        rank_diff = 0 // no handicap stones
    }


    const team1_paths = [ai1_path];
    const team2_paths = [ai2_path];


    console.log(`Starting Game with-\nKomi: ${komi}\nHandicap: ${rank_diff}\nDifference: ${getDist(rank1, rank2)}\nBoardsize: ${boardsize}`);
    let winner, certainty;

    if (rank1 > rank2) { 
        // team1 is stronger, so team2 plays as Black and team1 as White
        console.log(`Black: ${team2_paths}, White: ${team1_paths}`);
        ({ winner, certainty } = await playGame(team2_paths, team1_paths, rank_diff, komi));
    } else if (rank1 <= rank2) {
        // team2 is stronger, so team1 plays as Black and team2 as White
        console.log(`Black: ${team1_paths}, White: ${team2_paths}`);
        ({ winner, certainty } = await playGame(team1_paths, team2_paths, rank_diff, komi));
    }
    
    
    console.log(`Confidence: ${certainty}`);

    if (certainty > 60) {
        if (winner === team1_paths[0]) {
            await sql.changeRank(team1_paths[0], boardsize, 1);
            await sql.changeRank(team2_paths[0], boardsize, -1);
            return team1_paths[0];
        } else if (winner === team2_paths[0]) {
            await sql.changeRank(team1_paths[0], boardsize, -1);
            await sql.changeRank(team2_paths[0], boardsize, 1);
            return team2_paths[0];
        }
        
    }

    // No winner due to low certainty or other issues
    return null;
}
module.exports = { playRatedGame };

