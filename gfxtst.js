const si = require("systeminformation");

async function getAvailableVRAM() {
	try {
		const graphics = await si.graphics();
		if (graphics.controllers.length > 0) {
			// Sum VRAM from all detected GPUs
			return graphics.controllers.reduce(
				(totalVRAM, gpu) => totalVRAM + (gpu.vram || 0),
				0,
			);
		}
		return 0; // No GPU detected
	} catch (error) {
		console.error("Error checking GPU:", error);
		return 0;
	}
}

module.exports = { getAvailableVRAM };
