function initshop() {
	// JSON data for shop items with categories as arrays
	const shopItems = [];
	for (const item of ALL_ITEMS) {
		if (item.shoppable) {
			shopItems.push(item);
		}
	}
	const itemRotation =
		ALL_ITEMS[
			Math.floor(
				(new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000,
			) % ALL_ITEMS.length
		];
	console.log(`Item on Rotation => ${itemRotation.title}`);
	if (itemRotation.shoppable === false) {
		shopItems.push(itemRotation);
	}
	const shopContainer = document.getElementById("shop-items");
	const currencyContainer = document.getElementById("currency");
	const categorySelector = document.getElementById("category-selector");

	// Display user's currency
	let userCurrency = getCurrency();
	currencyContainer.textContent = `Your Balance: $${userCurrency}`;

	function renderItems(category) {
		// Clear existing items
		shopContainer.innerHTML = "";

		// Filter items based on the category
		const filteredItems = shopItems.filter((item) =>
			item.category.includes(category),
		);

		// Generate shop item cards for the filtered items
		filteredItems.forEach((item) => {
			const card = document.createElement("div");
			card.className =
				"bg-white rounded-lg shadow-lg p-4 flex flex-col items-center";
			userCurrency = getCurrency();
			currencyContainer.textContent = `Your Balance: $${userCurrency}`;

			// Check if the user can afford the item
			const canAfford = userCurrency >= item.price;

			// Create the container for the image or WGo board
			const displayContainer = document.createElement("div");
			displayContainer.className =
				"w-full h-40 flex justify-center items-center mb-4";

			if (item.category.includes("stones") && !item.title.includes("Shell")) {
				// Create a 1x1 WGo.js board
				const boardDiv = document.createElement("div");
				boardDiv.style.width = "80px"; // Adjust size
				boardDiv.style.height = "80px";

				// Append to display container
				displayContainer.appendChild(boardDiv);

				// Initialize the WGo board
				setTimeout(() => {
					// Use timeout to ensure element is in DOM
					const board = new WGo.Board(boardDiv, {
						width: 128,
						size: 2, // 1x1 board
						stoneHandler: item.stoneHandler, // Custom stone handler from item
					});

					// Add a stone at (0,0)
					board.addObject({
						x: 0,
						y: 0,
						c: WGo.B, // Default to black stone, change if needed
					});
					board.addObject({
						x: 1,
						y: 1,
						c: WGo.W, // Default to black stone, change if needed
					});
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
                <span class="text-lg font-semibold mb-4">$${item.price}</span>
                <button 
                    class="buy-button px-4 py-2 rounded ${
											canAfford
												? "bg-blue-500 text-white hover:bg-blue-600"
												: "bg-gray-300 text-gray-600 cursor-not-allowed"
										} transition"
                    ${canAfford ? "" : "disabled"}
                    data-item-title="${item.title}" 
                    data-item-price="${item.price}"
                >
                    ${canAfford ? "Purchase" : "Can't Afford"}
                </button>
            `;

			// Insert the displayContainer at the top of the card
			card.insertBefore(displayContainer, card.firstChild);

			shopContainer.appendChild(card);
		});

		// Add event listeners to the "Buy Now" buttons
		const buyButtons = shopContainer.querySelectorAll(".buy-button");
		buyButtons.forEach((button) => {
			button.addEventListener("click", () => {
				const itemTitle = button.getAttribute("data-item-title");
				const itemPrice = parseInt(button.getAttribute("data-item-price"), 10);

				// Deduct currency
				console.log(`Removed ${-itemPrice}`);
				userCurrency = adjustCurrency(-itemPrice);

				// Add item to inventory
				addToInventory(itemTitle, 1);

				showToast(`Bought ${itemTitle}!`);
				createParticles(10);

				// Re-render items to update the buttons' states
				renderItems(category);
			});
		});
	}

	// Updated event listener for category selection
	categorySelector.addEventListener("click", (e) => {
		// Find the closest parent <li> of the clicked element
		const liElement = e.target.closest("li");

		if (liElement) {
			// Find the span with data-category within the <li>
			const categorySpan = liElement.querySelector("span[data-category]");

			if (categorySpan) {
				const category = categorySpan.getAttribute("data-category");
				renderItems(category);

				try {
					document.getElementById("shoptitle").textContent =
						"Shop - " + properCase(category);
				} catch (e) {
					console.log(e);
				}
			}
		}
	});

	// Default to the "featured" category
	renderItems("featured");
}
