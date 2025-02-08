const fs = require('fs');
const path = require('path');

class JSONDatabase {
    constructor(directory) {
        this.directory = directory;
        this.data = {};

        // Load all JSON files into memory
        this.loadAllFiles();
    }

    // Load all JSON files into memory
    loadAllFiles() {
        const files = fs.readdirSync(this.directory);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(this.directory, file);
                const key = file.replace('.json', '');
                this.data[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
        });
        console.log('Database loaded:', Object.keys(this.data));
    }

    // Get data by collection name (e.g., users, feedback)
    get(collection) {
        return this.data[collection] || [];
    }

    // Add an item to a collection and save
    add(collection, item) {
        if (!this.data[collection]) this.data[collection] = [];
        this.data[collection].push(item);
        this.save(collection);
    }

    // Save a specific collection back to file
    save(collection) {
        const filePath = path.join(this.directory, `${collection}.json`);
        fs.writeFileSync(filePath, JSON.stringify(this.data[collection], null, 2), 'utf8');
    }
}

module.exports = new JSONDatabase(path.join(__dirname, 'data'));
