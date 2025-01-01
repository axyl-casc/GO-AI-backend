const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
const {parseCommand, cleanMove} = require('./GoAIPlay')
const { GoAIInstance } = require('./ExternalAI');

function get_opp_color(current){
    if(current == "black"){
        return "white"
    }else{
        return "black"
    }
}

class PlayerAI {
    constructor() {
        this.paths = ""
        this.instances = []
        this.ai_color = "unknown"
        this.moveCount = 0;
        this.ai_count = 0
        this.score_estimate = []
        this.last_move_time = new Date();
    }

    /**
     * Initializes the AI with game settings.
     */
    async create(sql, komi, boardsize, handicap, target_level, ai_color) {
        let ai_between = await sql.getBetween(boardsize, target_level)
        console.log(ai_between)
        this.ai_count = ai_between.length
        if(this.ai_count == 1){
            ai_between = [ai_between[0].path]
        }else{
            ai_between = [ai_between[0].path, ai_between[1].path]
        }
        this.paths = ai_between
        this.instances = []
        this.ai_color = ai_color

        for(let i of this.paths){
            let [exe, args] = parseCommand(i)
            this.instances.push(new GoAIInstance(exe, args))
        }

        for(let ai of this.instances){
            ai.sendCommand(`komi ${komi}`)
            ai.sendCommand(`boardsize ${boardsize}`)
        }
    }

    async terminate(){
        for (let i of this.instances) {
            score = await i.sendCommand(`quit`); 
            i.terminate()
        }
    }
    

    /**
     * Makes a move based on the current game state.
     * @param {Object} move - The move to play.
     * @param {number} move.x - The x-coordinate of the move.
     * @param {number} move.y - The y-coordinate of the move.
     * @returns {Object} - The move made by the AI.
     */
    async play(move) {
        this.last_move_time = new Date()
        let response = ""
        if(this.ai_count == 1){
            response = await this.instances[0].sendCommand(`play ${get_opp_color(this.ai_color)} ${move}`)
            response = await this.instances[0].sendCommand(`genmove ${this.ai_color}`)
    
            this.moveCount++;

        }else{
            response = await this.instances[this.moveCount % this.ai_count].sendCommand(`play ${get_opp_color(this.ai_color)} ${move}`)
            response = await this.instances[this.moveCount % this.ai_count].sendCommand(`genmove ${this.ai_color}`)
    
            this.moveCount++;
            this.instances[this.moveCount % this.ai_count].sendCommand(`play ${get_opp_color(this.ai_color)} ${move}`)
            this.instances[this.moveCount % this.ai_count].sendCommand(`play ${this.ai_color} ${cleanMove(response[0])}`)
        }
        let score = "";
        if (this.moveCount % 2 == 0) {
            this.score_estimate = [];
            // Update score estimate
            for (let i of this.instances) {
                score = await i.sendCommand(`final_score`); // Wait for each command
                this.score_estimate.push(cleanMove(score[0]));
            }
        }

        //let test = await this.instances[0].sendCommand(`showboard`);
        //console.log(test);
        response = cleanMove(response[0])

        return {response:response, score:this.score_estimate};
    }
}

module.exports = {PlayerAI};
