const companionToggleButton = document.getElementById("companionToggleButton");

// Fundamental Go (Baduk) Proverbs with Tips
const proverbs = [
	"Separate your opponent's stones and keep yours connected. Tip: Use techniques like a well-timed kosumi (diagonal connection) or avoid unnecessary cut moves to preserve your group's unity.",
	"Are any of your groups in Atari? Remember: A group in Atari has only one liberty left. Always be alert to avoid leaving your stones vulnerable.",
	"Ensure all your groups have potential for two eyes (i.e., are alive). Key Concept: Forming two eyes is fundamental to securing a living group and avoiding a fatal capture.",
	"Play urgent moves before big moves. Strategy: Prioritize moves that seize the initiative—often referred to as maintaining Sente—so your opponent is forced to respond.",
	"Do not waste moves; every stone should have a purpose. Insight: Just as a clever Tesuji can turn the tide of a local fight, each move should contribute to your overall plan.",
	"A thick position is better than a weak territory. Advice: Build thickness (solid, influential formations) which can serve both offensive and defensive roles on the board.",
	"The enemy’s key point is your key point. Observation: Critical spots on the board benefit both players; control them to dictate the flow of the game.",
	"Do not chase your opponent’s stones too aggressively; they will make shape. Caution: Overzealous pursuit can allow your opponent to employ techniques like a well-timed Hane to create counter-threats.",
	"Play away from strength. Tip: Avoid direct conflicts with areas of solid strength where your opponent’s stones are well connected.",
	"If you don't know where to play, make a move near the biggest open area. Tactic: This often helps in creating a large Moyo (framework) that can be developed into territory later.",
	"Don't attach to strong stones unless you have a clear purpose. Note: Attaching blindly may reinforce your opponent’s position instead of challenging it.",
	"Sacrificing a few stones can lead to a bigger gain. Lesson: Sometimes a temporary loss (or Gote move) can set the stage for a decisive advantage later.",
	"A peep forces the opponent to respond and can set up future attacks. Usage: A well-timed peep not only applies pressure but also disrupts your opponent’s plans.",
	"Two weak groups are dangerous; strengthen one or connect them. Reminder: Avoid leaving groups isolated and vulnerable; always work to consolidate your forces.",
	"A good move is one that creates multiple threats. Example: Moves with Kikashi qualities force your opponent to juggle several problems at once.",
	"Do not push from behind; instead, extend and build influence. Practice: Extend your position to add liberties and develop your territory while staying flexible.",
	"The first move in the corner is often the most valuable. Study: Learn common Joseki (established corner sequences) to maximize the efficiency of your early moves.",
	"Avoid playing moves that fix your opponent's weaknesses. Advice: Sometimes, by playing a move that inadvertently strengthens your opponent’s Sabaki (flexible formation), you give away the initiative.",
	"A monkey jump late in the game can be devastating. Tip: Use a monkey jump as an unexpected endgame move to unsettle your opponent’s plans.",
	"If your opponent has an unsettled group, attack it before defending your own weak group. Strategy: Taking the initiative against an opponent’s unstable group can swing momentum in your favor.",
	"Make forcing moves before committing to a major decision. Insight: Forcing moves keep you in Sente, allowing you to dictate the pace of the game.",
	"Always count liberties in capturing races. Calculation: Knowing the exact number of liberties is critical in evaluating whether a group can be captured.",
	"An empty triangle is usually inefficient. Tip: Avoid building shapes that waste moves and reduce overall efficiency on the board.",
	"Avoid over-concentration; spread your stones efficiently. Advice: Balance your influence across the board instead of clustering too many stones in one area.",
	"Control the center to influence multiple areas at once. Strategy: A strong central presence can help you react quickly to developments on any part of the board.",
	"Focus on corners, then sides, then center. Explanation: Corners offer the most efficient territory in the opening, so secure them first.",
	"Do not rush into fights too early. Explanation: The opening is about building frameworks and avoiding needless battles.",
	"Build flexible shapes over rigid territory. Explanation: Maintaining adaptability prevents over-concentration or easy invasions.",
	"Balance territory and influence. Explanation: Over-prioritizing one may leave you weak in the other.",
	"When approaching the enemy corner, choose your approach height wisely. Explanation: Low approaches secure territory, while high approaches aim for influence.",
	"Coordinate your stones to support each other. Explanation: Moves that work together create synergy, strengthening your overall position.",
	"Avoid playing deep invasions in the early fuseki. Explanation: Invading too soon can lead to weak groups with limited escape routes.",
	"Review your opponent’s framework before expanding. Explanation: Adapt to or counter their fuseki to avoid falling behind.",
	"Keep track of how many liberties all of your groups have, and know how many liberties your opponents groups have. Remember, knowledge is the key to victory. ",
	"Don’t go fishing while your house is on fire. Tip: Prioritize urgent threats over speculative gains.",
	"Never trust your opponent. Tip: Always verify their moves and potential traps before playing.",
	"Give your opponent what they want. Tip: If an opponent's threat isn't actually that dangerous, your plan is worth more than trying to prevent theirs.",
	"Make a fist before you strike. Tip: Strengthen your own position before launching an attack.",
	"Don’t try to win in the opening. Tip: Avoid overextending to punish early mistakes—focus on a balanced setup instead.",
	"Don’t use influence to make territory. Tip: Influence is best used for attacking, reducing, or supporting your groups rather than directly securing points.",
	"Don’t make 20 points inside your moyo—threaten to make 50. Tip: Encourage your opponent to invade by making your framework appear even larger, so you can attack profitably.",
	"People in glass houses shouldn’t throw stones. Tip: Don't start fights if your own groups are weak.",
	"Six die but eight live. Tip: A group with six stones in a straight line often dies, while a group of eight has better chances of survival.",
	"Four die but six live. Tip: Small groups in confined spaces need at least six liberties or extensions to survive.",
	"Don’t play good stones to save dead stones. Tip: Avoid wasting moves on groups that are already lost.",
	"Never play the first line without a good reason. Tip: The first line is typically inefficient unless it's a crucial endgame move.",
	"Force the enemy towards your thickness. Tip: Guide your opponent into a strong area of your own influence, where they will struggle.",
	"Play away from thickness. Tip: Avoid playing in areas where your opponent already has a strong position.",
	"Two stones die, but three live. Tip: Many formations need at least three stones to ensure stability.",
	"Do not attach to strong stones unless you have a clear purpose. Tip: Attaching carelessly can reinforce your opponent instead of weakening them.",
	"Play the shape move. Tip: Good shape makes your stones more efficient and flexible.",
	"Sacrificing a few stones can lead to a bigger gain. Tip: Sometimes, giving up small groups creates better overall results.",
	"A weak group running makes your whole board weak. Tip: Strengthen weak groups early to avoid giving your opponent momentum.",
	"The enemy’s vital point is your vital point. Tip: Key intersections are often just as important for both sides.",
	"A peep forces the opponent to respond and can set up future attacks. Tip: Small forcing moves like peeps create opportunities for future gains.",
	"Do not push from behind; instead, extend and build influence. Tip: Avoid strengthening your opponent by pushing them into a solid shape.",
	"The monkey jump late in the game can be devastating. Tip: Use the monkey jump in the endgame to reduce your opponent’s territory efficiently.",
	"If your opponent has an unsettled group, attack it before defending your own weak group. Tip: Take the initiative whenever possible.",
	"Make forcing moves before committing to a major decision. Tip: Keep sente and test your opponent’s responses before choosing a direction.",
	"Always count liberties in capturing races. Tip: Understanding the liberty count is crucial in fights.",
	"An empty triangle is usually inefficient. Tip: Avoid bad shape that wastes moves.",
	"Control the center to influence multiple areas at once. Tip: A strong presence in the center helps coordinate attacks.",
	"If you don’t know where to play, make a move near the biggest open area. Tip: Prioritize big moves over small ones.",
	"Balance territory and influence. Tip: Overcommitting to one leaves weaknesses in the other.",
	"When approaching the enemy corner, choose your approach height wisely. Tip: Low approaches secure territory, while high approaches build influence.",
	"Avoid over-concentration; spread your stones efficiently. Tip: A well-balanced position is stronger than a clustered one.",
	"Coordinate your stones to support each other. Tip: Stones working together create a solid foundation for future play.",
	"The best defense is an attack. Tip: Strengthening your own position often comes from putting pressure on your opponent.",
	"Big moves before small moves. Tip: Play the largest point available before considering minor moves.",
	"Never start a ko you cannot win. Tip: Entering a ko fight without enough threats can be disastrous.",
	"Don’t respond to every threat; assess if it’s really dangerous. Tip: Sometimes ignoring a threat and playing elsewhere is better.",
	"Play to maximize your future possibilities. Tip: Moves should provide flexibility rather than locking you into rigid plans.",
	"Don’t let your groups become lonely. Tip: Isolated groups are easier to attack and harder to save.",
	"The first move in the corner is often the most valuable. Tip: The corners are the most efficient places to secure territory.",
];
const beginnerProverbs = [
	"Separate your opponent’s stones and keep yours connected. - Connected stones are safer and harder to capture. Split your opponent’s groups to make them weaker.",
	"Always check if your groups are in Atari (one liberty left). - If your stones have only 1 liberty, add a stone to escape or connect them to a safer group.",
	"Make sure your groups can form two eyes to survive. - Two eyes (empty spaces inside your group) mean it can’t be captured. Corners are easiest for making eyes!",
	"Fix urgent problems before making big moves. - Save your weak/in-danger groups first, then focus on claiming territory.",
	"Every move should do something useful. - Don’t play random stones. Defend weak groups, attack opponents, or expand your territory.",
	"Two weak groups will get you into trouble. Strengthen one or connect them. - Focus on making one group safe instead of splitting your effort.",
	"Don’t chase your opponent’s stones too much. - Chasing lets them build strong shapes. Focus on your own weak spots instead.",
	"Play away from your opponent’s strong areas. - Avoid placing stones right next to their thick walls or strong groups.",
	"If stuck, play near the biggest empty area. - Empty spaces = potential territory. On 9x9 boards, the center is often important!",
	"Don’t attach to strong stones unless you have a plan. - Placing a stone directly next to their strong group usually helps them more than you.",
	"Sacrifice a few stones to gain something bigger. - Let them capture 1-2 stones if it helps you build a wall or control the board.",
	"A ‘peep’ (threat to cut) forces your opponent to respond. - Use peeps to create weaknesses in their shape for future attacks.",
	"Good moves do two things at once. - Example: A stone that defends your group AND attacks your opponent’s weak stones.",
	"Don’t push from behind—extend instead. - Pushing strengthens their stones. Extend sideways to build influence safely.",
	"Don’t help your opponent fix their weak groups. - If their stones are disconnected, don’t play a move that lets them connect.",
	"Attack your opponent’s weak groups before defending yours. - Keeping pressure on them gives you time to fix your own problems later.",
	"Count liberties in capturing races! - The group with more liberties wins. Add liberties to yours and reduce theirs.",
	"Avoid the ‘empty triangle’ shape. - Three stones in a triangle waste a liberty. Use looser shapes like a bamboo joint.",
	"Don’t cram too many stones in one area. - Spread out to control more territory efficiently.",
	"Corners first, then sides, then center. - Corners are easiest to secure (use two edges for protection).",
	"Don’t start fights too early. - Build a safe base (like a corner group) before attacking.",
	"Balance territory and influence. - Claim corners/sides for points, but use center stones to influence the board.",
	"Never start a ko fight you can’t win. - Ko fights require ‘threats’ to win. If you lack threats, avoid starting one.",
	"Don’t respond to every threat—ask: ‘Is this really dangerous?’. - Small threats can often be ignored for bigger moves.",
	"Don’t let your groups become lonely. - Connect isolated stones to friends or give them space to breathe.",
  ];
