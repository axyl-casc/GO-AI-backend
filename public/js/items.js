const ALL_ITEMS = [
	{
		title: "Polished Oak Go Board",
		image: "textures/wood1.jpg",
		description:
			"A durable oak Go board with a polished surface for a modern look.",
		price: 65,
		shoppable: true,
		category: ["boards"],
		dropchance: 12,
	},
	{
		title: "Rich Pine Go Board",
		image: "textures/wood3.jpg",
		description:
			"Elegant pine Go board with a warm tone and excellent durability.",
		price: 50,
		shoppable: true,
		category: ["boards"],
		dropchance: 10,
	},
	{
		title: "Premium Walnut Go Board",
		image: "textures/wood4.jpg",
		description: "A luxurious walnut Go board with an exquisite finish.",
		price: 80,
		shoppable: true,
		category: ["boards"],
		dropchance: 15,
	},
	{
		title: "Stylish Ash Go Board",
		image: "textures/wood5.jpg",
		description:
			"A minimalist ash Go board with a sleek design for modern players.",
		price: 70,
		shoppable: true,
		category: ["boards"],
		dropchance: 12,
	},
	{
		title: "Golden Birch Go Board",
		image: "textures/wood6.jpg",
		description:
			"A golden birch Go board with exceptional craftsmanship and durability.",
		price: 75,
		shoppable: true,
		category: ["boards"],
		dropchance: 10,
	},
	{
		title: "Sai",
		image: "img/go_master.webp",
		description: "The SAI himself!",
		price: 5000,
		shoppable: true,
		ai_key: 34, // 1800s ai
		category: ["companion"],
		dropchance: 1000,
	},
	{
		title: "Baby Go Bot",
		image: "img/beginner.webp",
		description: "Humble Beginnings!",
		price: 100,
		shoppable: true,
		ai_key: 38, //20k
		category: ["featured", "companion"],
		dropchance: 10,
	},
	{
		title: "Aya",
		image: "img/aya.webp",
		description: "Aya - the moderately strong GO companion!",
		price: 500,
		shoppable: false,
		ai_key: 63,
		category: ["companion"],
		dropchance: 20,
	},
	{
		title: "Dean",
		image: "img/dean.webp",
		description: "A decently strong go player. Follows traditional strategy",
		price: 250,
		shoppable: true,
		ai_key: 36,
		category: ["companion"],
		dropchance: 15,
	},
	{
		title: "Danielle",
		image: "img/other_dean.webp",
		description: "A decently strong go player. Follows new age strategy",
		price: 250,
		shoppable: true,
		ai_key: 48,
		category: ["companion"],
		dropchance: 10,
	},
	{
		title: "Slate & Shell Stones",
		image: "wgo/white_128.png",
		description: "Set of polished white Go stones.",
		price: 500,
		shoppable: true,
		category: ["stones", "featured"],
		dropchance: 1000,
	},
	{
		title: "New Yunzi Stones",
		stoneHandler: newYunziHandler,
		description: "Set of high quality yunzi stones.",
		price: 50,
		shoppable: true,
		category: ["stones", "featured"],
		dropchance: 1000,
	},
	{
		title: "Ancient Yunzi Stones",
		stoneHandler: oldYunziHandler,
		description: "Set of high quality yunzi stones.",
		price: 500,
		shoppable: false,
		category: ["stones", "featured"],
		dropchance: 1000,
	},
	{
		title: "Painted Stones",
		stoneHandler: WGo.Board.drawHandlers.PAINTED,
		description: "",
		price: 50,
		shoppable: false,
		category: ["stones"],
		dropchance: 20,
	},
	{
		title: "Monochrome Stones",
		stoneHandler: WGo.Board.drawHandlers.MONO,
		description: "Minimalist monochrome Go stones with a soft tone.",
		price: 40,
		shoppable: true,
		category: ["stones"],
		dropchance: 500,
	},
	{
		title: "Glowing Stones",
		stoneHandler: WGo.Board.drawHandlers.GLOW,
		description: "Special stones with a soft glowing effect.",
		price: 100,
		shoppable: true,
		category: ["stones"],
		dropchance: 100,
	},
	{
		title: "Meijin Title Game",
		description: "Meijin title Game 1976",
		image: "wgo/black_128.png",
		price: 100,
		shoppable: true,
		category: ["sgf"],
		dropchance: 100,
		sgf: "SGF/Mei-1976-1.sgf",
	},
];

// ability to purchase game SGF demos

