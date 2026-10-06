/**
 * Mock database for json-server.
 *
 * The dataset lives in server/data as one JSON file per collection, grouped by
 * bounded context (server/data/<bounded-context>/<collection>.json). Each file
 * holds an array of resources, and its kebab-case name becomes the camelCase
 * collection key (upcoming-arrivals.json -> upcomingArrivals).
 *
 * json-server loads this module on start and keeps the data in memory, so the
 * changes made while it runs are discarded on restart and the dataset files stay clean.
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const toCamelCase = name => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/**
 * @param {string} dir - Directory to scan recursively.
 * @returns {string[]} Absolute paths of the JSON files found.
 */
function findJsonFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return findJsonFiles(fullPath);
        return entry.name.endsWith('.json') ? [fullPath] : [];
    });
}

/**
 * Builds a fresh copy of the whole database from the dataset files.
 * @returns {Object<string, Array>} Collections keyed by name.
 */
function loadDatabase() {
    const db = {};
    for (const file of findJsonFiles(dataDir)) {
        const key = toCamelCase(path.basename(file, '.json'));
        if (key in db) throw new Error(`Duplicate collection "${key}" in ${path.relative(dataDir, file)}`);
        db[key] = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return db;
}

module.exports = loadDatabase;
