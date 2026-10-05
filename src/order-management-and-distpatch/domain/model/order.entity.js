/**
 * Aggregate Root: Order — solicitud de materiales emitida desde una obra.
 * Agrupa sus OrderItem y el historial de decisiones del almacén.
 */
export class Order {
    constructor({
                    id,
                    projectName,
                    requesterName,
                    status,
                    priority,
                    date,
                    mainMaterial,
                    items = [],
                    observations = '',
                    attachedFiles = [],
                    timeline = []
                }) {
        this.id = id;
        this.projectName = projectName;
        this.requesterName = requesterName;
        this.status = status;
        this.priority = priority;
        this.date = date;
        this.mainMaterial = mainMaterial;
        this.items = items;
        this.observations = observations;
        this.attachedFiles = attachedFiles;
        this.timeline = timeline;
    }

    /** Cantidad total solicitada (suma de las líneas OrderItem). */
    get totalQuantity() {
        return this.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }
}
