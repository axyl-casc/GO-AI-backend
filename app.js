const { SqlConnection } = require('./sql_connection');
const { trainingGame } = require('./train_database');

const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
const path = require('path');


const express = require('express');

const sql = new SqlConnection("./AI_Data.db")

const generateAiTable = async (dbConnection, boardSize) => {
    const sql = `SELECT path, level_${boardSize} FROM AI;`;

    let rows;
    try {
        // Fetch multiple rows (default behavior, as `single` is false)
        rows = await dbConnection._send(sql, { single: false });
        console.log(rows); // Will log an array of rows
    } catch (err) {
        console.error("Error fetching data from the database:", err);
        throw err;
    }
    

    if (!Array.isArray(rows)) {
        throw new Error("Query result is not an array.");
    }

    // Start constructing the HTML
    let html = `
    <html>
    <head>
        <style>
            table {
                border-collapse: collapse;
                width: 100%;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                cursor: pointer;
                background-color: #f2f2f2;
            }
        </style>
        <script>
function sortTable(n) {
    const table = document.getElementById("aiTable");
    let rows, switching, i, x, y, shouldSwitch, dir, switchCount = 0;
    switching = true;
    dir = "asc"; // Set the sorting direction to ascending

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            const xKey = x.getAttribute("data-key") ? parseFloat(x.getAttribute("data-key")) : x.innerHTML.toLowerCase();
            const yKey = y.getAttribute("data-key") ? parseFloat(y.getAttribute("data-key")) : y.innerHTML.toLowerCase();

            if (dir === "asc") {
                if (xKey > yKey) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (xKey < yKey) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchCount++;
        } else {
            if (switchCount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}
        </script>
    </head>
    <body>
        <table id="aiTable">
            <thead>
                <tr>
                    <th onclick="sortTable(0)">Path</th>
                    <th onclick="sortTable(1)">Converted Rank</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Add rows to the table
    rows.forEach(row => {
        const path = row.path;
        const rank = row[`level_${boardSize}`];
        const convertedRank = convertLevelToKyuDan(rank); // Implement this function
        html += `<tr><td>${path}</td><td data-key="${rank}">${convertedRank}</td></tr>\n`;
    });

    // Close the table and HTML structure
    html += `
            </tbody>
        </table>
    
    <script>
        sortTable(1);
        sortTable(1);
        // Timer to refresh the page every 10 minutes
setTimeout(() => {
    location.reload(); // Reload the webpage
}, 600000); // 600,000 milliseconds = 10 minutes

    </script>

    </body>
    </html>
    `;

    return html;
};


// Express server setup
const app = express();
const PORT = 3001;

// Route to serve the AI table
app.get('/ai-table', async (req, res) => {
    const boardSize = parseInt(req.query.boardsize) || 19; // Default to 19 if not provided

    try {
        const html = await generateAiTable(sql, boardSize);
        res.send(html);
    } catch (error) {
        res.status(500).send("Error generating AI table.<br>"+error);
    }
});


// for training games in the database
async function task() {
    try {
        console.log(`Training game started at ${new Date().toISOString()}`);
        await trainingGame(sql, 13); // Run training game
        console.log(`Training game completed at ${new Date().toISOString()}`);
    } catch (error) {
        console.error(`Error during training game: ${error.message}`);
    } finally {
        // Schedule the next execution 1 minute after the current one completes
        setTimeout(task, 60 * 1000);
    }
}

// Start the first task
task();

app.use(express.static(path.join(__dirname, 'public')));


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = generateAiTable;






