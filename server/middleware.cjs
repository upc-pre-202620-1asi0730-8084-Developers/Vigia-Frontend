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
        return { vehicles: [], geofences: [], unassociatedTelemetryEvents: [], receptions: [], upcomingArrivals: [] };
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

    // Rutas para BC-07 Site Reception and Verification
    const isReceptionsPost = method === 'POST' && (normalizedPath === '/receptions' || normalizedPath === '/api/v1/receptions');
    const isVerifyPost = method === 'POST' && normalizedPath.match(/^\/(?:api\/v1\/)?receptions\/([^/]+)\/verify$/);
    const isComparePost = method === 'POST' && normalizedPath.match(/^\/(?:api\/v1\/)?receptions\/([^/]+)\/compare$/);
    const isEvidencesPost = method === 'POST' && normalizedPath.match(/^\/(?:api\/v1\/)?receptions\/([^/]+)\/evidences$/);

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

    // 4. Ingesta de telemetría (TS-08)
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

    // 5. BC-07: Validar registro de recepción (US-09, uq_receptions_dispatch)
    if (isReceptionsPost) {
        const db = readDb(req);
        const body = req.body || {};
        const dispatchId = String(body.dispatchId || '').trim();

        if (dispatchId) {
            const existing = (db.receptions || []).find(r =>
                String(r.dispatchId || '').trim() === dispatchId
            );
            if (existing) {
                return res.status(409).json({
                    code: 'DISPATCH_ALREADY_RECEIVED',
                    title: 'Despacho ya recibido',
                    message: `El despacho ${dispatchId} ya cuenta con una recepción registrada (ID: ${existing.id}).`,
                    existingReceptionId: existing.id
                });
            }
        }

        // Generar ID correlativo si no viene provisto
        const newId = body.id || `RC-${String(105 + (db.receptions || []).length).padStart(3, '0')}`;
        const items = (body.items || []).map((item, idx) => ({
            id: item.id || `item-${newId}-${idx + 1}`,
            receptionId: newId,
            materialName: item.materialName || 'Material',
            dispatchedQuantity: Number(item.dispatchedQuantity) || 0,
            receivedQuantity: Number(item.receivedQuantity) || 0,
            unit: item.unit || 't',
            difference: Number((Number(item.dispatchedQuantity || 0) - Number(item.receivedQuantity || 0)).toFixed(3))
        }));

        const hasDiscrepancy = items.some(i => i.difference !== 0);
        const status = body.status || (hasDiscrepancy ? 'VERIFIED_DISCREPANT' : 'VERIFIED_CONFORMANT');

        const newReception = {
            id: newId,
            dispatchId: dispatchId,
            verifiedByUserId: body.verifiedByUserId || 'c0a80101-0000-0000-0000-000000000003',
            verifiedByUserName: body.verifiedByUserName || 'Juan Pérez',
            siteId: body.siteId || 'SITE-001',
            siteName: body.siteName || 'Obra Principal',
            origin: body.origin || 'Almacén Central',
            truckPlate: body.truckPlate || 'TR-001',
            driverName: body.driverName || 'Conductor asignado',
            deliveryGuideNumber: body.deliveryGuideNumber || `GR-${Math.floor(10000 + Math.random() * 90000)}`,
            arrivedAt: body.arrivedAt || new Date().toISOString(),
            closedAt: body.closedAt || new Date().toISOString(),
            status: status,
            observations: body.observations || '',
            checklist: body.checklist || {
                materialGoodCondition: true,
                quantityVerified: true,
                deliveryGuideReceived: true,
                photographicEvidence: false,
                observationsRecorded: false
            },
            items: items,
            evidences: body.evidences || []
        };

        if (!db.receptions) db.receptions = [];
        db.receptions.unshift(newReception);

        // Remover de llegadas pendientes si coincide
        if (db.upcomingArrivals) {
            db.upcomingArrivals = db.upcomingArrivals.filter(a => String(a.dispatchId || a.id) !== dispatchId);
        }

        persistDb(req, db);
        return res.status(201).json(newReception);
    }

    // 6. BC-07: Endpoint TS-04: Comparar cantidades de despacho contra recibidas
    if (isComparePost) {
        const receptionId = isComparePost[1];
        const db = readDb(req);
        const body = req.body || {};
        const reception = (db.receptions || []).find(r => String(r.id) === String(receptionId));

        if (!reception) {
            return res.status(404).json({ code: 'RECEPTION_NOT_FOUND', message: 'Recepción no encontrada.' });
        }

        const inputItems = body.items || [];
        let anyDiscrepancy = false;
        const comparedItems = (reception.items || []).map(item => {
            const matchedInput = inputItems.find(i => String(i.id) === String(item.id));
            const received = matchedInput ? Number(matchedInput.receivedQuantity) : item.receivedQuantity;
            const diff = Number((item.dispatchedQuantity - received).toFixed(3));
            if (diff !== 0) anyDiscrepancy = true;
            return {
                id: item.id,
                materialName: item.materialName,
                dispatchedQuantity: item.dispatchedQuantity,
                receivedQuantity: received,
                unit: item.unit,
                difference: diff,
                isConformant: diff === 0
            };
        });

        return res.status(200).json({
            receptionId: receptionId,
            isConformant: !anyDiscrepancy,
            hasDiscrepancy: anyDiscrepancy,
            items: comparedItems
        });
    }

    // 7. BC-07: Endpoint de verificación / cierre de recepción (US-09)
    if (isVerifyPost) {
        const receptionId = isVerifyPost[1];
        const db = readDb(req);
        const body = req.body || {};
        const receptionIndex = (db.receptions || []).findIndex(r => String(r.id) === String(receptionId));

        if (receptionIndex === -1) {
            return res.status(404).json({ code: 'RECEPTION_NOT_FOUND', message: 'Recepción no encontrada.' });
        }

        const reception = db.receptions[receptionIndex];
        if (body.items && Array.isArray(body.items)) {
            body.items.forEach(updatedItem => {
                const existingItem = reception.items.find(i => String(i.id) === String(updatedItem.id));
                if (existingItem) {
                    existingItem.receivedQuantity = Number(updatedItem.receivedQuantity) || 0;
                    existingItem.difference = Number((existingItem.dispatchedQuantity - existingItem.receivedQuantity).toFixed(3));
                }
            });
        }

        const hasDiscrepancy = (reception.items || []).some(i => i.difference !== 0) || (reception.evidences || []).length > 0;
        reception.status = body.status || (hasDiscrepancy ? 'VERIFIED_DISCREPANT' : 'VERIFIED_CONFORMANT');
        if (body.checklist) {
            reception.checklist = { ...reception.checklist, ...body.checklist };
        }
        if (body.observations !== undefined) {
            reception.observations = body.observations;
        }
        reception.closedAt = new Date().toISOString();

        persistDb(req, db);
        return res.status(200).json(reception);
    }

    // 8. BC-07: Endpoint de evidencias fotográficas (US-10)
    if (isEvidencesPost) {
        const receptionId = isEvidencesPost[1];
        const db = readDb(req);
        const body = req.body || {};
        const receptionIndex = (db.receptions || []).findIndex(r => String(r.id) === String(receptionId));

        if (receptionIndex === -1) {
            return res.status(404).json({ code: 'RECEPTION_NOT_FOUND', message: 'Recepción no encontrada.' });
        }

        const newEvidence = {
            id: `ev-${Date.now()}`,
            receptionId: receptionId,
            evidenceUrl: body.evidenceUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
            capturedAt: body.capturedAt || new Date().toISOString(),
            caption: body.caption || 'Evidencia fotográfica registrada en obra.',
            type: body.type || 'PHOTO'
        };

        if (!db.receptions[receptionIndex].evidences) {
            db.receptions[receptionIndex].evidences = [];
        }
        db.receptions[receptionIndex].evidences.push(newEvidence);
        db.receptions[receptionIndex].status = 'VERIFIED_DISCREPANT';
        db.receptions[receptionIndex].checklist.photographicEvidence = true;

        persistDb(req, db);
        return res.status(201).json(db.receptions[receptionIndex]);
    }

    next();
};
