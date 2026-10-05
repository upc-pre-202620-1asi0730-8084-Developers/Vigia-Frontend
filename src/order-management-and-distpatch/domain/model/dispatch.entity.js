import {DispatchItem} from "./dispatch-item.entity.js";

/**
 * Dispatch entity (scheduled departure of materials to a work) within the
 * Order Management and Dispatch bounded context.
 *
 * @class Dispatch
 */
export class Dispatch {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Dispatch identifier (e.g. DS-104).
     * @param {string} [params.projectName=''] - Destination work.
     * @param {string} [params.departureDate=''] - Departure date.
     * @param {string} [params.estimatedTime=''] - Estimated departure time.
     * @param {?string} [params.relatedOrderId=null] - Related approved order.
     * @param {string} [params.dispatchType='DEPARTURE_TO_WORK'] - Dispatch type.
     * @param {string} [params.priority='AVERAGE'] - Dispatch priority.
     * @param {string} [params.status='IN_PREPARATION'] - Dispatch status.
     * @param {string} [params.createdBy=''] - Creator name.
     * @param {string} [params.createdAt=''] - Creation timestamp.
     * @param {string} [params.observations=''] - General observations.
     * @param {DispatchItem[]} [params.items=[]] - Dispatched material lines.
     * @param {?string} [params.transportId=null] - Assigned truck, if any.
     */
    constructor({ id = null, projectName = '', departureDate = '', estimatedTime = '', relatedOrderId = null,
                  dispatchType = 'DEPARTURE_TO_WORK', priority = 'AVERAGE', status = 'IN_PREPARATION',
                  createdBy = '', createdAt = '', observations = '', items = [], transportId = null }) {
        this.id = id;
        this.projectName = projectName;
        this.departureDate = departureDate;
        this.estimatedTime = estimatedTime;
        this.relatedOrderId = relatedOrderId;
        this.dispatchType = dispatchType;
        this.priority = priority;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.observations = observations;
        this.items = items.map(item => item instanceof DispatchItem ? item : new DispatchItem({...item}));
        this.transportId = transportId;
    }
}
