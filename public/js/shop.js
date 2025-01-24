
document.addEventListener("DOMContentLoaded", () => {
    // JSON data for shop items
    const shopItems = [
        {
            title: "Go Board",
            image: "path/to/go-board.jpg",
            description: "High-quality wooden Go board with grid markings.",
            price: 50,
        },
        {
            title: "Go Stones",
            image: "path/to/go-stones.jpg",
            description: "Set of polished black and white Go stones.",
            price: 30,
        },
        {
            title: "Beginner's Guide to Go",
            image: "path/to/go-guide.jpg",
            description: "A comprehensive guide for beginners to learn Go.",
            price: 15,
        },
    ];

    const shopContainer = document.getElementById("shop-items");
    const currencyContainer = document.getElementById("currency");

    // Display user's currency
    const userCurrency = getCurrency();
    currencyContainer.textContent = `Your Balance: $${userCurrency}`;

    // Generate shop item cards
    shopItems.forEach(item => {
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
                class="px-4 py-2 rounded ${
                    canAfford ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                } transition"
                ${canAfford ? "" : "disabled"}
            >
                ${canAfford ? "Buy Now" : "Can't Afford"}
            </button>
        `;

        shopContainer.appendChild(card);
    });
});
