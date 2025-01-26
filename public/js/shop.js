function initshop() {
    // JSON data for shop items with categories as arrays
    const shopItems = [
        {
            title: "Go Board",
            image: "img/image.png",
            description: "High-quality wooden Go board with grid markings.",
            price: 50,
            category: ["boards", "featured"],
        },
        {
            title: "Sai",
            image: "img/image.png",
            description: "The SAI himself!",
            price: 50,
            ai_key:34,
            category: ["featured", "companion"],
        },
        {
            title: "Shell Stones",
            image: "img/image.png",
            description: "Set of polished white Go stones.",
            price: 30,
            category: ["stones", "featured"],
        },
        {
            title: "Slate Stones",
            image: "img/image.png",
            description: "Set of polished black Go stones.",
            price: 30,
            category: ["stones", "featured"],
        },
        {
            title: "Beginner's Guide to Go",
            image: "img/image.png",
            description: "A comprehensive guide for beginners to learn Go.",
            price: 15,
            category: ["featured"],
        },
    ];

    const shopContainer = document.getElementById("shop-items");
    const currencyContainer = document.getElementById("currency");
    const categorySelector = document.getElementById("category-selector");

    // Display user's currency
    const userCurrency = getCurrency();
    currencyContainer.textContent = `Your Balance: $${userCurrency}`;

    // Function to render items by category
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
            const canAfford = userCurrency >= item.price;

            card.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="w-full h-40 object-cover rounded-md mb-4">
                <h2 class="text-lg font-bold mb-2">${item.title}</h2>
                <p class="text-gray-700 mb-4 text-center">${item.description}</p>
                <span class="text-lg font-semibold mb-4">$${item.price}</span>
                <button 
                    class="px-4 py-2 rounded ${canAfford ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                } transition"
                    ${canAfford ? "" : "disabled"}
                >
                    ${canAfford ? "Buy Now" : "Can't Afford"}
                </button>
            `;

            shopContainer.appendChild(card);
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
