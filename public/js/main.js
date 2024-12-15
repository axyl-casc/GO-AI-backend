document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('[data-tab]');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            // Hide all content and remove active state from tabs
            contents.forEach(content => content.classList.add('hidden'));
            tabs.forEach(t => t.classList.remove('border-b-4', 'border-badukAccent'));

            // Show selected content and highlight tab
            document.getElementById(targetTab).classList.remove('hidden');
            tab.classList.add('border-b-4', 'border-badukAccent');
            window.dispatchEvent(new Event('resize'));

        });
    });

    const selectors = document.getElementById('selectors');
    const wgoBoardDiv = document.getElementById('wgoBoard');
    const startGameButton = document.getElementById('startGame');
    const newGameButton = document.getElementById('newGame');
    const boardContainer = document.getElementById('boardContainer');
    let board = null;
    let boardSize = parseInt(document.getElementById('boardSize').value, 10);
    const rankSelector = document.getElementById('rankSelector')

    document.getElementById('boardSize').addEventListener("change", () => {
        rankSelector.classList.remove('hidden');
    })
    rankSelector.addEventListener("change", () => {
        startGameButton.classList.remove('hidden');
    })
    // Start Game
    startGameButton.addEventListener('click', () => {
        boardSize = parseInt(document.getElementById('boardSize').value, 10)

        // Hide selectors and show WGo.js board
        selectors.classList.add('hidden');
        wgoBoardDiv.classList.remove('hidden');
        // Initialize WGo.js Board
        boardContainer.innerHTML = "";
        board = new WGo.Board(boardContainer, {
            width: 800,
            height: 800,
            size: boardSize,
        });
    });

    // New Game
    newGameButton.addEventListener('click', () => {
        wgoBoardDiv.classList.add('hidden');
        selectors.classList.remove('hidden');
        document.getElementById('playerRank').value = ""
        document.getElementById('boardSize').value = null
        startGameButton.classList.add('hidden');
        rankSelector.classList.add('hidden');
    });
});