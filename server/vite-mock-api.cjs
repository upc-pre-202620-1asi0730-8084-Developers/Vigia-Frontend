/**
 * Vite plugin that serves the json-server mock API from the Vite dev server itself,
 * under /api/v1, so `npm run dev` is enough to run the app with its data (no second
 * process and no port to keep in sync). It reuses the same dataset (db.cjs), route
 * rewrites (routes.json) and business-rule middleware (middleware.cjs) as `npm run server`.
 * Data changes stay in memory until the dev server restarts.
 */
const jsonServer = require('json-server');
const loadDatabase = require('./db.cjs');
const routes = require('./routes.json');
const businessRules = require('./middleware.cjs');

const API_PREFIX = '/api/v1';

function createMockApi() {
    const app = jsonServer.create();
    const router = jsonServer.router(loadDatabase());
    app.db = router.db;
    // Same origin as the app: no CORS or static files needed, only JSON bodies.
    app.use(jsonServer.bodyParser);
    app.use(jsonServer.rewriter(routes));
    app.use(businessRules);
    app.use(router);
    return app;
}

/** @returns {import('vite').Plugin} */
module.exports = function vigiaMockApi() {
    return {
        name: 'vigia-mock-api',
        apply: 'serve',
        configureServer(server) {
            const app = createMockApi();
            server.middlewares.use((req, res, next) => {
                if (req.url === API_PREFIX || req.url.startsWith(`${API_PREFIX}/`) || req.url.startsWith(`${API_PREFIX}?`)) {
                    return app(req, res, next);
                }
                next();
            });
            server.config.logger.info(`  Vigía mock API: ${API_PREFIX} (json-server, server/data)`);
        }
    };
};
