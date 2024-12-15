const { SqlConnection } = require('./sql_connection');

const { playGame } = require('./GoAIPlay');
const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
const {playRatedGame} = require('./rated_game');




function getDist(a, b) {
    return Math.abs(a - b);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Example usage:
(async () => {
    let sql = new SqlConnection("AI_Data.db");


    while(true){
        try{
            let AI1 = await sql.getRandomAI()
            let AI2 = await sql.getRandomAI()
            //let boardsize = [9, 13, 19][Math.floor(Math.random() * 3)];
            let boardsize = 13
        
            let valid_pair = false;
            let accepted_dist = 0
            while(valid_pair == false){
                let rank1 = await sql.getRank(AI1, boardsize);
                let rank2 = await sql.getRank(AI2, boardsize);
                if(getDist(rank1, rank2) < accepted_dist && AI1 != AI2){
                    valid_pair = true
                }else{
                    AI1 = await sql.getRandomAI()
                    AI2 = await sql.getRandomAI()
                }
                accepted_dist++;
                accepted_dist = (accepted_dist % 3);
        
            }
        
            console.log(AI1);
            console.log(await sql.getRank(AI1, boardsize))
            console.log(AI2);
            console.log(await sql.getRank(AI2, boardsize))
        
            let result = await playRatedGame(AI1, AI2, boardsize, sql)
            console.log(result)
            await sleep(1000); // pause after every game
        }catch{

        }

    }

    console.log("DONE")

})();

