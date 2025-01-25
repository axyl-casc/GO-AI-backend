const { SqlConnection } = require('./sql_connection');
const { playRatedGame } = require('./rated_game');

const MAX_HANDICAP_COMP = 7;

function getDist(a, b) {
    return Math.abs(a - b);
}

async function trainingGame(sql, boardsize) {
    try {
        let AI1 = await sql.getRandomAI();
        let AI2 = await sql.getRandomAI();

        let validPair = false;
        let acceptedDist = 5;

        while (!validPair) {
            let rank1 = await sql.getRank(AI1, boardsize);
            let rank2 = await sql.getRank(AI2, boardsize);

            if (getDist(rank1, rank2) < acceptedDist && AI1 !== AI2) {
                validPair = true;
            } else {
                AI1 = await sql.getRandomAI();
                AI2 = await sql.getRandomAI();
            }

            acceptedDist++;
            acceptedDist = acceptedDist % MAX_HANDICAP_COMP;
        }

        console.log(`AI1: ${AI1}, Rank: ${await sql.getRank(AI1, boardsize)}`);
        console.log(`AI2: ${AI2}, Rank: ${await sql.getRank(AI2, boardsize)}`);

        let result = await playRatedGame(AI1, AI2, boardsize, sql);
        console.log(result);
    } catch (error) {
        console.error("Error during game execution:", error);
    }

}

module.exports = {
    trainingGame,
};
