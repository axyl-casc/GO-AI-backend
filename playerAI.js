const {
	convertKyuDanToLevel,
	convertLevelToKyuDan,
} = require("./rank_conversion");
const { parseCommand, cleanMove } = require("./GoAIPlay");
const { GoAIInstance } = require("./ExternalAI");

function get_opp_color(current) {
	if (current === "black") {
		return "white";
	} else {
		return "black";
	}
}

class PlayerAI {
	constructor() {
		this.paths = "";
		this.instances = [];
		this.ai_color = "unknown";
		this.moveCount = 0;
		this.ai_count = 0;
		this.score_estimate = [];
		this.last_move_time = new Date();
		this.analysisEngine = null;
	}

	/**
	 * Initializes the AI with game settings.
	 */
	async create(
		sql,
		komi,
		boardsize,
		handicap,
		target_level,
		ai_color,
		type,
		companion_key,
		delta,
	) {
		target_level = convertLevelToKyuDan(
			convertKyuDanToLevel(target_level) + delta,
		);
		let search_boardsize = 9;
		if (boardsize === 19 || boardsize === 13 || boardsize === 9) {
			search_boardsize = boardsize;
		}
		let ai_between = await sql.getBetween(search_boardsize, target_level);
		console.log(ai_between);
		this.ai_count = ai_between.length;
		if (this.ai_count === 1) {
			ai_between = [ai_between[0].path];
		} else {
			ai_between = [ai_between[0].path, ai_between[1].path];
		}
		this.paths = ai_between;
		this.instances = [];
		this.ai_color = ai_color;

		for (const i of this.paths) {
			const [exe, args] = parseCommand(i);
			this.instances.push(new GoAIInstance(exe, args));
		}
		console.log(`key -> ${companion_key}`);
		let analysis_engine_path = await sql.getAIFromKey(companion_key);
		analysis_engine_path = analysis_engine_path[0].path;
		console.log(`Analysis Engine: ${analysis_engine_path}`);
		const [exe, args] = parseCommand(analysis_engine_path);
		this.analysisEngine = new GoAIInstance(exe, args);
		for (const ai of this.instances) {
			await ai.sendCommand(`boardsize ${boardsize}`);
		}
		await this.analysisEngine.sendCommand(`boardsize ${boardsize}`);
		if (type === "handicap") {
			for (const i of this.instances) {
				const starDistance = boardsize >= 13 ? 3 : 2; // 4th line for boards >= 13x13, 3rd line for smaller boards

				// Define star points in the traditional handicap placement order
				const starPoints = [
					{ x: starDistance, y: boardsize - starDistance - 1 }, // Top left
					{ x: boardsize - starDistance, y: starDistance }, // Bottom right
					{ x: boardsize - starDistance, y: boardsize - starDistance - 1 }, // Top right
					{ x: starDistance, y: starDistance }, // Bottom left
					{ x: Math.floor(boardsize / 2) + 1, y: Math.floor(boardsize / 2) }, // Center
				];

				// Ensure handicap_stones does not exceed 5
				const stonesToPlace = Math.min(handicap, 5);

				// Place the required number of handicap stones
				for (let j = 0; j < stonesToPlace; j++) {
					const point = starPoints[j];

					// Convert coordinates to Go notation
					const letter = String.fromCharCode(65 + point.x); // Convert x to letter (A, B, ...)
					const number = boardsize - point.y; // Convert y to Go coordinates (1, 2, ...)

					// Send the command to place the stone
					await i.sendCommand(`play B ${letter}${number}`);
					await this.analysisEngine.sendCommand(`play B ${letter}${number}`);
				}
			}
		}
		this.komi = komi
		for (const ai of this.instances) {
			await ai.sendCommand(`komi ${komi}`);
		}
		await this.analysisEngine.sendCommand(`komi ${komi}`);
		await this.analysisEngine.sendCommand("kata-set-rules aga");

		// Place alternating black (B) and white (W) stones on opposite corners
		if (type === "chinese") {
			for (const i of this.instances) {
				const starDistance = boardsize >= 13 ? 3 : 2; // 4th line for boards >= 13x13, 3rd line for smaller boards

				// Define star points
				const starPoints = [
					{ x: starDistance, y: starDistance, color: "W" }, // Top left, black
					{ x: boardsize - starDistance, y: starDistance, color: "B" }, // Top right, white
					{ x: starDistance, y: boardsize - starDistance - 1, color: "B" }, // Bottom left, white
					{
						x: boardsize - starDistance,
						y: boardsize - starDistance - 1,
						color: "W",
					}, // Bottom right, black
				];

				// Place stones on the star points
				for (const point of starPoints) {
					const letter = String.fromCharCode(65 + point.x); // Convert x to letter (A, B, ...)
					const number = boardsize - point.y; // Convert y to Go coordinates (1, 2, ...)
					await i.sendCommand(`play ${point.color} ${letter}${number}`);
					await this.analysisEngine.sendCommand(
						`play ${point.color} ${letter}${number}`,
					);
				}
			}
		}
	}