function renderInventory() {
    document.getElementById("profile-currency").textContent = getCurrency();
    const inventoryContainer = document.getElementById("inventory-items");

    // Clear existing inventory cards
    inventoryContainer.innerHTML = "";

    // Get the user's inventory
    const inventory = getInventory();

    if (inventory.length === 0) {
        inventoryContainer.innerHTML = `
            <p class="text-center text-gray-500">Your inventory is empty. Start shopping to add items!</p>
        `;
        return;
    }

    // Generate item cards for each inventory item
    inventory.forEach((item) => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow-lg p-4 flex flex-col items-center";

        // Create the container for the image or WGo board
        const displayContainer = document.createElement("div");
        displayContainer.className = "w-full h-40 flex justify-center items-center mb-4";

        if (item.category.includes("sgf")) {
            // Create an image element for SGF preview
            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.title;
            img.className = "w-full h-40 object-contain rounded-md";
            displayContainer.appendChild(img);

            // Create title, description, and price section
            const details = document.createElement("div");
            details.className = "text-center mt-2";
            details.innerHTML = `
                <h2 class="text-lg font-bold mb-1">${item.title}</h2>
                <p class="text-gray-700 mb-2">${item.description}</p>
                <div class="text-lg font-semibold mb-2">Quantity: ${item.quantity}</div>
                <div class="text-sm text-gray-500">Price: $${item.price}</div>
            `;

            // Create button container
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "flex gap-2 mt-3";

            // Create Review Button
            const reviewButton = document.createElement("button");
            reviewButton.className = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition";
            reviewButton.textContent = "Review";
            reviewButton.onclick = () => reviewGame(item.sgf);

            // Create Sell Button
            const sellButton = document.createElement("button");
            sellButton.className = "sell-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition";
            sellButton.textContent = `Sell for $${(item.price / 2).toFixed(2)}`;
            sellButton.setAttribute("data-item-title", item.title);
            sellButton.setAttribute("data-item-price", item.price);
            buttonContainer.appendChild(sellButton);
            buttonContainer.appendChild(reviewButton);


            // Append elements in proper order
            card.appendChild(displayContainer);
            card.appendChild(details);
            card.appendChild(buttonContainer);
        } else {
            if (item.category.includes("stones") && !item.title.includes("Shell")) {
                // Create a 1x1 WGo.js board
                const boardDiv = document.createElement("div");
                boardDiv.style.width = "80px";
                boardDiv.style.height = "80px";

                displayContainer.appendChild(boardDiv);

                let stone_handler_temp = null;
                for (const i of ALL_ITEMS) {
                    if (i.title === item.title) {
                        stone_handler_temp = i.stoneHandler;
                    }
                }

                // Initialize the WGo board
                setTimeout(() => {
                    const board = new WGo.Board(boardDiv, {
                        size: 2, 
                        width: 128,
                        stoneHandler: stone_handler_temp,
                    });

                    // Add stones to the board
                    board.addObject({ x: 0, y: 0, c: WGo.B });
                    board.addObject({ x: 1, y: 1, c: WGo.W });
                }, 0);
            } else {
                // Create an image element for non-stone items
                const img = document.createElement("img");
                img.src = item.image;
                img.alt = item.title;
                img.className = "w-full h-40 object-contain rounded-md";
                displayContainer.appendChild(img);
            }

            card.innerHTML = `
                <h2 class="text-lg font-bold mb-2">${item.title}</h2>
                <p class="text-gray-700 mb-4 text-center">${item.description}</p>
                <span class="text-lg font-semibold mb-2">Quantity: ${item.quantity}</span>
                <span class="text-sm text-gray-500 mb-4">Price: $${item.price}</span>
                <div class="flex gap-4">
                    <button 
                        class="sell-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        data-item-title="${item.title}"
                        data-item-price="${item.price}"
                    >
                        Sell for $${(item.price / 2).toFixed(2)}
                    </button>
                    <button 
                        class="equip-button px-4 py-2 ${item.equipped ? "bg-green-500 text-white" : "bg-gray-500 text-white hover:bg-gray-600"} rounded transition"
                        data-item-title="${item.title}"
                    >
                        ${item.equipped ? "Equipped" : "Equip"}
                    </button>
                </div>
            `;

            // Insert the displayContainer at the top of the card **ONLY if it has content**
            if (displayContainer.hasChildNodes()) {
                card.insertBefore(displayContainer, card.firstChild);
            }
        }

        // Append the card to the inventory container
        inventoryContainer.appendChild(card);
    });

	// Add event listeners to the "Sell" buttons
	const sellButtons = inventoryContainer.querySelectorAll(".sell-button");
	sellButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const itemTitle = button.getAttribute("data-item-title");
			const itemPrice = parseInt(button.getAttribute("data-item-price"), 10);

			// Remove item from inventory
			const inventory = getInventory();
			const itemIndex = inventory.findIndex((i) => i.title === itemTitle);

			if (itemIndex > -1) {
				// Reduce quantity or remove the item entirely
				const item = inventory[itemIndex];
				if (item.quantity > 1) {
					item.quantity -= 1;
				} else {
					inventory.splice(itemIndex, 1);
				}

				// Refund half the price to the user
				adjustCurrency(itemPrice / 2);

				// Save updated inventory back to localStorage
				localStorage.setItem("inventory", JSON.stringify(inventory));

				// Re-render the inventory to reflect changes
				renderInventory();
			}
		});
	});

	// Add event listeners to the "Equip" buttons
	const equipButtons = inventoryContainer.querySelectorAll(".equip-button");
	equipButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const itemTitle = button.getAttribute("data-item-title");

			// Get inventory and update equipped state
			const inventory = getInventory();

			// Find the selected item and its category
			const selectedItem = inventory.find((item) => item.title === itemTitle);
			if (!selectedItem) {
				console.error(`Item "${itemTitle}" not found in inventory.`);
				return;
			}
			const selectedCategory = selectedItem.category;

			// Update equipped state: only one item per category can be equipped
			inventory.forEach((item) => {
				if (item.category.some((cat) => selectedCategory.includes(cat))) {
					// Unequip all items in the same category
					item.equipped = false;
				}
			});

			// Equip the selected item
			selectedItem.equipped = true;

			// Save updated inventory back to localStorage
			localStorage.setItem("inventory", JSON.stringify(inventory));

			// Re-render the inventory to reflect changes
			renderInventory();
		});
	});
}
