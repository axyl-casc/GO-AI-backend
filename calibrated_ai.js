const { SqlConnection } = require('./sql_connection');
const { playGame } = require('./GoAIPlay');
const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');


const MAX_HANDICAP_COMP = 6;

function getDist(a, b) {
    return Math.abs(a - b);
}

async function test(sql, boardsize) {
    try {
        let AI1 = await sql.getRandomAI();
        let AI2 = await sql.getRandomAI();

        let validPair = false;

        while (!validPair) {
            const rank1 = await sql.getRank(AI1, boardsize);
            const rank2 = await sql.getRank(AI2, boardsize);

            if (getDist(rank1, rank2) > 3 && getDist(rank1, rank2) < 9 && AI1 !== AI2) {
                validPair = true;
            } else {
                AI1 = await sql.getRandomAI();
                AI2 = await sql.getRandomAI();
            }

        }

        const r1 = await sql.getRank(AI1, boardsize)
        const r2 = await sql.getRank(AI2, boardsize)
        console.log(`AI1:\n${AI1}, Rank: ${convertLevelToKyuDan(r1)}`);
        console.log(`AI2:\n${AI2}, Rank: ${convertLevelToKyuDan(r2)}`);

        const avg = Math.floor((r1 + r2) / 2)
        console.log(`Avg rank: ${convertLevelToKyuDan(avg)}`)

        let ai_between = await sql.getBetween(boardsize, convertLevelToKyuDan(avg))
        if (ai_between.length === 1) {
            ai_between = [ai_between[0].path]
        } else {
            ai_between = [ai_between[0].path, ai_between[1].path]
        }
        console.log("AI opp")
        console.log(ai_between)

        const result = await playGame(ai_between, [AI1, AI2], 0, 6.5, 13)
        console.log(result);
    } catch (error) {
        console.error("Error during game execution:", error);
    }
}

(async () => {
    const sql = new SqlConnection("AI_Data.db"); // Replace with actual connection setup if needed
    const boardsize = 13;            // Example board size, adjust as required

    console.log("Starting game test...");
    await test(sql, boardsize);
})();