

function initshop() {
    // JSON data for shop items with categories as arrays

    const shopItems = []
    for(let item of ALL_ITEMS){
        if(item.shoppable){
            shopItems.push(item)
        }
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
        const filteredItems = category === "featured"
            ? shopItems // Show all items for "featured"
            : shopItems.filter(item => item.category.includes(category));
    
        // Generate shop item cards for the filtered items
        filteredItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "bg-white rounded-lg shadow-lg p-4 flex flex-col items-center";
    
            // Check if the user can afford the item
            let canAfford = userCurrency >= item.price;
    
            card.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="w-full h-40 object-cover rounded-md mb-4">
                <h2 class="text-lg font-bold mb-2">${item.title}</h2>
                <p class="text-gray-700 mb-4 text-center">${item.description}</p>
                <span class="text-lg font-semibold mb-4">$${item.price}</span>
                <button 
                    class="buy-button px-4 py-2 rounded ${canAfford ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"} transition"
                    ${canAfford ? "" : "disabled"}
                    data-item-title="${item.title}" 
                    data-item-price="${item.price}"
                >
                    ${canAfford ? "Buy Now" : "Can't Afford"}
                </button>
            `;
    
            shopContainer.appendChild(card);
        });
    
        // Add event listeners to the "Buy Now" buttons
        const buyButtons = shopContainer.querySelectorAll(".buy-button");
        buyButtons.forEach(button => {
            button.addEventListener("click", () => {
                const itemTitle = button.getAttribute("data-item-title");
                const itemPrice = parseInt(button.getAttribute("data-item-price"), 10);
    
                // Deduct currency
                userCurrency = adjustCurrency(-itemPrice);
    
                // Add item to inventory
                addToInventory(itemTitle, 1);

                showToast(`Bought ${itemTitle}!`)
    
                // Re-render items to update the buttons' states
                renderItems(category);
            });
        });
    }
    

    // Event listener for category selection
    categorySelector.addEventListener("click", (e) => {
        const category = e.target.getAttribute("data-category");
        if (category) {
            renderItems(category);
        }
        try {
            document.getElementById("shoptitle").textContent = "Shop - " + properCase(category)
        } catch (e) {
            console.log(e)
        }
    });

    // Default to the "featured" category
    renderItems("featured");
}