	async terminate() {
		for (const i of this.instances) {
			await i.sendCommand("quit");
			await i.terminate();
		}
		await this.analysisEngine.sendCommand("quit");
		await this.analysisEngine.terminate();
	}

	/**
	 * Makes a move based on the current game state.
	 * @param {Object} move - The move to play.
	 * @param {number} move.x - The x-coordinate of the move.
	 * @param {number} move.y - The y-coordinate of the move.
	 * @returns {Object} - The move made by the AI.
	 */
	async play(move) {
		this.last_move_time = new Date();
		let response = "";
		await this.analysisEngine.sendCommand(
			`play ${get_opp_color(this.ai_color)} ${move}`,
		);
		if (this.ai_count === 1) {
			response = await this.instances[0].sendCommand(
				`play ${get_opp_color(this.ai_color)} ${move}`,
			);
			response = await this.instances[0].sendCommand(
				`genmove ${this.ai_color}`,
			);

			this.moveCount++;
		} else {
			response = await this.instances[
				this.moveCount % this.ai_count
			].sendCommand(`play ${get_opp_color(this.ai_color)} ${move}`);
			response = await this.instances[
				this.moveCount % this.ai_count
			].sendCommand(`genmove ${this.ai_color}`);

			this.moveCount++;
			await this.instances[this.moveCount % this.ai_count].sendCommand(
				`play ${get_opp_color(this.ai_color)} ${move}`,
			);
			await this.instances[this.moveCount % this.ai_count].sendCommand(
				`play ${this.ai_color} ${cleanMove(response[0])}`,
			);
		}
		let score = "";
		if (this.moveCount % 2 === 0) {
			this.score_estimate = [];
			// Update score estimate
			for (const i of this.instances) {
				score = await i.sendCommand("final_score"); // Wait for each command
				this.score_estimate.push(cleanMove(score[0]));
			}
			score = await this.analysisEngine.sendCommand("final_score"); // Wait for each command
			this.score_estimate.push(cleanMove(score[0]));
		}
		await this.analysisEngine.sendCommand(
			`play ${this.ai_color} ${cleanMove(response[0])}`,
		);

		//let analysis_moves = await this.analysisEngine.sendCommand(`kata-analyze ${get_opp_color(this.ai_color)} 1`)
		// print AI view

		const analysis_moves = await this.analysisEngine.sendCommand(
			"kata-search_analyze",
		);
		//console.log(this.getTopMoves(analysis_moves, 3))
		response = cleanMove(response[0]);
		const test = await this.analysisEngine.sendCommand("showboard");
		console.log(`AI response: ${response}\nAnalysis: \n`);
		console.log(test);
		return {
			response: response,
			score: this.score_estimate,
			hint: analysis_moves,
		};
	}

	async getTopMoves(katagoResponse, topN = 5) {
		const moveInfos = katagoResponse.moveInfos; // Extract moveInfos from the response
		moveInfos.sort((a, b) => b.winrate - a.winrate); // Sort by winrate descending
		return moveInfos.slice(0, topN).map((info) => ({
			move: info.move,
			winrate: info.winrate,
			scoreLead: info.scoreLead,
			pv: info.pv,
		}));
	}
}

module.exports = { PlayerAI };