// Glossary of Key Go Terms
const definitions = {
	Atari:
		"A state where a stone or group has only one liberty left, risking capture on the next move. It’s used to threaten capture or force defensive responses.",
	Sente:
		"The initiative—a move so urgent that your opponent must respond. Keeping Sente allows you to control the game’s flow.",
	Gote: "A non-forcing move that loses initiative. While sometimes necessary, overreliance on Gote can put you on the back foot.",
	Joseki:
		"Established corner sequences that are considered locally balanced. Familiarity with Joseki helps you avoid early disadvantages.",
	Hane: "A bending move around an opponent's stones used to create strength or cutting points. It’s a classic technique for shaping a favorable position.",
	Ko: "A recurring capture situation governed by special rules. Ko fights require careful threat management and tactical planning.",
	Tesuji:
		"Tactical brilliance—a clever local move that resolves complex situations optimally. Mastering Tesuji is essential for advanced play.",
	Sabaki:
		"Light, flexible formations that avoid heavy commitments. It’s the art of making groups that are unsettled yet resilient.",
	Dame: "Neutral points on the board with no territorial value. They are filled in only during the endgame to complete the board.",
	Moyo: "A large territorial framework with potential to become actual territory. Effective Moyo building requires careful follow-through.",
	Seki: "A mutual life situation where neither player can capture the other’s stones. Groups in Seki share liberties in a delicate balance.",
	Komi: "Compensation points given to White (usually 6.5–7.5) to balance Black’s first-move advantage.",
	Thickness:
		"Solid, wall-like formations that radiate influence. A position with good thickness is often both robust and flexible.",
	Peep: "A small but forcing move that compels your opponent to respond, setting up opportunities for future attacks.",
	Cut: "The act of disconnecting your opponent’s stones. Accurate cut moves can disrupt your opponent’s formation and isolate groups.",
	Extend:
		"A move that strengthens a formation by adding liberties. Extend wisely to ensure your groups remain flexible and resilient.",
	Pincer:
		"An attacking maneuver that approaches stones from both sides. The effectiveness of a pincer depends on timing and positioning.",
	Ladder:
		"A chasing sequence that, if not carefully handled, leads to the capture of stones near the board’s edge. Knowing ladder patterns is crucial to avoid traps.",
	Net: "A capturing technique that wraps around your opponent’s stones, often more decisive than a ladder.",
	"Monkey Jump":
		"An endgame move using a diagonal 3rd-line slide that can unsettle your opponent’s position unexpectedly.",
	Probe:
		"An exploratory move used to test your opponent’s intentions and uncover their strategic plans.",
	"Shoulder Hit":
		"A reduction move that places a stone diagonally against your opponent’s framework, often forcing them to defend.",
	Tenuki:
		"The strategic choice of ignoring local play to address larger issues elsewhere on the board.",
	Keima:
		"A knight's move (2-1 pattern) offering flexible development. It’s a foundational pattern in many opening strategies.",
	Kikashi:
		"Forcing moves with deferred benefits that accumulate advantages while maintaining Sente.",
	Aji: "The latent potential in a position. Skilled players exploit aji to transform subtle advantages into decisive wins.",
	Kosumi:
		"A diagonal connection that, while sometimes slow, can be very effective in strengthening groups.",
	Oyose:
		"Large, precise endgame plays that help determine final territorial boundaries.",
	Fuseki:
		"The opening phase of the game, where players establish initial frameworks of influence and territory.",
	Hoshi:
		"A 'star point' at the 4-4 position in the corner, known for its balance between territory and influence.",
	Komoku:
		"The 3-4 point in a corner, offering a flexible balance of territory and development opportunities.",
	Sansan:
		"The 3-3 point in a corner, focusing on fast territory, though it can be invaded or pressured early.",
	Enclosure:
		"Also called a 'shimari'; a small framework in the corner made by two or more stones that limits your opponent's approach.",
	Shimari:
		"A specific type of corner enclosure (often 4-4 and 3-4 stones in a corner) with strong territorial potential and reduced weaknesses.",
	"Chinese Fuseki":
		"An opening strategy placing a stone at the star point, then an approach, aiming to build a large framework quickly.",
	"Micro Chinese Fuseki":
		"A tighter variation of the Chinese Fuseki, emphasizing early territory while maintaining some influence.",
	"Approach Move":
		"A stone played near an opponent’s corner to reduce their territorial potential or establish your own footing.",
	"High Approach":
		"Placing an approach stone one line higher (e.g., the 4th line) for more influence, leaving some territorial weakness.",
	"Low Approach":
		"Placing an approach stone on the 3rd line, typically prioritizing secure territory over influence.",
	Mokuhazushi:
		"A less common corner strategy (the 3-5 or 5-3 point), offering unusual development patterns in the opening.",
	Approaches:
		"Moves that challenge an opponent's corner position by placing a stone nearby. Approaches can be high (4th line) for influence or low (3rd line) for secure territory.",
	"Weak Group":
		"A group of stones without two eyes or a stable connection to another strong group. Weak groups are vulnerable to attack and must either run, connect, or create life.",
	"Strong Group":
		"A group of stones that has two eyes, is well-connected, or is thick enough to resist attacks. Strong groups exert influence and can be used to attack weak groups.",
	Flexible:
		"A position or shape that can adapt to different board situations. Flexible stones can respond dynamically to an opponent's moves rather than being rigid or over-concentrated.",
	Liberties:
		"Free or empty spaces that surround your stone, or group of stones. Important to track when dealing with life and death situations.",
	Life: "A group of stones is alive if it has at least two separate eyes, making it impossible to be captured.",
	Death:
		"A group of stones is dead if it cannot form two eyes or escape capture, meaning it will inevitably be removed from the board.",
	Influence:
		"The potential control a group of stones exerts over an area, often used to support future expansions or limit an opponent’s options.",
	Liberty:
		"A free or empty point adjacent to a stone or group of stones. Keeping track of liberties is crucial in capturing races and life-and-death situations.",
	Territory:
		"An area of the board controlled by a player, surrounded by their stones and free of the opponent’s influence.",
	Threat:
		"A move or sequence that forces an opponent to respond, often used to gain an advantage or set up a future attack.",
};

