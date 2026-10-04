const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, 'db.json');

function readDb(req) {
    if (req && req.app && req.app.db) {
        return req.app.db.getState();
    }
    try {
        const raw = fs.readFileSync(dbFilePath, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return { vehicles: [], geofences: [], unassociatedTelemetryEvents: [] };
    }
}

function persistDb(req, data) {
    if (req && req.app && req.app.db) {
        req.app.db.setState(data);
        req.app.db.write();
        return;
    }
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Error escribiendo db.json:', e);
    }
}

module.exports = function(req, res, next) {
    const rawPath = (req.path || req.url || '').split('?')[0];
    const normalizedPath = rawPath.replace(/\/+$/, '') || '/';
    const method = req.method;

    // Normalizar detección de rutas para json-server
    const isVehiclesPost = method === 'POST' && (normalizedPath === '/vehicles' || normalizedPath === '/api/v1/vehicles');
    const isPairingPost = method === 'POST' && normalizedPath.match(/^\/(?:api\/v1\/)?vehicles\/([^/]+)\/gps-device$/);
    const isGeofencesPost = method === 'POST' && (normalizedPath === '/geofences' || normalizedPath === '/api/v1/geofences');
    const isTelemetryPost = method === 'POST' && (normalizedPath === '/telemetry/reports' || normalizedPath === '/api/v1/telemetry/reports');

    // 1. Validar registro de vehículo (US-18: Placa duplicada)
    if (isVehiclesPost) {
        const db = readDb(req);
        const body = req.body || {};
        const plate = String(body.licensePlate || '').trim().toUpperCase().replace(/\s+/g, '');

        if (!plate) {
            return res.status(400).json({
                code: 'PLATE_REQUIRED',
                message: 'Ingresa la placa de la unidad.'
            });
        }

        const existing = (db.vehicles || []).find(v =>
            String(v.licensePlate || '').trim().toUpperCase().replace(/\s+/g, '') === plate
        );

        if (existing) {
            return res.status(409).json({
                code: 'PLATE_ALREADY_REGISTERED',
                title: 'Conflicto de placa vehicular',
                message: `Ya existe una unidad registrada con la placa ${plate}.`,
                plate: plate
            });
        }
    }

    // 2. Validar vinculación GPS (US-18: Dispositivo ya asignado a otra unidad)
    if (isPairingPost) {
        const vehicleId = isPairingPost[1];
        const db = readDb(req);
        const body = req.body || {};
        const deviceId = String(body.gpsDeviceId || '').trim();

        if (!deviceId) {
            return res.status(400).json({
                code: 'DEVICE_ID_REQUIRED',
                message: 'Ingresa el ID del dispositivo GPS.'
            });
        }

        // Buscar si otra unidad distinta ya tiene asignado este dispositivo GPS
        const conflictingVehicle = (db.vehicles || []).find(v =>
            String(v.gpsDeviceId || '').trim() === deviceId && String(v.id) !== String(vehicleId)
        );

        if (conflictingVehicle) {
            return res.status(409).json({
                code: 'DEVICE_ALREADY_ASSIGNED',
                title: 'Dispositivo GPS ya asignado',
                message: `El dispositivo ${deviceId} ya está vinculado a la unidad ${conflictingVehicle.licensePlate}. Ingresa otro dispositivo.`,
                deviceId: deviceId,
                assignedLicensePlate: conflictingVehicle.licensePlate
            });
        }

        // Si no está asignado, vincular al vehículo actual en la base de datos
        const vehicleIndex = (db.vehicles || []).findIndex(v => String(v.id) === String(vehicleId));
        if (vehicleIndex !== -1) {
            db.vehicles[vehicleIndex].gpsDeviceId = deviceId;
            persistDb(req, db);
            return res.status(200).json(db.vehicles[vehicleIndex]);
        } else {
            return res.status(404).json({
                code: 'VEHICLE_NOT_FOUND',
                message: 'Unidad de transporte no encontrada.'
            });
        }
    }

    // 3. Validar definición de geocerca (US-19: una geocerca por predio y empresa)
    if (isGeofencesPost) {
        const db = readDb(req);
        const body = req.body || {};
        const siteId = String(body.siteId || '').trim();
        const companyId = String(body.companyId || '').trim();

        const existing = (db.geofences || []).find(g =>
            String(g.siteId || '').trim() === siteId && String(g.companyId || '').trim() === companyId
        );

        if (existing) {
            return res.status(409).json({
                code: 'SITE_ALREADY_HAS_GEOFENCE',
                title: 'Predio con geocerca existente',
                message: 'Este predio ya tiene una geocerca definida.',
                siteId: siteId
            });
        }
    }

    // 4. Ingesta de telemetría (TS-08: responder 200 y registrar evento no asociado si no está vinculado)
    if (isTelemetryPost) {
        const db = readDb(req);
        const body = req.body || {};
        const deviceId = String(body.gpsDeviceId || '').trim();

        const matchedVehicle = (db.vehicles || []).find(v =>
            String(v.gpsDeviceId || '').trim() === deviceId
        );

        if (matchedVehicle) {
            matchedVehicle.currentPos = {
                latitude: Number(body.latitude),
                longitude: Number(body.longitude)
            };
            persistDb(req, db);
            return res.status(200).send();
        } else {
            // Descartar y registrar como evento no asociado (§4.3, TS-08)
            const unassociatedEvent = {
                id: Date.now(),
                gpsDeviceId: deviceId,
                latitude: body.latitude,
                longitude: body.longitude,
                timestamp: body.timestamp || new Date().toISOString(),
                registeredAt: new Date().toISOString(),
                type: 'UNASSOCIATED_TELEMETRY_EVENT'
            };
            if (!db.unassociatedTelemetryEvents) {
                db.unassociatedTelemetryEvents = [];
            }
            db.unassociatedTelemetryEvents.push(unassociatedEvent);
            persistDb(req, db);
            return res.status(200).send();
        }
    }

    next();
};
