/**
 * Starts the json-server mock API on the port of the URL the frontend calls.
 *
 * The port is read from VITE_LEARNING_PLATFORM_API_URL in .env.development and,
 * when present, .env.development.local (which overrides it, as in Vite). This way
 * a local override such as http://localhost:3100/api/v1 also moves the mock server,
 * and `npm run server` never listens on a different port than the app expects.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const DEFAULT_PORT = 3000;

/**
 * @param {string} file - Path of a dotenv file.
 * @returns {Object<string, string>} Variables defined in the file (empty when missing).
 */
function readEnvFile(file) {
    if (!fs.existsSync(file)) return {};
    const vars = {};
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*?)"?\s*$/);
        if (match) vars[match[1]] = match[2];
    }
    return vars;
}

/** @returns {number} Port of the API URL configured for development. */
function resolvePort() {
    const env = {
        ...readEnvFile(path.join(projectRoot, '.env.development')),
        ...readEnvFile(path.join(projectRoot, '.env.development.local'))
    };
    try {
        const port = Number(new URL(env.VITE_LEARNING_PLATFORM_API_URL).port);
        return port || DEFAULT_PORT;
    } catch {
        return DEFAULT_PORT;
    }
}

const port = String(process.env.PORT || resolvePort());
const jsonServerCli = require.resolve('json-server/lib/cli/bin.js');
const args = [
    jsonServerCli,
    path.join(__dirname, 'db.cjs'),
    '--routes', path.join(__dirname, 'routes.json'),
    '--middlewares', path.join(__dirname, 'middleware.cjs'),
    '--port', port
];

console.log(`Vigía mock API -> http://localhost:${port}/api/v1`);
const child = spawn(process.execPath, args, { stdio: 'inherit' });
child.on('exit', code => process.exit(code ?? 0));
