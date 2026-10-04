import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';
const WEB_BASE = 'http://localhost:5173';

async function runTests() {
  console.log('====================================================');
  console.log('  INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS - VIGÍA  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [OK] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Verificar Frontend Vite
  try {
    const webRes = await axios.get(WEB_BASE);
    assert(webRes.status === 200, `Frontend Vite está activo en ${WEB_BASE} (HTTP 200)`);
    assert(webRes.data.includes('<div id="app"></div>'), 'Frontend entrega el contenedor de montaje #app');
    assert(webRes.data.includes('Vigía - Trazza Labs'), 'Frontend tiene el título y metadatos correctos de Vigía');
  } catch (e) {
    assert(false, `No se pudo conectar al Frontend Vite: ${e.message}`);
  }

  // 2. Verificar Mock API: Listado de unidades (US-18)
  try {
    const res = await axios.get(`${API_BASE}/vehicles`);
    assert(res.status === 200, `GET /vehicles responde HTTP 200`);
    assert(Array.isArray(res.data) && res.data.length >= 3, `Se obtuvieron ${res.data.length} unidades registradas en la flota`);
    const paired = res.data.find(v => v.gpsDeviceId);
    const unpaired = res.data.find(v => !v.gpsDeviceId);
    assert(!!paired, `Existe unidad vinculada a GPS: ${paired?.licensePlate} (${paired?.gpsDeviceId})`);
    assert(!!unpaired, `Existe unidad sin dispositivo GPS: ${unpaired?.licensePlate}`);
  } catch (e) {
    assert(false, `Error en GET /vehicles: ${e.message}`);
  }

  // 3. Probar registro de nueva unidad (US-18)
  const testPlate = `TEST-${Math.floor(100 + Math.random() * 900)}`;
  try {
    const res = await axios.post(`${API_BASE}/vehicles`, {
      companyId: "c0a80101-0000-0000-0000-000000000001",
      licensePlate: testPlate,
      brand: "Scania",
      model: "R500",
      maxCapacityTons: 34
    });
    assert(res.status === 201, `POST /vehicles registra unidad ${testPlate} con HTTP 201`);
    assert(res.data.licensePlate === testPlate, `La unidad registrada conserva la placa ${testPlate}`);
  } catch (e) {
    assert(false, `Error registrando vehículo: ${e.message}`);
  }

  // 4. Probar rechazo de placa duplicada (409)
  try {
    await axios.post(`${API_BASE}/vehicles`, {
      companyId: "c0a80101-0000-0000-0000-000000000001",
      licensePlate: testPlate,
      brand: "Scania",
      model: "R500",
      maxCapacityTons: 34
    });
    assert(false, 'Debería haber rechazado la placa duplicada');
  } catch (e) {
    assert(e.response?.status === 409, `POST /vehicles con placa duplicada ${testPlate} responde HTTP 409 Conflict`);
    assert(e.response?.data?.code === 'PLATE_ALREADY_REGISTERED', `Código de error de placa duplicada: PLATE_ALREADY_REGISTERED`);
  }

  // 5. Probar rechazo de vinculación GPS cuando el dispositivo ya está asignado a otra unidad (US-18: 409)
  try {
    // Intentar vincular GPS-TR-001 (que ya pertenece a V3B-920) a la unidad id 3
    await axios.post(`${API_BASE}/vehicles/3/gps-device`, {
      gpsDeviceId: "GPS-TR-001"
    });
    assert(false, 'Debería haber rechazado el GPS ya asignado');
  } catch (e) {
    assert(e.response?.status === 409, `POST /vehicles/3/gps-device con GPS ya asignado responde HTTP 409 Conflict`);
    assert(e.response?.data?.code === 'DEVICE_ALREADY_ASSIGNED', `Código de conflicto: DEVICE_ALREADY_ASSIGNED`);
    assert(e.response?.data?.assignedLicensePlate === 'V3B-920', `Indica explícitamente que ya pertenece a la unidad: ${e.response?.data?.assignedLicensePlate}`);
  }

  // 6. Probar listado de geocercas (US-19)
  try {
    const res = await axios.get(`${API_BASE}/geofences`);
    assert(res.status === 200, `GET /geofences responde HTTP 200`);
    assert(Array.isArray(res.data) && res.data.length >= 2, `Se obtuvieron ${res.data.length} geocercas definidas`);
    const wh = res.data.find(g => g.type === 'WAREHOUSE');
    const js = res.data.find(g => g.type === 'JOB_SITE');
    assert(!!wh, `Geocerca de almacén presente: ${wh?.name} (radio: ${wh?.radiusMeters}m)`);
    assert(!!js, `Geocerca de obra presente: ${js?.name} (radio: ${js?.radiusMeters}m)`);
  } catch (e) {
    assert(false, `Error en GET /geofences: ${e.message}`);
  }

  // 7. Probar rechazo de geocerca duplicada para el mismo predio (US-19: 409)
  try {
    await axios.post(`${API_BASE}/geofences`, {
      companyId: "c0a80101-0000-0000-0000-000000000001",
      siteId: "11111111-1111-1111-1111-111111111111", // Mismo siteId del almacén Lurín
      name: "Geocerca duplicada",
      type: "WAREHOUSE",
      centerPoint: { latitude: -12.2741, longitude: -76.8715 },
      radiusMeters: 300
    });
    assert(false, 'Debería haber rechazado la geocerca duplicada');
  } catch (e) {
    assert(e.response?.status === 409, `POST /geofences para predio ya geocercado responde HTTP 409 Conflict`);
    assert(e.response?.data?.code === 'SITE_ALREADY_HAS_GEOFENCE', `Código de conflicto: SITE_ALREADY_HAS_GEOFENCE`);
  }

  // 8. Probar ingesta de telemetría de dispositivo no vinculado (TS-08)
  try {
    const res = await axios.post(`${API_BASE}/telemetry/reports`, {
      gpsDeviceId: "GPS-DISCONNECTED-777",
      latitude: -12.085,
      longitude: -77.045,
      timestamp: new Date().toISOString()
    });
    assert(res.status === 200, `POST /telemetry/reports para dispositivo no vinculado responde HTTP 200 (TS-08)`);
  } catch (e) {
    assert(false, `Error en webhook de telemetría: ${e.message}`);
  }

  // 9. Verificar que el evento no asociado fue auditado
  try {
    const res = await axios.get(`http://localhost:3000/unassociatedTelemetryEvents`);
    const event = res.data.find(e => e.gpsDeviceId === 'GPS-DISCONNECTED-777');
    assert(!!event, `El evento no asociado de GPS-DISCONNECTED-777 fue registrado para auditoría (TS-08)`);
  } catch (e) {
    assert(false, `Error consultando eventos no asociados: ${e.message}`);
  }

  // 10. BC-07: Listado de recepciones registradas en obra
  try {
    const res = await axios.get(`${API_BASE}/receptions`);
    assert(res.status === 200, `GET /receptions responde HTTP 200 con listado de recepciones (BC-07)`);
    assert(Array.isArray(res.data) && res.data.length >= 5, `Se obtuvieron ${res.data.length} recepciones registradas en base de datos`);
    const found102 = res.data.find(r => r.id === 'RC-102');
    assert(!!found102, `Existe recepción destacada RC-102 en el sistema`);
    assert(found102?.status === 'VERIFIED_DISCREPANT', `RC-102 se encuentra en estado VERIFIED_DISCREPANT`);
  } catch (e) {
    assert(false, `Error en GET /receptions: ${e.message}`);
  }

  // 11. BC-07: Listado de despachos próximos en tránsito (Upcoming Arrivals)
  try {
    const res = await axios.get(`${API_BASE}/upcoming-arrivals`);
    assert(res.status === 200, `GET /upcoming-arrivals responde HTTP 200 con despachos en tránsito`);
    assert(Array.isArray(res.data) && res.data.length >= 2, `Existen ${res.data.length} despachos próximos en tránsito`);
  } catch (e) {
    assert(false, `Error en GET /upcoming-arrivals: ${e.message}`);
  }

  // 12. BC-07: Cotejo de cantidades con cálculo de diferencia (TS-04)
  try {
    const res = await axios.post(`${API_BASE}/receptions/RC-102/compare`, {
      items: [
        { id: "item-102-1", receivedQuantity: 22 }
      ]
    });
    assert(res.status === 200, `POST /receptions/RC-102/compare responde HTTP 200 (TS-04)`);
    assert(res.data.hasDiscrepancy === true, `El endpoint TS-04 detecta faltante de 2 toneladas correctamente`);
    assert(res.data.items[0].difference === 2, `Diferencia calculada correctamente como 2 toneladas`);
  } catch (e) {
    assert(false, `Error en TS-04 compareQuantities: ${e.message}`);
  }

  // 13. BC-07: Registro de evidencia fotográfica (US-10)
  try {
    const res = await axios.post(`${API_BASE}/receptions/RC-102/evidences`, {
      evidenceUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600",
      caption: "Fotografía de prueba de faltante en tolva",
      type: "PHOTO"
    });
    assert(res.status === 201, `POST /receptions/RC-102/evidences registra evidencia con HTTP 201 (US-10)`);
    assert(res.data.status === 'VERIFIED_DISCREPANT', `La recepción se conserva en estado VERIFIED_DISCREPANT tras adjuntar foto`);
    assert(res.data.evidences.length >= 1, `La recepción contiene ${res.data.evidences.length} evidencias fotográficas registradas`);
  } catch (e) {
    assert(false, `Error en US-10 addEvidence: ${e.message}`);
  }

  // 14. BC-07: Registro de nueva recepción física en obra (US-09)
  const testDispatch = `DES-TEST-${Math.floor(100 + Math.random() * 900)}`;
  try {
    const res = await axios.post(`${API_BASE}/receptions`, {
      dispatchId: testDispatch,
      siteName: "Torre A",
      origin: "Cemex Plant",
      truckPlate: "TR-999",
      deliveryGuideNumber: "GR-99999",
      items: [
        { materialName: "Cemento Portland", dispatchedQuantity: 50, receivedQuantity: 50, unit: "sacks" }
      ]
    });
    assert(res.status === 201, `POST /receptions crea nueva recepción para despacho ${testDispatch} con HTTP 201`);
    assert(res.data.status === 'VERIFIED_CONFORMANT', `La recepción sin diferencias queda en estado VERIFIED_CONFORMANT`);
  } catch (e) {
    assert(false, `Error creando recepción: ${e.message}`);
  }

  // 15. BC-07: Restricción uq_receptions_dispatch (Rechazar despacho duplicado con HTTP 409)
  try {
    await axios.post(`${API_BASE}/receptions`, {
      dispatchId: testDispatch,
      siteName: "Torre A"
    });
    assert(false, `Debería fallar con HTTP 409 al registrar el mismo despacho por segunda vez`);
  } catch (e) {
    assert(e.response && e.response.status === 409, `Se rechaza despacho duplicado ${testDispatch} con HTTP 409 (uq_receptions_dispatch)`);
  }

  // 16. BC-07: Cierre y verificación de recepción en obra (US-09)
  try {
    const res = await axios.post(`${API_BASE}/receptions/RC-104/verify`, {
      status: "VERIFIED_CONFORMANT",
      observations: "Verificación de cierre conforme en obra."
    });
    assert(res.status === 200, `POST /receptions/RC-104/verify confirma recepción con HTTP 200 (US-09)`);
    assert(res.data.status === 'VERIFIED_CONFORMANT', `Estado de RC-104 confirmado como VERIFIED_CONFORMANT`);
  } catch (e) {
    assert(false, `Error en verifyReception: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log(`  RESULTADO: ${passed} pruebas exitosas, ${failed} fallidas`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
