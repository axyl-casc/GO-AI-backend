
// Function to equip an item and unequip others in the same category (excluding "featured")
function equipItem(selectedItem, inventory) {
	if (!selectedItem) return; // If no item is selected, do nothing

	// Get the categories of the selected item (excluding "featured")
	const categoriesToCheck = selectedItem.category.filter(
		(cat) => cat !== "featured",
	);

	// Unequip all items in the same categories (excluding "featured")
	inventory.forEach((item) => {
		if (
			item !== selectedItem && // Don't unequip the selected item
			item.category.some((cat) => categoriesToCheck.includes(cat)) // Check if the item shares any category
		) {
			item.equipped = false; // Unequip the item
		}
	});

	// Equip the selected item
	selectedItem.equipped = true;
}

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
		card.className =
			"bg-white rounded-lg shadow-lg p-4 flex flex-col items-center";

		// Create the container for the image or WGo board
		const displayContainer = document.createElement("div");
		displayContainer.className =
			"w-full h-40 flex justify-center items-center mb-4";

		if (item.category.includes("games") || item.category.includes("documents")) {
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
			reviewButton.className =
				"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition";
			reviewButton.textContent = "View";
			if(item.category.includes("documents")){
				reviewButton.onclick = () => window.open(item.pdf, '_blank')
			}else if(item.category.includes("games")){
				reviewButton.onclick = () => reviewGame(item.sgf);
			}
			
			// Create Sell Button
			const sellButton = document.createElement("button");
			sellButton.className =
				"sell-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition";
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
        <span class="default-text">${item.equipped ? "Equipped" : "Equip"}</span>
        <span class="hover-text">${item.equipped ? "Unequip" : "Equip"}</span>
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
				showToast(`Sold ${item.title} for $${itemPrice / 2}`)
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
			const inventory = getInventory();
			const selectedItem = inventory.find((item) => item.title === itemTitle);

			if (!selectedItem) {
				console.error(`Item "${itemTitle}" not found in inventory.`);
				return;
			}

			// Toggle equipped state
			if (selectedItem.equipped) {
				// Directly unequip if already equipped
				selectedItem.equipped = false;
			} else {
				// Equip this item and unequip others in category
				equipItem(selectedItem, inventory);
			}

			localStorage.setItem("inventory", JSON.stringify(inventory));
			renderInventory();
		});
	});
}
