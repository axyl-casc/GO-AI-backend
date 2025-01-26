const ALL_ITEMS = [
    {
        title: "Go Board",
        image: "img/image.png",
        description: "High-quality wooden Go board with grid markings.",
        price: 50,
        shoppable: true,
        category: ["boards", "featured"],
    },
    {
        title: "Sai",
        image: "img/image.png",
        description: "The SAI himself!",
        price: 500,
        shoppable: true,
        ai_key:34, // 1800s ai
        category: ["featured", "companion"],
    },
    {
        title: "Baby Go Bot",
        image: "img/image.png",
        description: "Humble Beginnings!",
        price: 10,
        shoppable: true,
        ai_key:38, //20k
        category: ["companion"],
    },
    {
        title: "A",
        image: "img/image.png",
        description: "It a me!",
        price: 50,
        shoppable: true,
        ai_key:63,
        category: ["companion"],
    },
    {
        title: "Shell Stones",
        image: "img/image.png",
        description: "Set of polished white Go stones.",
        price: 30,
        shoppable: true,
        category: ["stones", "featured"],
    },
    {
        title: "Slate Stones",
        image: "img/image.png",
        description: "Set of polished black Go stones.",
        price: 30,
        shoppable: true,
        category: ["stones", "featured"],
    },
    {
        title: "Beginner's Guide to Go",
        image: "img/image.png",
        description: "A comprehensive guide for beginners to learn Go.",
        price: 15,
        shoppable: true,
        category: ["featured"],
    },
];

function renderInventory() {
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
    inventory.forEach(item => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow-lg p-4 flex flex-col items-center";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="w-full h-40 object-cover rounded-md mb-4">
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

        inventoryContainer.appendChild(card);
    });

    // Add event listeners to the "Sell" buttons
    const sellButtons = inventoryContainer.querySelectorAll(".sell-button");
    sellButtons.forEach(button => {
        button.addEventListener("click", () => {
            const itemTitle = button.getAttribute("data-item-title");
            const itemPrice = parseInt(button.getAttribute("data-item-price"), 10);

            // Remove item from inventory
            const inventory = getInventory();
            const itemIndex = inventory.findIndex(i => i.title === itemTitle);

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
equipButtons.forEach(button => {
    button.addEventListener("click", () => {
        const itemTitle = button.getAttribute("data-item-title");

        // Get inventory and update equipped state
        const inventory = getInventory();

        // Find the selected item and its category
        const selectedItem = inventory.find(item => item.title === itemTitle);
        if (!selectedItem) {
            console.error(`Item "${itemTitle}" not found in inventory.`);
            return;
        }
        const selectedCategory = selectedItem.category;

        // Update equipped state: only one item per category can be equipped
        inventory.forEach(item => {
            if (item.category.some(cat => selectedCategory.includes(cat))) {
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


