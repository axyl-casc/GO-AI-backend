const fs = require('fs');
const path = require('path');

const MAX_ADJUSTMENT = 3

class JSONDatabase {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = this.loadFile();
    }

    // Load JSON file into memory
    loadFile() {
        try {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        } catch (error) {
            console.error('Error loading file:', error);
            return {};
        }
    }

    // Save current state to file
    saveFile() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    }

    // Get the current values
    getValues() {
        return this.data;
    }

// Increment a field
increment(field) {
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (this.data.hasOwnProperty(field)) {
        if (this.data[field] < MAX_ADJUSTMENT) { // Prevent increasing beyond 10
            this.data[field]++;
            this.saveFile();
        }
        return { [field]: this.data[field] };
    }
    return { error: 'Invalid field' };
}

// Decrement a field
decrement(field) {
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (this.data.hasOwnProperty(field)) {
        if (this.data[field] > -MAX_ADJUSTMENT) { 
            this.data[field]--;
            this.saveFile();
        }
        return { [field]: this.data[field] };
    }
    return { error: 'Invalid field' };
}

}

module.exports = new JSONDatabase(path.join(__dirname, 'data', 'adjustments.json'));
