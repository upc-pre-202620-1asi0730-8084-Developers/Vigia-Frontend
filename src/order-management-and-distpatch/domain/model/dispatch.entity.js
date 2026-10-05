/**
 * Aggregate Root: Dispatch — salida programada de materiales hacia una obra.
 * Puede originarse a partir de una Order aprobada (relatedOrderId).
 */
export class Dispatch {
    constructor({
                    id,
                    projectName,
                    siteId,
                    address,
                    departureDate,
                    estimatedTime,
                    relatedOrderId = null,
                    dispatchType,
                    priority,
                    status,
                    createdBy,
                    createdAt,
                    internalReference = '',
                    observations = '',
                    items = [],
                    transportId = null,
                    transportPlate = null,
                    driverName = null,
                    timeline = []
                }) {
        this.id = id;
        this.projectName = projectName;
        this.siteId = siteId;
        this.address = address;
        this.departureDate = departureDate;
        this.estimatedTime = estimatedTime;
        this.relatedOrderId = relatedOrderId;
        this.dispatchType = dispatchType;
        this.priority = priority;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.internalReference = internalReference;
        this.observations = observations;
        this.items = items;
        this.transportId = transportId;
        this.transportPlate = transportPlate;
        this.driverName = driverName;
        this.timeline = timeline;
    }

    /** Indica si el despacho ya tiene una unidad de transporte asignada. */
    get hasTransport() {
        return Boolean(this.transportId);
    }
}