function getAdvice(topic) {
	let selectedProverb;
	console.log(`Generating Advice : ${topic}`)
	if(topic.toLowerCase() === "beginner"){
		selectedProverb = beginnerProverbs[getRandomInt(0, beginnerProverbs.length - 1)];
	}else if (topic.toLowerCase() === "none") {
		// Original behavior: pick any random proverb
		selectedProverb = proverbs[getRandomInt(0, proverbs.length - 1)];
	} else{
		// Filter proverbs by the given topic (case-insensitive)
		const filteredProverbs = proverbs.filter((p) =>
			p.toLowerCase().includes(topic.toLowerCase()),
		);

		if (filteredProverbs.length > 0) {
			// If we found any matching proverbs, pick one at random
			console.log(`Found proverb matching ${topic}`);
			selectedProverb =
				filteredProverbs[getRandomInt(0, filteredProverbs.length - 1)];
		} else {
			// Fallback: no matching proverbs found, pick any random proverb
			selectedProverb = proverbs[getRandomInt(0, proverbs.length - 1)];
		}
	}

	// Extract and normalize words from the selected proverb
	const words = selectedProverb
		.split(/[\s.,;:!?()]+/g) // Split on whitespace and punctuation
		.filter((w) => w) // Remove empty strings
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

	// Find matching terms (with multi-word support)
	const foundTerms = new Set();

	// Check for 2-word terms first
	for (let i = 0; i < words.length - 1; i++) {
		const phrase = `${words[i]} ${words[i + 1]}`;
		if (definitions[phrase]) {
			foundTerms.add(phrase);
			i++; // Skip next word
		}
	}

	// Check single-word terms
	words.forEach((word, i) => {
		if (
			!foundTerms.has(word) &&
			!Array.from(foundTerms).some((term) => term.includes(word)) &&
			definitions[word]
		) {
			foundTerms.add(word);
		}
	});

	// Create DOM elements
	const container = document.createElement("div");

	const proverbEl = document.createElement("p");
	proverbEl.textContent = selectedProverb;
	proverbEl.style.fontStyle = "italic"; // Italic styling
	proverbEl.style.fontSize = "20px"; // Adjust size as needed

	container.appendChild(proverbEl);

	// Separator
	container.appendChild(document.createElement("hr"));

	// Definitions list
	const definitionsEl = document.createElement("div");
	const list = document.createElement("ul");
	definitionsEl.innerHTML = "<br><p><strong>Related Concepts:</strong></p>";

	if (foundTerms.size > 0) {
		Array.from(foundTerms).forEach((term) => {
			const li = document.createElement("li");
			li.innerHTML = `<strong>${term}</strong>: ${definitions[term]}`;
			list.appendChild(li);
		});
	}

	const definitionKeys = Object.keys(definitions);
	const randomDefinition =
		definitionKeys[getRandomInt(0, definitionKeys.length - 1)];
	const li = document.createElement("li");
	li.innerHTML = `<strong>${randomDefinition}</strong>: ${definitions[randomDefinition]}`;
	list.appendChild(li);

	definitionsEl.appendChild(list);
	container.appendChild(definitionsEl);

	return container;
}

function getCompanion() {
	// Get the user's inventory
	const inventory = getInventory();

	// Find the equipped companion in the inventory
	const equippedCompanion = inventory.find(
		(item) => item.category.includes("companion") && item.equipped,
	);

	// Return the equipped companion or null if none is equipped
	return equippedCompanion || null;
}
