/**
 * In-browser mock API used when the app is deployed as static files (Firebase Hosting),
 * where json-server is not available. It mirrors `npm run server`: the same dataset
 * (server/data), route rewrites (server/routes.json) and business rules
 * (server/middleware.cjs), plus a json-server-like REST router. Data lives in memory
 * and is reset when the page reloads.
 *
 * Loaded on demand by BaseApi only when VITE_USE_IN_MEMORY_API is "true".
 */
import {AxiosError} from "axios";
import routes from "../../../server/routes.json";
import businessRules from "../../../server/middleware.cjs";

const datasetFiles = import.meta.glob('../../../server/data/**/*.json', {eager: true, import: 'default'});

const toCamelCase = name => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const clone = value => (value === undefined ? value : JSON.parse(JSON.stringify(value)));

/** Builds the in-memory database with the same collection keys as server/db.cjs. */
function createDatabase() {
    let state = {};
    for (const [file, records] of Object.entries(datasetFiles)) {
        const key = toCamelCase(file.split('/').pop().replace(/\.json$/, ''));
        state[key] = clone(records);
    }
    return {
        getState: () => state,
        setState: next => { state = next; },
        write: () => {}
    };
}

const db = createDatabase();

/** Route rewrites from server/routes.json, applied in order like express-urlrewrite. */
const rewriteRules = Object.entries(routes).map(([from, to]) => ({
    pattern: new RegExp(`^${from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '(.*)')}$`),
    to
}));

function rewrite(path) {
    return rewriteRules.reduce((current, rule) => {
        const match = current.match(rule.pattern);
        return match ? rule.to.replace(/\$(\d)/g, (_, i) => match[Number(i)] ?? '') : current;
    }, path);
}

/** json-server-like REST router over the in-memory collections. */
function restRouter(method, path, query, body) {
    const [, collectionName, id] = path.split('/');
    const state = db.getState();
    const collection = state[collectionName];
    if (!Array.isArray(collection)) return {status: 404, data: {}};

    const indexOf = recordId => collection.findIndex(r => String(r.id) === String(recordId));

    if (method === 'GET' && !id) {
        const filters = Object.entries(query).filter(([key]) => !key.startsWith('_'));
        const result = collection.filter(r => filters.every(([key, value]) => String(r[key]) === String(value)));
        return {status: 200, data: clone(result)};
    }
    if (method === 'POST' && !id) {
        const numericIds = collection.length > 0 && collection.every(r => typeof r.id === 'number');
        const newId = body?.id ?? (numericIds ? Math.max(...collection.map(r => r.id)) + 1 : Math.random().toString(36).slice(2, 9));
        const record = {...body, id: newId};
        collection.push(record);
        return {status: 201, data: clone(record)};
    }

    const index = indexOf(id);
    if (index === -1) return {status: 404, data: {}};
    switch (method) {
        case 'GET':
            return {status: 200, data: clone(collection[index])};
        case 'PUT':
            collection[index] = {...body, id: collection[index].id};
            return {status: 200, data: clone(collection[index])};
        case 'PATCH':
            collection[index] = {...collection[index], ...body, id: collection[index].id};
            return {status: 200, data: clone(collection[index])};
        case 'DELETE':
            collection.splice(index, 1);
            return {status: 200, data: {}};
        default:
            return {status: 405, data: {}};
    }
}

/** Runs server/middleware.cjs; resolves with its response, or null when it calls next(). */
function runBusinessRules(req) {
    return new Promise(resolve => {
        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { resolve({status: this.statusCode, data: clone(data)}); return this; },
            send(data) { return this.json(data); },
            end() { return this.json({}); }
        };
        businessRules(req, res, () => resolve(null));
    });
}

/**
 * Axios adapter that answers requests from the in-memory API.
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function inMemoryAdapter(config) {
    const fullUrl = /^https?:/.test(config.url) ? config.url : `${(config.baseURL || '').replace(/\/$/, '')}${config.url}`;
    const [requestPath, rawQuery = ''] = fullUrl.replace(/^https?:\/\/[^/]+/, '').split('?');
    const query = {...Object.fromEntries(new URLSearchParams(rawQuery)), ...(config.params || {})};
    const method = (config.method || 'get').toUpperCase();
    const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : (config.data || {});

    const path = rewrite(requestPath);
    const req = {method, url: path, path, body, query, params: {}, app: {db}};

    const result = (await runBusinessRules(req)) ?? restRouter(method, req.path.replace(/\/+$/, ''), query, body);
    const response = {data: result.data, status: result.status, statusText: '', headers: {'content-type': 'application/json'}, config, request: {}};

    if (result.status >= 400) {
        throw new AxiosError(`Request failed with status code ${result.status}`,
            result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, null, response);
    }
    return response;
}
